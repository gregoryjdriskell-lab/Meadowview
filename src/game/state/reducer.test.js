import { describe, expect, it } from 'vitest'
import { gameReducer } from './reducer.js'
import { createInitialState } from './initialState.js'
import { buildingAt, findFreeSpot } from '../engine/grid.js'
import { xpForLevel } from '../config/index.js'

const T0 = 1_700_000_000_000
const fresh = () => createInitialState(T0, 42)
const fieldIds = (s) => Object.values(s.buildings).filter((b) => b.type === 'field').map((b) => b.id)
const bakeryId = (s) => Object.values(s.buildings).find((b) => b.type === 'bakery').id

describe('farming loop', () => {
  it('plants, refuses early harvest, then harvests when ripe', () => {
    let s = fresh()
    const f = fieldIds(s)[0]
    s = gameReducer(s, { type: 'PLANT', fieldId: f, cropId: 'wheat', now: T0 })
    expect(s.buildings[f].crop).toBe('wheat')

    const early = gameReducer(s, { type: 'HARVEST', fieldId: f, now: T0 + 5_000 })
    expect(early).toBe(s)

    s = gameReducer(s, { type: 'HARVEST', fieldId: f, now: T0 + 20_000 })
    expect(s.inventory.wheat).toBe(5)
    expect(s.buildings[f].crop).toBeNull()
    expect(s.xp).toBe(1)
  })

  it('rejects locked crops', () => {
    const s = fresh()
    const next = gameReducer(s, { type: 'PLANT', fieldId: fieldIds(s)[0], cropId: 'corn', now: T0 })
    expect(next).toBe(s)
  })
})

describe('production', () => {
  it('queues jobs back to back and collects finished ones', () => {
    let s = { ...fresh(), inventory: { wheat: 6 } }
    const b = bakeryId(s)
    s = gameReducer(s, { type: 'QUEUE_PRODUCTION', buildingId: b, recipeId: 'bread', now: T0 })
    s = gameReducer(s, { type: 'QUEUE_PRODUCTION', buildingId: b, recipeId: 'bread', now: T0 })
    expect(s.inventory.wheat).toBeUndefined()
    expect(s.buildings[b].jobs.map((j) => j.readyAt)).toEqual([T0 + 30_000, T0 + 60_000])

    s = gameReducer(s, { type: 'COLLECT_PRODUCTION', buildingId: b, now: T0 + 31_000 })
    expect(s.inventory.bread).toBe(1)
    expect(s.buildings[b].jobs).toHaveLength(1)
  })

  it('refuses without ingredients', () => {
    const s = { ...fresh(), inventory: {} }
    expect(gameReducer(s, { type: 'QUEUE_PRODUCTION', buildingId: bakeryId(s), recipeId: 'bread', now: T0 })).toBe(s)
  })
})

describe('orders and progression', () => {
  it('fulfils an order, pays out, and refills the slot', () => {
    let s = fresh()
    const order = s.orders[0]
    s = { ...s, inventory: { wheat: 99, bread: 99 } }
    const coins = s.coins
    s = gameReducer(s, { type: 'FULFILL_ORDER', orderId: order.id, now: T0 })
    expect(s.coins).toBeGreaterThanOrEqual(coins + order.coins)
    expect(s.orders).toHaveLength(3)
    expect(s.orders[0].id).not.toBe(order.id)
    expect(s.stats.ordersCompleted).toBe(1)
  })

  it('levels up, grants coins, and opens extra order slots', () => {
    let s = { ...fresh(), xp: xpForLevel(2) - 1 }
    const f = fieldIds(s)[0]
    s = gameReducer(s, { type: 'PLANT', fieldId: f, cropId: 'wheat', now: T0 })
    s = gameReducer(s, { type: 'HARVEST', fieldId: f, now: T0 + 20_000 })
    expect(s.level).toBe(2)
    expect(s.pendingLevelUps).toEqual([2])
    expect(s.orders).toHaveLength(4)
  })
})

describe('town grid', () => {
  it('places a building on a free spot and charges coins', () => {
    let s = fresh()
    const spot = findFreeSpot(s, 'tree')
    s = gameReducer(s, { type: 'PLACE_BUILDING', buildingType: 'tree', x: spot.x, y: spot.y, now: T0 })
    expect(buildingAt(s, spot.x, spot.y).type).toBe('tree')
    expect(s.coins).toBe(85)
  })

  it('refuses overlapping placement, off-land placement, and bad moves', () => {
    const s = fresh()
    const house = Object.values(s.buildings).find((b) => b.type === 'house')
    const bakery = Object.values(s.buildings).find((b) => b.type === 'bakery')
    const { land } = s.grid
    expect(gameReducer(s, { type: 'PLACE_BUILDING', buildingType: 'tree', x: house.x + 1, y: house.y + 1, now: T0 })).toBe(s)
    expect(gameReducer(s, { type: 'PLACE_BUILDING', buildingType: 'tree', x: land.x0 - 1, y: land.y0, now: T0 })).toBe(s)
    expect(gameReducer(s, { type: 'MOVE_BUILDING', id: house.id, x: bakery.x, y: bakery.y })).toBe(s)
    const spot = findFreeSpot(s, 'house')
    const moved = gameReducer(s, { type: 'MOVE_BUILDING', id: house.id, x: spot.x, y: spot.y })
    expect(moved.buildings[house.id]).toMatchObject(spot)
  })

  it('expands land by one tile on every side once the level allows it', () => {
    let s = { ...fresh(), coins: 1000 }
    const before = s.grid.land
    expect(gameReducer(s, { type: 'EXPAND_LAND' })).toBe(s)
    s = { ...s, level: 2 }
    s = gameReducer(s, { type: 'EXPAND_LAND' })
    expect(s.grid.land).toEqual({ x0: before.x0 - 1, y0: before.y0 - 1, x1: before.x1 + 1, y1: before.y1 + 1 })
    expect(s.coins).toBe(850)
  })
})

describe('animals', () => {
  const withCoop = () => {
    let s = { ...fresh(), level: 7, coins: 5000, inventory: { poultryfeed: 1 } }
    const spot = findFreeSpot(s, 'coop')
    s = gameReducer(s, { type: 'PLACE_BUILDING', buildingType: 'coop', x: spot.x, y: spot.y, now: T0 })
    const coop = Object.values(s.buildings).find((b) => b.type === 'coop')
    return [s, coop.id]
  }

  it('comes with starter animals, feeds as many as feed allows, and collects products', () => {
    let [s, id] = withCoop()
    expect(s.buildings[id].animals).toHaveLength(2)

    s = gameReducer(s, { type: 'FEED_ANIMALS', buildingId: id, now: T0 })
    expect(s.inventory.poultryfeed).toBeUndefined()
    expect(s.buildings[id].animals.filter((a) => a.fedAt)).toHaveLength(1)

    expect(gameReducer(s, { type: 'COLLECT_ANIMALS', buildingId: id, now: T0 + 10_000 })).toBe(s)
    s = gameReducer(s, { type: 'COLLECT_ANIMALS', buildingId: id, now: T0 + 60_000 })
    expect(s.inventory.egg).toBe(1)
    expect(s.buildings[id].animals.every((a) => a.fedAt === 0)).toBe(true)
  })

  it('refuses to feed without feed, and caps pen size', () => {
    let [s, id] = withCoop()
    s = { ...s, inventory: {} }
    expect(gameReducer(s, { type: 'FEED_ANIMALS', buildingId: id, now: T0 })).toBe(s)
    for (let i = 0; i < 5; i++) s = gameReducer(s, { type: 'BUY_ANIMAL', buildingId: id, now: T0 })
    expect(s.buildings[id].animals).toHaveLength(5)
  })

  it('feed mill batches yield several items', () => {
    let s = { ...fresh(), level: 7, coins: 5000, inventory: { wheat: 2, corn: 1 } }
    const spot = findFreeSpot(s, 'feedmill')
    s = gameReducer(s, { type: 'PLACE_BUILDING', buildingType: 'feedmill', x: spot.x, y: spot.y, now: T0 })
    const mill = Object.values(s.buildings).find((b) => b.type === 'feedmill').id
    s = gameReducer(s, { type: 'QUEUE_PRODUCTION', buildingId: mill, recipeId: 'poultryfeed', now: T0 })
    s = gameReducer(s, { type: 'COLLECT_PRODUCTION', buildingId: mill, now: T0 + 30_000 })
    expect(s.inventory.poultryfeed).toBe(3)
  })
})

describe('content integrity', () => {
  it('every recipe input and animal feed is obtainable no later than it is needed', async () => {
    const { RECIPES, ITEMS, ANIMALS, BUILDINGS } = await import('../config/index.js')
    for (const r of Object.values(RECIPES)) {
      expect(BUILDINGS[r.building].unlockLevel).toBeLessThanOrEqual(r.unlockLevel)
      for (const id of Object.keys(r.inputs)) expect(ITEMS[id].unlockLevel).toBeLessThanOrEqual(r.unlockLevel)
    }
    for (const a of Object.values(ANIMALS)) expect(ITEMS[a.feed].unlockLevel).toBeLessThanOrEqual(a.unlockLevel)
  })

  it('never puts feed in orders, and every orderable item has a business that wants it', async () => {
    const { CLIENTS, ITEMS } = await import('../config/index.js')
    const wanted = new Set(Object.values(CLIENTS).flatMap((c) => c.wants))
    expect([...wanted].some((id) => ITEMS[id].category === 'feed')).toBe(false)
    for (const item of Object.values(ITEMS)) if (item.orderable) expect(wanted.has(item.id)).toBe(true)
  })
})

describe('save migration', () => {
  it('moves an old 10-wide town into the middle of the square map, keeping its layout', async () => {
    const { migrate } = await import('./persistence.js')
    const v2 = {
      ...fresh(),
      version: 2,
      level: 10,
      grid: { cols: 10, rows: 20, unlockedRows: 16 },
      buildings: { b1: { id: 'b1', type: 'house', x: 0, y: 0, rentFrom: 0 }, b2: { id: 'b2', type: 'tree', x: 9, y: 15 } },
    }
    const v3 = migrate(v2)
    expect(v3.version).toBe(4)
    expect(v3.grid).toEqual({ cols: 20, rows: 20, land: { x0: 5, y0: 2, x1: 15, y1: 18 } })
    expect(v3.buildings.b1).toMatchObject({ x: 5, y: 2 })
    expect(v3.buildings.b2).toMatchObject({ x: 14, y: 17 })
    expect(v3.level).toBe(10)
  })

  it('v3 saves gain businesses, reputation and starter boosters', async () => {
    const { migrate } = await import('./persistence.js')
    const v3 = { ...fresh(), version: 3, orders: [{ id: 'o1', requester: 2, items: [{ id: 'bread', qty: 1 }], coins: 10, xp: 3, availableAt: 0 }] }
    delete v3.reputation
    delete v3.boosters
    const v4 = migrate(v3)
    expect(v4.version).toBe(4)
    const { CLIENTS } = await import('../config/index.js')
    expect(CLIENTS[v4.orders[0].client].wants).toContain('bread')
    expect(v4.boosters).toEqual({ tonic: 1, rush: 1, voucher: 1 })
    expect(v4.reputation).toEqual({})
  })

  it('also upgrades v1 saves', async () => {
    const { migrate } = await import('./persistence.js')
    const v3 = migrate({ ...fresh(), version: 1, grid: { cols: 10, rows: 14, unlockedRows: 8 } })
    expect(v3.grid.land).toEqual({ x0: 5, y0: 6, x1: 15, y1: 14 })
  })
})

describe('reputation', () => {
  const stocked = async () => {
    const { ITEMS } = await import('../config/index.js')
    return Object.fromEntries(Object.keys(ITEMS).map((k) => [k, 99]))
  }

  it('only asks for things you can make', async () => {
    const { generateOrder } = await import('../engine/orders.js')
    const { makeRng } = await import('../engine/rng.js')
    const rng = makeRng(3)
    for (let i = 0; i < 200; i++) {
      const o = generateOrder({ level: 20, rng, id: 'x', now: 0, ownedTypes: new Set(['field', 'bakery']) })
      for (const { id } of o.items) expect(['wheat', 'corn', 'carrot', 'sugarcane', 'strawberry', 'cotton', 'tulip', 'bread', 'cornbread', 'carrotcake', 'pancakes']).toContain(id)
    }
  })

  it('earns reputation, levels up, and grants the business booster', async () => {
    const inventory = await stocked()
    let s = { ...fresh(), inventory }
    const startBoosters = { ...s.boosters }
    for (let i = 0; i < 8; i++) {
      const now = T0 + i * 10_000
      const order = s.orders.find((o) => o.availableAt <= now)
      const next = gameReducer(s, { type: 'FULFILL_ORDER', orderId: order.id, now })
      expect(next).not.toBe(s)
      s = { ...next, inventory }
    }
    const total = Object.values(s.reputation).reduce((n, r) => n + r.xp, 0)
    expect(total).toBeGreaterThan(40)
    expect(s.pendingRepUps.length).toBeGreaterThan(0)
    const up = s.pendingRepUps[0]
    expect(s.boosters[Object.keys(up.gift)[0]]).toBeGreaterThan(startBoosters[Object.keys(up.gift)[0]])
  })

  it('skipping costs reputation but never drops a level', () => {
    let s = fresh()
    const order = s.orders[0]
    s = { ...s, reputation: { [order.client]: { xp: 35, orders: 3 } } } // level 2 (30), 5 into it
    s = gameReducer(s, { type: 'DISCARD_ORDER', orderId: order.id, now: T0 })
    expect(s.reputation[order.client].xp).toBe(30)
    const again = s.orders.find((o) => o.availableAt <= T0)
    if (again?.client === order.client) {
      const s2 = gameReducer(s, { type: 'DISCARD_ORDER', orderId: again.id, now: T0 })
      expect(s2.reputation[order.client].xp).toBe(30)
    }
  })

  it('vouchers cover up to two missing units', () => {
    let s = fresh()
    const order = { id: 'ov', client: 'market', requester: 0, items: [{ id: 'wheat', qty: 4 }], coins: 10, xp: 5, availableAt: 0 }
    s = { ...s, orders: [order, ...s.orders.slice(1)], inventory: { wheat: 2 }, boosters: { tonic: 0, rush: 0, voucher: 2 } }
    expect(gameReducer(s, { type: 'FULFILL_ORDER', orderId: 'ov', now: T0 })).toBe(s)
    const done = gameReducer(s, { type: 'FULFILL_ORDER', orderId: 'ov', now: T0, useVouchers: true })
    expect(done.boosters.voucher).toBe(0)
    expect(done.inventory.wheat).toBeUndefined()
    const tooMany = { ...s, inventory: { wheat: 1 }, boosters: { voucher: 5 } }
    expect(gameReducer(tooMany, { type: 'FULFILL_ORDER', orderId: 'ov', now: T0, useVouchers: true })).toBe(tooMany)
  })

  it('reputation perks raise the payout', async () => {
    const { orderReward } = await import('./reputation.js')
    const s = fresh()
    const order = s.orders[0]
    const base = orderReward(s, order)
    const loyal = orderReward({ ...s, reputation: { [order.client]: { xp: 200, orders: 20 } } }, order)
    expect(loyal.coins).toBe(Math.round(order.coins * 1.2))
    expect(loyal.coins).toBeGreaterThan(base.coins)
  })
})

describe('boosters', () => {
  it('growth tonic ripens a field; rush ticket finishes a factory job and pulls the queue forward', () => {
    let s = { ...fresh(), inventory: { wheat: 6 } }
    const f = fieldIds(s)[0]
    s = gameReducer(s, { type: 'PLANT', fieldId: f, cropId: 'wheat', now: T0 })
    s = gameReducer(s, { type: 'USE_TONIC', fieldId: f, now: T0 + 1000 })
    expect(s.boosters.tonic).toBe(0)
    s = gameReducer(s, { type: 'HARVEST', fieldId: f, now: T0 + 1000 })
    expect(s.inventory.wheat).toBe(8)

    const b = bakeryId(s)
    s = gameReducer(s, { type: 'QUEUE_PRODUCTION', buildingId: b, recipeId: 'bread', now: T0 })
    s = gameReducer(s, { type: 'QUEUE_PRODUCTION', buildingId: b, recipeId: 'bread', now: T0 })
    s = gameReducer(s, { type: 'USE_RUSH', buildingId: b, now: T0 + 10_000 })
    expect(s.buildings[b].jobs.map((j) => j.readyAt)).toEqual([T0 + 10_000, T0 + 40_000])
    expect(gameReducer(s, { type: 'USE_RUSH', buildingId: b, now: T0 + 10_000 })).toBe(s) // no tickets left
  })
})
