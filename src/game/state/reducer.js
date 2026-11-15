/**
 * The single source of truth for game logic.
 *
 * Every action carries `now` (ms timestamp) so the reducer stays pure: timers are
 * stored as absolute timestamps and the UI derives progress from them. That also
 * means crops keep growing while the tab is closed.
 *
 * Handlers mutate a structuredClone()'d draft and return `false` to reject the
 * action, in which case the previous state object is returned untouched.
 */
import { BUILDINGS, CLIENTS, CROPS, RECIPES, MAX_LEVEL, REP_LEVEL_GIFT, xpForLevel, levelUpCoins, orderSlotsFor } from '../config/index.js'
import { makeRng } from '../engine/rng.js'
import { generateOrder } from '../engine/orders.js'
import { createBuilding } from './initialState.js'
import { expandedLand } from '../engine/grid.js'
import * as rules from './rules.js'
import { orderReward, repInfo, repLevel, skipPenalty } from './reputation.js'
import * as help from './help.js'

const KEEP = 50 // how many help ids to remember

const ORDER_REFILL_MS = 4_000
const ORDER_DISCARD_MS = 30_000

const newId = (s, prefix) => `${prefix}${s.nextId++}`

function addItem(s, id, qty) {
  s.inventory[id] = (s.inventory[id] ?? 0) + qty
  if (s.inventory[id] <= 0) delete s.inventory[id]
}

function withRng(s, fn) {
  const rng = makeRng(s.rngSeed)
  const result = fn(rng)
  s.rngSeed = rng.seed()
  return result
}

function makeOrder(s, now, delayMs, replacing = null) {
  const ownedTypes = new Set(Object.values(s.buildings).map((b) => b.type))
  const busy = s.orders.filter((o) => o.id !== replacing).map((o) => o.client)
  return withRng(s, (rng) => generateOrder({ level: s.level, rng, id: newId(s, 'o'), now, delayMs, ownedTypes, busy }))
}

function addRep(s, clientId, amount) {
  const rep = (s.reputation[clientId] ??= { xp: 0, orders: 0 })
  const before = repLevel(rep.xp)
  rep.xp = Math.max(0, rep.xp + amount)
  const after = repLevel(rep.xp)
  for (let lvl = before + 1; lvl <= after; lvl++) {
    const gift = REP_LEVEL_GIFT[lvl] ?? 0
    const booster = CLIENTS[clientId].booster
    s.boosters[booster] = (s.boosters[booster] ?? 0) + gift
    s.pendingRepUps.push({ client: clientId, level: lvl, gift: { [booster]: gift } })
  }
}

function syncOrderSlots(s, now) {
  while (s.orders.length < orderSlotsFor(s.level)) s.orders.push(makeOrder(s, now, ORDER_REFILL_MS))
}

function addXp(s, amount, now) {
  s.xp += amount
  while (s.level < MAX_LEVEL && s.xp >= xpForLevel(s.level + 1)) {
    s.level += 1
    s.coins += levelUpCoins(s.level)
    s.pendingLevelUps.push(s.level)
  }
  syncOrderSlots(s, now)
}

const handlers = {
  PLACE_BUILDING(s, { buildingType, x, y, now }) {
    const check = rules.canPlace(s, buildingType, x, y)
    if (!check.ok) return false
    s.coins -= check.cost
    const id = newId(s, 'b')
    s.buildings[id] = createBuilding(buildingType, id, x, y, now)
    addXp(s, BUILDINGS[buildingType].xp, now)
  },

  MOVE_BUILDING(s, { id, x, y }) {
    if (!rules.canMove(s, id, x, y).ok) return false
    Object.assign(s.buildings[id], { x, y })
  },

  PLANT(s, { fieldId, cropId, now }) {
    if (!rules.canPlant(s, fieldId, cropId).ok) return false
    const crop = CROPS[cropId]
    s.coins -= crop.seedCost
    Object.assign(s.buildings[fieldId], { crop: cropId, plantedAt: now, readyAt: now + crop.growSeconds * 1000 })
  },

  HARVEST(s, { fieldId, now }) {
    if (!rules.canHarvest(s, fieldId, now).ok) return false
    const field = s.buildings[fieldId]
    const crop = CROPS[field.crop]
    addItem(s, crop.id, crop.yield)
    Object.assign(field, { crop: null, plantedAt: 0, readyAt: 0 })
    s.stats.harvests += 1
    addXp(s, crop.xp, now)
  },

  QUEUE_PRODUCTION(s, { buildingId, recipeId, now }) {
    if (!rules.canQueue(s, buildingId, recipeId).ok) return false
    const recipe = RECIPES[recipeId]
    const b = s.buildings[buildingId]
    for (const [id, qty] of Object.entries(recipe.inputs)) addItem(s, id, -qty)
    const last = b.jobs[b.jobs.length - 1]
    const startAt = Math.max(now, last?.readyAt ?? 0)
    b.jobs.push({ recipe: recipeId, startAt, readyAt: startAt + recipe.seconds * 1000 })
  },

  COLLECT_PRODUCTION(s, { buildingId, now }) {
    if (!rules.canCollect(s, buildingId, now).ok) return false
    const b = s.buildings[buildingId]
    const done = rules.finishedJobs(b, now)
    b.jobs = b.jobs.filter((j) => j.readyAt > now)
    let xp = 0
    for (const job of done) {
      addItem(s, job.recipe, RECIPES[job.recipe].yield ?? 1)
      xp += RECIPES[job.recipe].xp
    }
    addXp(s, xp, now)
  },

  COLLECT_RENT(s, { buildingId, now }) {
    if (!rules.canCollectRent(s, buildingId, now).ok) return false
    const b = s.buildings[buildingId]
    const { coins, periods, capped } = rules.rentDue(b, now)
    const rent = BUILDINGS[b.type].rent
    s.coins += coins
    b.rentFrom = capped ? now : b.rentFrom + periods * rent.everySeconds * 1000
  },

  FULFILL_ORDER(s, { orderId, now, useVouchers = false }) {
    const check = rules.canFulfill(s, orderId, now, useVouchers)
    if (!check.ok) return false
    const idx = s.orders.findIndex((o) => o.id === orderId)
    const order = s.orders[idx]
    const reward = orderReward(s, order)
    for (const { id, qty } of order.items) addItem(s, id, -Math.min(qty, s.inventory[id] ?? 0))
    s.boosters.voucher -= check.vouchers
    s.coins += reward.coins
    s.stats.ordersCompleted += 1

    // Loyalty gifts are based on the level you had when the order was placed.
    const { perks } = repInfo(s, order.client)
    addRep(s, order.client, reward.rep)
    const rep = s.reputation[order.client]
    rep.orders += 1
    if (perks.giftEvery && rep.orders % perks.giftEvery === 0) {
      const booster = CLIENTS[order.client].booster
      s.boosters[booster] = (s.boosters[booster] ?? 0) + 1
    }

    s.orders[idx] = makeOrder(s, now, ORDER_REFILL_MS, orderId)
    addXp(s, reward.xp, now)
  },

  DISCARD_ORDER(s, { orderId, now }) {
    const idx = s.orders.findIndex((o) => o.id === orderId)
    if (idx < 0 || s.orders[idx].availableAt > now) return false
    const penalty = skipPenalty(s, s.orders[idx])
    if (penalty > 0) addRep(s, s.orders[idx].client, -penalty)
    s.orders[idx] = makeOrder(s, now, ORDER_DISCARD_MS, orderId)
  },

  USE_TONIC(s, { fieldId, now }) {
    if (!rules.canUseTonic(s, fieldId, now).ok) return false
    s.boosters.tonic -= 1
    s.buildings[fieldId].readyAt = now
  },

  USE_RUSH(s, { buildingId, now }) {
    if (!rules.canRush(s, buildingId, now).ok) return false
    const b = s.buildings[buildingId]
    s.boosters.rush -= 1
    if (b.jobs) {
      // Finish the job in progress and pull the rest of the queue forward.
      const i = b.jobs.findIndex((j) => j.readyAt > now)
      const saved = b.jobs[i].readyAt - now
      b.jobs[i].readyAt = now
      for (const j of b.jobs.slice(i + 1)) {
        j.startAt -= saved
        j.readyAt -= saved
      }
    } else {
      const def = rules.animalOf(b)
      for (const a of b.animals) if (rules.animalStatus(a, def, now) === 'producing') a.fedAt = now - def.seconds * 1000
    }
  },

  SET_NAME(s, { name }) {
    const clean = String(name ?? '').trim().slice(0, 24)
    if (!clean || clean === s.profile.name) return false
    s.profile.name = clean
  },

  /** `request` is built by the UI (it needs a random id and goes straight into a link). */
  CREATE_HELP_REQUEST(s, { request, now }) {
    if (!help.canAskForHelp(s, request.orderId, now).ok) return false
    const order = s.orders.find((o) => o.id === request.orderId)
    const items = help.missingItems(s, order)
    // Replace any earlier open request for the same order.
    s.helpRequests = s.helpRequests.filter((r) => !(r.orderId === order.id && r.status === 'open'))
    s.helpRequests.push({ id: request.id, orderId: order.id, client: order.client, items, createdAt: now, status: 'open' })
    s.helpRequests = s.helpRequests.slice(-KEEP)
  },

  /** `giftId` comes from the UI so the delivery link can be built right away. */
  SEND_HELP(s, { request, giftId, now }) {
    if (!help.canSendHelp(s, request).ok || !giftId) return false
    for (const { id, qty } of request.items) addItem(s, id, -qty)
    const reward = help.helperReward(request.items)
    s.coins += reward.coins
    const gift = { id: giftId, req: request.id, to: request.from.id, toName: request.from.name ?? '', items: request.items, at: now }
    s.sentGifts = [...s.sentGifts, gift].slice(-KEEP)
    s.stats.helpsGiven = (s.stats.helpsGiven ?? 0) + 1
    addXp(s, reward.xp, now)
  },

  ACCEPT_GIFT(s, { gift }) {
    if (!help.canAcceptGift(s, gift).ok) return false
    for (const { id, qty } of gift.items) addItem(s, id, qty)
    s.helpRequests.find((r) => r.id === gift.req).status = 'received'
    s.redeemed = [...s.redeemed, gift.id].slice(-KEEP)
    s.stats.helpsReceived = (s.stats.helpsReceived ?? 0) + 1
  },

  DISMISS_REP_UP(s) {
    if (!s.pendingRepUps.length) return false
    s.pendingRepUps.shift()
  },

  FEED_ANIMALS(s, { buildingId, now }) {
    if (!rules.canFeed(s, buildingId, now).ok) return false
    const b = s.buildings[buildingId]
    const def = rules.animalOf(b)
    for (const animal of b.animals) {
      if ((s.inventory[def.feed] ?? 0) < 1) break
      if (rules.animalStatus(animal, def, now) !== 'hungry') continue
      addItem(s, def.feed, -1)
      animal.fedAt = now
    }
  },

  COLLECT_ANIMALS(s, { buildingId, now }) {
    if (!rules.canCollectAnimals(s, buildingId, now).ok) return false
    const b = s.buildings[buildingId]
    const def = rules.animalOf(b)
    let n = 0
    for (const animal of b.animals) {
      if (rules.animalStatus(animal, def, now) !== 'ready') continue
      animal.fedAt = 0
      n += 1
    }
    addItem(s, def.product.id, n)
    addXp(s, def.product.xp * n, now)
  },

  BUY_ANIMAL(s, { buildingId }) {
    const check = rules.canBuyAnimal(s, buildingId)
    if (!check.ok) return false
    s.coins -= check.cost
    s.buildings[buildingId].animals.push({ fedAt: 0 })
  },

  EXPAND_LAND(s) {
    if (!rules.canExpand(s).ok) return false
    const exp = rules.nextExpansion(s)
    s.coins -= exp.cost
    s.expansions += 1
    s.grid.land = expandedLand(s.grid)
  },

  DISMISS_LEVEL_UP(s) {
    if (!s.pendingLevelUps.length) return false
    s.pendingLevelUps.shift()
  },

  RESET(_s, { state }) {
    return state
  },
}

export function gameReducer(state, action) {
  const handler = handlers[action.type]
  if (!handler) return state
  const draft = structuredClone(state)
  const result = handler(draft, action)
  if (result === false) return state
  return result ?? draft
}
