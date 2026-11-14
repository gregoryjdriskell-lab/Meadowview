/** Reputation helpers: levels, perks and the real rewards/penalties for an order. */
import { CLIENTS, MAX_REP, REP_XP, repPerks } from '../config/index.js'
import { repXpFor } from '../engine/orders.js'

export function repLevel(xp) {
  let lvl = 1
  while (lvl < MAX_REP && xp >= REP_XP[lvl + 1]) lvl += 1
  return lvl
}

export const repOf = (state, clientId) => state.reputation?.[clientId] ?? { xp: 0, orders: 0 }

export function repInfo(state, clientId) {
  const { xp, orders } = repOf(state, clientId)
  const level = repLevel(xp)
  const from = REP_XP[level]
  const to = REP_XP[level + 1] ?? from
  return { xp, orders, level, from, to, maxed: level >= MAX_REP, progress: to > from ? (xp - from) / (to - from) : 1, perks: repPerks(level) }
}

/** Final payout for delivering `order` now, including reputation bonuses. */
export function orderReward(state, order) {
  const { perks } = repInfo(state, order.client)
  return {
    coins: Math.round(order.coins * (1 + perks.coinBonus)),
    xp: Math.round(order.xp * (1 + perks.xpBonus)),
    rep: repXpFor(order),
    coinBonus: perks.coinBonus,
    xpBonus: perks.xpBonus,
  }
}

/** Reputation lost by skipping. Never drops you below your current reputation level. */
export function skipPenalty(state, order) {
  const info = repInfo(state, order.client)
  const raw = Math.round(repXpFor(order) * info.perks.skipFactor)
  return Math.min(raw, info.xp - info.from)
}

export const clientOf = (order) => CLIENTS[order.client] ?? CLIENTS.market
