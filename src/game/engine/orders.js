import { ITEMS, BUILDINGS, RECIPES, ANIMALS, CLIENTS } from '../config/index.js'

/**
 * Can the player make this item with what they own right now?
 * Crops need fields, animal goods need the right pen, products need their factory.
 */
export function canProduce(itemId, ownedTypes) {
  const item = ITEMS[itemId]
  if (!item) return false
  if (item.category === 'crop') return ownedTypes.has('field')
  if (item.category === 'animal') {
    return Object.values(BUILDINGS).some((b) => b.animal && ANIMALS[b.animal].product.id === itemId && ownedTypes.has(b.id))
  }
  return ownedTypes.has(RECIPES[itemId]?.building)
}

/** Items a client could fairly ask for: unlocked, orderable, and producible. */
export function clientPool(client, level, ownedTypes) {
  return client.wants.map((id) => ITEMS[id]).filter((i) => i.orderable && i.unlockLevel <= level && canProduce(i.id, ownedTypes))
}

/** Businesses that can place orders right now. */
export function activeClients(level, ownedTypes) {
  return Object.values(CLIENTS).filter((c) => c.unlockLevel <= level && clientPool(c, level, ownedTypes).length > 0)
}

/** Reputation XP an order is worth: bigger orders build more trust. */
export const repXpFor = (order) => Math.min(20, 6 + order.items.reduce((n, i) => n + i.qty, 0))

/**
 * Builds a new order from one business. Pure given `rng`.
 * `busy` lists clients already on the board, so the board stays varied.
 */
export function generateOrder({ level, rng, id, now, delayMs = 0, ownedTypes, busy = [] }) {
  const clients = activeClients(level, ownedTypes)
  const weighted = clients.flatMap((c) => Array(busy.includes(c.id) ? 1 : 3).fill(c))
  const client = weighted[rng.int(weighted.length)] ?? CLIENTS.market
  const pool = clientPool(client, level, ownedTypes)
  const fallback = pool.length ? pool : [ITEMS.wheat]

  const maxKinds = level < 2 ? 1 : level < 4 ? 2 : 3
  const kinds = Math.min(fallback.length, 1 + rng.int(maxKinds))
  // Bias towards the newest unlocks so fresh content shows up quickly.
  const bag = fallback.flatMap((item) => Array(item.unlockLevel === level ? 2 : 1).fill(item))
  const picked = []
  while (picked.length < kinds) {
    const item = bag[rng.int(bag.length)]
    if (!picked.includes(item)) picked.push(item)
  }

  const qtyFor = (item) => {
    if (item.category === 'crop') return 2 + rng.int(Math.min(2 + Math.floor(level / 2), 6))
    if (item.value >= 100) return 1 + rng.int(2)
    return 1 + rng.int(level < 4 ? 2 : 3)
  }
  const items = picked.map((item) => ({ id: item.id, qty: qtyFor(item) }))
  const baseValue = items.reduce((sum, { id, qty }) => sum + ITEMS[id].value * qty, 0)
  const baseXp = items.reduce((sum, { id, qty }) => sum + ITEMS[id].xp * qty, 0)

  return {
    id,
    client: client.id,
    requester: client.contact,
    items,
    coins: Math.round(baseValue * (1.2 + rng() * 0.3)),
    xp: Math.round(baseXp * 1.5) + 2,
    availableAt: now + delayMs,
  }
}

/** Best-matching business for an existing list of items (used to migrate old saves). */
export function clientForItems(items) {
  const all = Object.values(CLIENTS)
  return (all.find((c) => items.every((i) => c.wants.includes(i.id))) ?? all.find((c) => c.wants.includes(items[0]?.id)) ?? CLIENTS.market).id
}
