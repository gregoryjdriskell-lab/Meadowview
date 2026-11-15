import { ITEMS, CLIENTS } from '../../game/config/index.js'
import { encodeLink } from '../../game/social/links.js'

export const appBaseUrl = () => `${window.location.origin}${import.meta.env.BASE_URL}`

export function randomId() {
  try {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 12)
  } catch {
    return Math.random().toString(36).slice(2, 14)
  }
}

export const itemList = (items) => items.map(({ id, qty }) => `${qty} ${ITEMS[id]?.name ?? id}`).join(', ')

export function requestShare(profile, request) {
  const url = encodeLink('help', { id: request.id, from: { id: profile.id, name: profile.name }, client: request.client, items: request.items }, appBaseUrl())
  const client = CLIENTS[request.client]?.name ?? 'an order'
  return {
    title: 'Ask a neighbour',
    message: `${profile.name} needs a hand in Meadowvale: ${itemList(request.items)} for ${client}. Tap to help:`,
    url,
  }
}

export function giftShare(profile, gift) {
  const url = encodeLink('gift', { id: gift.id, req: gift.req, to: gift.to, from: { id: profile.id, name: profile.name }, items: gift.items }, appBaseUrl())
  return {
    title: `Send the delivery${gift.toName ? ` to ${gift.toName}` : ''}`,
    message: `${profile.name} sent you ${itemList(gift.items)} in Meadowvale. Tap to unpack:`,
    url,
  }
}

/** Opens the phone's share sheet, or copies to the clipboard. Returns 'shared' | 'copied' | 'failed'. */
export async function shareOrCopy({ title, message, url }) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text: message, url })
      return 'shared'
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled'
    }
  }
  try {
    await navigator.clipboard.writeText(`${message} ${url}`)
    return 'copied'
  } catch {
    return 'failed'
  }
}
