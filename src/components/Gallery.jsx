/** Open the app with ?gallery to see every sprite id with its current art (vector or custom). */
import { allSpriteKeys, spriteBox } from '../assets/spriteKeys.js'
import Sprite from './ui/Sprite.jsx'

export default function Gallery() {
  const keys = allSpriteKeys()
  return (
    <div className="h-dvh overflow-auto bg-meadow-200 p-4" style={{ userSelect: 'text' }}>
      <h1 className="mb-1 text-2xl font-bold">Sprite gallery</h1>
      <p className="mb-4 text-sm text-ink-soft">{keys.length} sprites. Map custom art in public/assets/sprites/sprites.config.json.</p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
        {keys.map((id) => {
          const { width, height } = spriteBox(id)
          return (
            <div key={id} className="flex flex-col items-center rounded-2xl bg-cream p-2">
              <div className="grid h-32 w-full place-items-center">
                <Sprite id={id} className="max-h-full max-w-full" style={{ aspectRatio: `${width} / ${height}` }} />
              </div>
              <code className="mt-1 text-xs text-ink-soft">{id}</code>
            </div>
          )
        })}
      </div>
    </div>
  )
}
