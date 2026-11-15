/**
 * Share links for neighbour help. Pure and serverless: a link carries its whole
 * message, encoded as base64url JSON with a short checksum (to catch truncated or
 * mangled links, not to stop cheating; this is an honour-system feature).
 *
 *   #help=<code>  a help request: "I need these items"
 *   #gift=<code>  a delivery: "here are the items you asked for"
 */
const VERSION = 1

function fnv1a(str) {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(36).padStart(7, '0').slice(-7)
}

const toB64Url = (str) => {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const fromB64Url = (code) => {
  const bin = atob(code.replace(/-/g, '+').replace(/_/g, '/'))
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}

export function encodeLink(kind, payload, baseUrl = '') {
  const json = JSON.stringify({ v: VERSION, ...payload })
  return `${baseUrl}#${kind}=${toB64Url(json)}.${fnv1a(json)}`
}

/** Parses a location hash. Returns null (not a share link), { error }, or { kind, payload }. */
export function decodeLink(hash) {
  const m = /^#?(help|gift)=([A-Za-z0-9_-]+)\.([0-9a-z]{7})$/.exec(hash ?? '')
  if (!m) return /^#?(help|gift)=/.test(hash ?? '') ? { error: 'This link looks incomplete. Ask for it to be sent again.' } : null
  try {
    const json = fromB64Url(m[2])
    if (fnv1a(json) !== m[3]) return { error: 'This link was damaged on the way. Ask for it to be sent again.' }
    const payload = JSON.parse(json)
    if (payload.v !== VERSION) return { error: 'This link is from a different version of Meadowvale.' }
    if (!Array.isArray(payload.items) || !payload.items.length) return { error: 'This link has no items in it.' }
    return { kind: m[1], payload }
  } catch {
    return { error: 'This link could not be read. Ask for it to be sent again.' }
  }
}
