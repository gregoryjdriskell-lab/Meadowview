/**
 * Loads public/assets/sprites/sprites.config.json at runtime (no rebuild needed)
 * and preloads any sprite sheets/images it references. Sprites whose image fails
 * to load are dropped so the vector fallback shows instead of a broken image.
 */
import { createContext, useContext, useEffect, useState } from 'react'

const ManifestContext = createContext({ sprites: {}, sheets: {}, base: '' })
const BASE = `${import.meta.env.BASE_URL}assets/sprites/`

export const resolveAsset = (base, src) => (/^(https?:|data:|\/)/.test(src) ? src : base + src)

function preload(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}

async function loadManifest() {
  const res = await fetch(`${BASE}sprites.config.json`, { cache: 'no-cache' })
  if (!res.ok) return null
  const json = await res.json()
  const sheets = json.sheets ?? {}
  const sprites = json.sprites ?? {}

  const urls = new Set()
  for (const s of Object.values(sheets)) if (s?.src) urls.add(resolveAsset(BASE, s.src))
  for (const s of Object.values(sprites)) if (s?.src) urls.add(resolveAsset(BASE, s.src))
  const results = await Promise.all([...urls].map(async (u) => [u, await preload(u)]))
  const failed = new Set(results.filter(([, ok]) => !ok).map(([u]) => u))

  const usable = {}
  for (const [id, entry] of Object.entries(sprites)) {
    const sheet = entry.sheet ? sheets[entry.sheet] : null
    const url = entry.src ? resolveAsset(BASE, entry.src) : sheet?.src ? resolveAsset(BASE, sheet.src) : null
    if (!url || failed.has(url)) {
      console.warn(`[sprites] "${id}" skipped: image missing or failed to load (${url ?? 'no src'})`)
      continue
    }
    usable[id] = entry
  }
  return { sheets, sprites: usable, base: BASE }
}

export function SpriteManifestProvider({ children }) {
  const [manifest, setManifest] = useState({ sprites: {}, sheets: {}, base: BASE })
  useEffect(() => {
    let alive = true
    loadManifest()
      .then((m) => alive && m && setManifest(m))
      .catch((err) => console.warn('[sprites] could not load sprites.config.json, using vector art', err))
    return () => {
      alive = false
    }
  }, [])
  return <ManifestContext.Provider value={manifest}>{children}</ManifestContext.Provider>
}

export const useSpriteManifest = () => useContext(ManifestContext)
