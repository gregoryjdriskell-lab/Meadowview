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
