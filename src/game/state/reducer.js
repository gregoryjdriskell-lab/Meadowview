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
import { BUILDINGS, CROPS, RECIPES, MAX_LEVEL, xpForLevel, levelUpCoins, orderSlotsFor } from '../config/index.js'
import { makeRng } from '../engine/rng.js'
import { generateOrder } from '../engine/orders.js'
import { createBuilding } from './initialState.js'
import * as rules from './rules.js'

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

function makeOrder(s, now, delayMs) {
  return withRng(s, (rng) => generateOrder({ level: s.level, rng, id: newId(s, 'o'), now, delayMs }))
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

  FULFILL_ORDER(s, { orderId, now }) {
    if (!rules.canFulfill(s, orderId, now).ok) return false
    const idx = s.orders.findIndex((o) => o.id === orderId)
    const order = s.orders[idx]
    for (const { id, qty } of order.items) addItem(s, id, -qty)
    s.coins += order.coins
    s.stats.ordersCompleted += 1
    s.orders[idx] = makeOrder(s, now, ORDER_REFILL_MS)
    addXp(s, order.xp, now)
  },

  DISCARD_ORDER(s, { orderId, now }) {
    const idx = s.orders.findIndex((o) => o.id === orderId)
    if (idx < 0 || s.orders[idx].availableAt > now) return false
    s.orders[idx] = makeOrder(s, now, ORDER_DISCARD_MS)
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
    s.grid.unlockedRows = Math.min(s.grid.rows, s.grid.unlockedRows + exp.rows)
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
