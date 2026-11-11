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
    const spot = findFreeSpot(s, 'field')
    s = gameReducer(s, { type: 'PLACE_BUILDING', buildingType: 'tree', x: spot.x, y: spot.y, now: T0 })
    expect(buildingAt(s, spot.x, spot.y).type).toBe('tree')
    expect(s.coins).toBe(85)
  })

  it('refuses overlapping placement and moves', () => {
    const s = fresh()
    const house = buildingAt(s, 0, 0)
    expect(gameReducer(s, { type: 'PLACE_BUILDING', buildingType: 'tree', x: 1, y: 1, now: T0 })).toBe(s)
    expect(gameReducer(s, { type: 'MOVE_BUILDING', id: house.id, x: 7, y: 0 })).toBe(s)
    const moved = gameReducer(s, { type: 'MOVE_BUILDING', id: house.id, x: 0, y: 2 })
    expect(moved.buildings[house.id]).toMatchObject({ x: 0, y: 2 })
  })

  it('expands land once the level allows it', () => {
    let s = { ...fresh(), coins: 1000 }
    expect(gameReducer(s, { type: 'EXPAND_LAND' })).toBe(s)
    s = { ...s, level: 2 }
    s = gameReducer(s, { type: 'EXPAND_LAND' })
    expect(s.grid.unlockedRows).toBe(10)
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

  it('never puts feed in orders', async () => {
    const { orderableItems } = await import('../engine/orders.js')
    expect(orderableItems(20).some((i) => i.category === 'feed')).toBe(false)
  })
})

describe('save migration', () => {
  it('upgrades v1 saves and keeps progress', async () => {
    const { migrate } = await import('./persistence.js')
    const v1 = { ...fresh(), version: 1, level: 10, xp: 2000, grid: { cols: 10, rows: 14, unlockedRows: 14 } }
    const v2 = migrate(v1)
    expect(v2.version).toBe(2)
    expect(v2.grid).toEqual({ cols: 10, rows: 20, unlockedRows: 14 })
    expect(v2.level).toBe(10)
  })
})
