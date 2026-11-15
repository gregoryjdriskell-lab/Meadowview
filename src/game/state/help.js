/** Neighbour help: rules shared by the reducer and the UI. */
import { ITEMS } from '../config/index.js'
import { missingUnits } from './rules.js'

const ok = { ok: true }
const no = (reason) => ({ ok: false, reason })

/** Items still missing for an order (what a neighbour would need to send). */
export const missingItems = (state, order) =>
  order.items.map(({ id, qty }) => ({ id, qty: Math.max(0, qty - (state.inventory[id] ?? 0)) })).filter((i) => i.qty > 0)

export const openRequestFor = (state, orderId) => state.helpRequests.find((r) => r.orderId === orderId && r.status === 'open')

export function canAskForHelp(state, orderId, now) {
  const order = state.orders.find((o) => o.id === orderId)
  if (!order || order.availableAt > now) return no('Order not found')
  if (missingUnits(state, order) === 0) return no('You already have everything')
  return ok
}

/** Coins and XP a helper earns: a fair price for the goods plus a little thank-you. */
export function helperReward(items) {
  const value = items.reduce((n, { id, qty }) => n + (ITEMS[id]?.value ?? 0) * qty, 0)
  const xp = items.reduce((n, { id, qty }) => n + (ITEMS[id]?.xp ?? 0) * qty, 0)
  return { coins: Math.round(value * 1.1), xp: Math.max(1, Math.round(xp)) }
}

const validItems = (items) => Array.isArray(items) && items.every((i) => ITEMS[i?.id] && Number.isInteger(i.qty) && i.qty > 0 && i.qty <= 99)

/** Can this player send what a decoded help request asks for? */
export function canSendHelp(state, request) {
  if (!validItems(request.items)) return no('This request has items this game does not know')
  if (request.from?.id === state.profile.id) return no("That's your own request. Send the link to a neighbour.")
  if (state.sentGifts.some((g) => g.req === request.id)) return no('You already sent this delivery. You can share it again from Settings.')
  const short = request.items.filter(({ id, qty }) => (state.inventory[id] ?? 0) < qty)
  if (short.length) return no("You don't have everything yet. Open the link again once you do.")
  return ok
}

/** Can this player accept a decoded delivery? */
export function canAcceptGift(state, gift) {
  if (!validItems(gift.items)) return no('This delivery has items this game does not know')
  if (gift.to !== state.profile.id) return no('This delivery was meant for someone else.')
  if (state.redeemed.includes(gift.id)) return no('You already unpacked this delivery.')
  const req = state.helpRequests.find((r) => r.id === gift.req)
  if (!req) return no("This delivery doesn't match any of your requests.")
  if (req.status !== 'open') return no('That request was already filled.')
  return ok
}
