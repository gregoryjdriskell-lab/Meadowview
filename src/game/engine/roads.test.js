import { describe, expect, it } from 'vitest'
import { computeRoads } from './roads.js'
import { depthSort, toGrid, toScreen } from './iso.js'
import { createInitialState } from '../state/initialState.js'
import { BUILDINGS } from '../config/index.js'
import { buildingAt, isLand } from './grid.js'

const fresh = () => createInitialState(1_700_000_000_000, 7)

function connected(tiles) {
  const list = [...tiles]
  if (!list.length) return true
  const seen = new Set([list[0]])
  const stack = [list[0]]
  while (stack.length) {
    const [x, y] = stack.pop().split(',').map(Number)
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const k = `${x + dx},${y + dy}`
      if (tiles.has(k) && !seen.has(k)) {
        seen.add(k)
        stack.push(k)
      }
    }
  }
  return seen.size === tiles.size
}

describe('auto roads', () => {
  it('forms one connected network on free land only', () => {
    const s = fresh()
    const { tiles, exit } = computeRoads(s)
    expect(tiles.size).toBeGreaterThan(3)
    expect(connected(tiles)).toBe(true)
    for (const k of tiles) {
      const [x, y] = k.split(',').map(Number)
      expect(isLand(s, x, y)).toBe(true)
      expect(buildingAt(s, x, y)).toBeNull()
    }
    expect(exit.length).toBe(s.grid.rows - s.grid.land.y1)
  })

  it('reaches a front door of every home and factory', () => {
    const s = fresh()
    const { tiles } = computeRoads(s)
    for (const b of Object.values(s.buildings)) {
      if (!['housing', 'factory'].includes(BUILDINGS[b.type].category)) continue
      const [w, h] = BUILDINGS[b.type].size
      const doors = [...Array(w).keys()].map((i) => `${b.x + i},${b.y + h}`).concat([...Array(h).keys()].map((j) => `${b.x + w},${b.y + j}`))
      expect(doors.some((d) => tiles.has(d))).toBe(true)
    }
  })
})

describe('iso projection', () => {
  it('round-trips grid <-> screen', () => {
    const grid = { cols: 20, rows: 20 }
    for (const [x, y] of [[0, 0], [3, 7], [19, 2], [10.5, 4.25]]) {
      const p = toScreen(grid, x, y)
      const g = toGrid(grid, p.x, p.y)
      expect(g.x).toBeCloseTo(x)
      expect(g.y).toBeCloseTo(y)
    }
  })

  it('draws buildings behind before buildings in front', () => {
    const a = { id: 'a', type: 'house', x: 5, y: 5 } // 2x2
    const front = { id: 'b', type: 'tree', x: 6, y: 7 }
    const back = { id: 'c', type: 'tree', x: 4, y: 5 }
    const order = depthSort([front, a, back]).map((b) => b.id)
    expect(order.indexOf('c')).toBeLessThan(order.indexOf('a'))
    expect(order.indexOf('a')).toBeLessThan(order.indexOf('b'))
  })
})
