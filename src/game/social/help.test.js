import { describe, expect, it } from 'vitest'
import { decodeLink, encodeLink } from './links.js'
import { gameReducer } from '../state/reducer.js'
import { createInitialState } from '../state/initialState.js'
import { missingItems } from '../state/help.js'

const T0 = 1_700_000_000_000

describe('share links', () => {
  it('round-trip and reject damaged links', () => {
    const url = encodeLink('help', { id: 'r1', from: { id: 'abc', name: 'Zoë 🌷' }, items: [{ id: 'corn', qty: 3 }] }, 'https://x.test/app/')
    expect(url.startsWith('https://x.test/app/#help=')).toBe(true)
    const hash = url.slice(url.indexOf('#'))
    const ok = decodeLink(hash)
    expect(ok.kind).toBe('help')
    expect(ok.payload.from.name).toBe('Zoë 🌷')
    expect(decodeLink(hash.slice(0, -3)).error).toBeTruthy()
    const tampered = hash.replace(/.(?=\.)/, (c) => (c === 'A' ? 'B' : 'A'))
    expect(decodeLink(tampered).error).toBeTruthy()
    expect(decodeLink('#settings')).toBeNull()
  })
})

describe('neighbour help, end to end', () => {
  it('asker -> helper -> asker, each link usable once and only by the right person', () => {
    // Two separate players (two phones)
    let alice = { ...createInitialState(T0, 1), inventory: { wheat: 1 } }
    let bob = { ...createInitialState(T0, 2), inventory: { wheat: 50, bread: 50 } }
    alice = gameReducer(alice, { type: 'SET_NAME', name: 'Alice' })
    const order = alice.orders[0]
    const need = missingItems(alice, order)
    expect(need.length).toBeGreaterThan(0)

    // Alice asks
    alice = gameReducer(alice, { type: 'CREATE_HELP_REQUEST', request: { id: 'req1', orderId: order.id }, now: T0 })
    const req = alice.helpRequests[0]
    const reqLink = decodeLink(encodeLink('help', { id: req.id, from: alice.profile, client: req.client, items: req.items }).slice(0))
    // Alice can't help herself
    expect(gameReducer(alice, { type: 'SEND_HELP', request: reqLink.payload, giftId: 'g0', now: T0 })).toBe(alice)

    // Bob sends
    const bobCoins = bob.coins
    bob = gameReducer(bob, { type: 'SEND_HELP', request: reqLink.payload, giftId: 'gift1', now: T0 })
    expect(bob.coins).toBeGreaterThan(bobCoins)
    expect(bob.stats.helpsGiven).toBe(1)
    expect(gameReducer(bob, { type: 'SEND_HELP', request: reqLink.payload, giftId: 'gift2', now: T0 })).toBe(bob) // once only

    // Alice accepts the delivery
    expect(bob.sentGifts[0]).toMatchObject({ id: 'gift1', req: req.id, to: alice.profile.id })
    const gift = { id: 'gift1', req: req.id, to: alice.profile.id, from: bob.profile, items: req.items }
    expect(gameReducer(bob, { type: 'ACCEPT_GIFT', gift })).toBe(bob) // not Bob's
    alice = gameReducer(alice, { type: 'ACCEPT_GIFT', gift })
    expect(alice.helpRequests[0].status).toBe('received')
    expect(gameReducer(alice, { type: 'ACCEPT_GIFT', gift })).toBe(alice) // once only
    expect(gameReducer(alice, { type: 'FULFILL_ORDER', orderId: order.id, now: T0 })).not.toBe(alice) // order now deliverable
  })

  it('migrates v4 saves with a fresh identity', async () => {
    const { migrate } = await import('../state/persistence.js')
    const v4 = { ...createInitialState(T0, 3), version: 4, grid: { cols: 20, rows: 20, land: { x0: 5, y0: 5, x1: 14, y1: 14 } } }
    v4.buildings = Object.fromEntries(Object.entries(v4.buildings).map(([id, b]) => [id, { ...b, x: b.x - 4, y: b.y - 4 }]))
    delete v4.profile
    delete v4.terrain
    const v5 = migrate(v4)
    expect(v5.version).toBe(6)
    expect(v5.profile.id).toMatch(/^[0-9a-z]{12}$/)
    expect(v5.helpRequests).toEqual([])
  })
})
