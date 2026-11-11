/**
 * Validation rules shared by the reducer (authoritative) and the UI
 * (to disable buttons and explain why). Each returns { ok, reason }.
 */
import { ANIMALS, BUILDINGS, CROPS, RECIPES, LAND_EXPANSIONS, animalCostFor, costFor, isFactory, isHousing, isPen } from '../config/index.js'
import { countOf, isAreaFree, sizeOf } from '../engine/grid.js'

const ok = { ok: true }
const no = (reason) => ({ ok: false, reason })

export const hasItems = (state, inputs, times = 1) =>
  Object.entries(inputs).every(([id, qty]) => (state.inventory[id] ?? 0) >= qty * times)

export function canBuy(state, type) {
  const def = BUILDINGS[type]
  if (!def || def.buyable === false) return no('Not for sale')
  if (state.level < def.unlockLevel) return no(`Unlocks at level ${def.unlockLevel}`)
  const owned = countOf(state, type)
  if (owned >= def.maxCount(state.level)) return no('Limit reached for your level')
  const cost = costFor(type, owned)
  if (state.coins < cost) return no(`Need ${cost} coins`)
  return { ok: true, cost }
}

export function canPlace(state, type, x, y) {
  const buy = canBuy(state, type)
  if (!buy.ok) return buy
  const [w, h] = sizeOf(type)
  if (!isAreaFree(state, x, y, w, h)) return no('That spot is taken')
  return buy
}

export function canMove(state, id, x, y) {
  const b = state.buildings[id]
  if (!b) return no('Missing building')
  const [w, h] = sizeOf(b.type)
  if (!isAreaFree(state, x, y, w, h, id)) return no('That spot is taken')
  return ok
}

export function canPlant(state, fieldId, cropId) {
  const field = state.buildings[fieldId]
  const crop = CROPS[cropId]
  if (!field || field.type !== 'field') return no('Not a field')
  if (!crop) return no('Unknown crop')
  if (field.crop) return no('Field is busy')
  if (state.level < crop.unlockLevel) return no(`Unlocks at level ${crop.unlockLevel}`)
  if (state.coins < crop.seedCost) return no(`Seeds cost ${crop.seedCost} coins`)
  return ok
}

export function fieldStatus(field, now) {
  if (!field.crop) return 'empty'
  return now >= field.readyAt ? 'ripe' : 'growing'
}

export function canHarvest(state, fieldId, now) {
  const field = state.buildings[fieldId]
  if (!field || field.type !== 'field') return no('Not a field')
  if (fieldStatus(field, now) !== 'ripe') return no('Not ready yet')
  return ok
}

export function canQueue(state, buildingId, recipeId) {
  const b = state.buildings[buildingId]
  const recipe = RECIPES[recipeId]
  if (!b || !isFactory(b.type)) return no('Not a factory')
  if (!recipe || recipe.building !== b.type) return no('Wrong factory')
  if (state.level < recipe.unlockLevel) return no(`Unlocks at level ${recipe.unlockLevel}`)
  if (b.jobs.length >= BUILDINGS[b.type].queueSlots) return no('Queue is full')
  if (!hasItems(state, recipe.inputs)) return no('Missing ingredients')
  return ok
}

export const finishedJobs = (b, now) => (b.jobs ?? []).filter((j) => j.readyAt <= now)

export function canCollect(state, buildingId, now) {
  const b = state.buildings[buildingId]
  if (!b || !isFactory(b.type)) return no('Not a factory')
  if (finishedJobs(b, now).length === 0) return no('Nothing ready')
  return ok
}

/** Coins currently waiting at a house, and how many full rent periods that is. */
export function rentDue(b, now) {
  const rent = BUILDINGS[b.type]?.rent
  if (!rent) return { coins: 0, periods: 0 }
  const elapsed = Math.floor((now - b.rentFrom) / (rent.everySeconds * 1000))
  const periods = Math.max(0, Math.min(elapsed, rent.maxPeriods))
  return { coins: periods * rent.coins, periods, capped: elapsed >= rent.maxPeriods }
}

export function canCollectRent(state, buildingId, now) {
  const b = state.buildings[buildingId]
  if (!b || !isHousing(b.type)) return no('Not a home')
  if (rentDue(b, now).coins <= 0) return no('No rent yet')
  return ok
}

export function canFulfill(state, orderId, now) {
  const order = state.orders.find((o) => o.id === orderId)
  if (!order) return no('Order not found')
  if (order.availableAt > now) return no('Order is on its way')
  const missing = order.items.filter(({ id, qty }) => (state.inventory[id] ?? 0) < qty)
  if (missing.length) return no('Missing items')
  return ok
}

export function nextExpansion(state) {
  return LAND_EXPANSIONS[state.expansions] ?? null
}

export function canExpand(state) {
  const exp = nextExpansion(state)
  if (!exp) return no('All land unlocked')
  if (state.level < exp.unlockLevel) return no(`Unlocks at level ${exp.unlockLevel}`)
  if (state.coins < exp.cost) return no(`Need ${exp.cost} coins`)
  return ok
}

// ── Animals ──────────────────────────────────────────────

export const animalOf = (b) => ANIMALS[BUILDINGS[b.type]?.animal]

/** 'hungry' (waiting for feed) | 'producing' | 'ready' (product waiting) */
export function animalStatus(animal, def, now) {
  if (!animal.fedAt) return 'hungry'
  return now >= animal.fedAt + def.seconds * 1000 ? 'ready' : 'producing'
}

export function penSummary(b, now) {
  const def = animalOf(b)
  const counts = { hungry: 0, producing: 0, ready: 0 }
  for (const a of b.animals ?? []) counts[animalStatus(a, def, now)] += 1
  return counts
}

export function canFeed(state, buildingId, now) {
  const b = state.buildings[buildingId]
  if (!b || !isPen(b.type)) return no('Not an animal pen')
  const def = animalOf(b)
  if (penSummary(b, now).hungry === 0) return no('Everyone is fed')
  if ((state.inventory[def.feed] ?? 0) < 1) return no('No feed. Make some at the Feed Mill')
  return ok
}

export function canCollectAnimals(state, buildingId, now) {
  const b = state.buildings[buildingId]
  if (!b || !isPen(b.type)) return no('Not an animal pen')
  if (penSummary(b, now).ready === 0) return no('Nothing to collect')
  return ok
}

export function canBuyAnimal(state, buildingId) {
  const b = state.buildings[buildingId]
  if (!b || !isPen(b.type)) return no('Not an animal pen')
  const def = BUILDINGS[b.type]
  if (b.animals.length >= def.maxAnimals) return no('This pen is full')
  const cost = animalCostFor(b.type, b.animals.length)
  if (state.coins < cost) return no(`Need ${cost} coins`)
  return { ok: true, cost }
}
