/**
 * <Sprite id="building.bakery" /> — the one component every piece of game art goes through.
 *
 * Resolution order:
 *   1. A custom entry in public/assets/sprites/sprites.config.json (single image or sheet frame)
 *   2. Built-in vector art from src/assets/spriteRegistry.jsx
 *   3. A soft placeholder (so missing art is obvious but never crashes)
 *
 * Fills its parent box; size it with className/style.
 */
import { useSpriteManifest, resolveAsset } from '../../assets/SpriteManifestProvider.jsx'
import { getVectorArt } from '../../assets/spriteRegistry.jsx'

function frameStyle(entry, sheet, base) {
  const columns = sheet.columns ?? 1
  const rows = sheet.rows ?? 1
  const [col, row] = Array.isArray(entry.frame) ? entry.frame : [(entry.frame ?? 0) % columns, Math.floor((entry.frame ?? 0) / columns)]
  return {
    backgroundImage: `url("${resolveAsset(base, sheet.src)}")`,
    backgroundSize: `${columns * 100}% ${rows * 100}%`,
    backgroundPosition: `${columns > 1 ? (col / (columns - 1)) * 100 : 0}% ${rows > 1 ? (row / (rows - 1)) * 100 : 0}%`,
    backgroundRepeat: 'no-repeat',
    imageRendering: sheet.pixelated ? 'pixelated' : undefined,
  }
}

function CustomSprite({ entry, manifest, className, style, title }) {
  const transform = [
    entry.offset ? `translate(${entry.offset[0]}%, ${entry.offset[1]}%)` : '',
    entry.scale ? `scale(${entry.scale})` : '',
  ].join(' ').trim()
  const wrapStyle = { ...style, transform: transform || undefined, transformOrigin: 'bottom center' }

  if (entry.sheet) {
    const sheet = manifest.sheets[entry.sheet]
    return <div role="img" aria-label={title} className={className} style={{ ...wrapStyle, ...frameStyle(entry, sheet, manifest.base) }} />
  }
  return (
    <img
      src={resolveAsset(manifest.base, entry.src)}
      alt={title ?? ''}
      draggable={false}
      className={className}
      style={{ ...wrapStyle, objectFit: entry.fit ?? 'contain', imageRendering: entry.pixelated ? 'pixelated' : undefined }}
    />
  )
}

export default function Sprite({ id, className = 'h-full w-full', style, title }) {
  const manifest = useSpriteManifest()
  const custom = manifest.sprites[id]
  if (custom) return <CustomSprite entry={custom} manifest={manifest} className={className} style={style} title={title} />

  const art = getVectorArt(id)
  if (!art) {
    return <div className={`${className} rounded-xl border-2 border-dashed border-ink-soft/40`} style={style} title={`missing sprite: ${id}`} />
  }
  return (
    <svg viewBox={art.viewBox} className={className} style={{ overflow: 'visible', ...style }} role="img" aria-label={title} preserveAspectRatio="xMidYMid meet">
      {art.render()}
    </svg>
  )
}
