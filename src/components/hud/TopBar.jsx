import { Settings } from 'lucide-react'
import { useGame } from '../../game/state/GameProvider.jsx'
import { MAX_LEVEL, xpForLevel } from '../../game/config/index.js'
import Sprite from '../ui/Sprite.jsx'

export default function TopBar({ onSettings }) {
  const { state } = useGame()
  const maxed = state.level >= MAX_LEVEL
  const from = xpForLevel(state.level)
  const to = xpForLevel(state.level + 1)
  const pct = maxed ? 1 : (state.xp - from) / (to - from)

  return (
    <header className="pt-safe pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start gap-2 px-3">
      <div className="pointer-events-auto flex min-w-0 flex-1 items-center gap-2 rounded-full bg-cream/90 py-1 pl-1 pr-3 shadow-md backdrop-blur">
        <div className="relative h-10 w-10 shrink-0">
          <Sprite id="ui.xp" />
          <span className="absolute inset-0 grid place-items-center pt-0.5 text-sm font-bold text-white [text-shadow:0_1px_2px_#4ba3d6]">{state.level}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="h-3 overflow-hidden rounded-full bg-pond-200">
            <div className="h-full rounded-full bg-pond-400 transition-[width] duration-500" style={{ width: `${pct * 100}%` }} />
          </div>
          <div className="mt-0.5 text-[11px] font-medium leading-none text-ink-soft tabular-nums">
            {maxed ? 'Max level' : `${state.xp - from} / ${to - from} XP`}
          </div>
        </div>
      </div>

      <div className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-cream/90 py-1 pl-1 pr-3 shadow-md backdrop-blur">
        <Sprite id="ui.coin" className="h-8 w-8" />
        <span className="text-lg font-semibold tabular-nums">{state.coins.toLocaleString()}</span>
      </div>

      <button onClick={onSettings} aria-label="Settings" className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-cream/90 text-ink-soft shadow-md backdrop-blur active:scale-95">
        <Settings size={20} strokeWidth={2.5} />
      </button>
    </header>
  )
}
