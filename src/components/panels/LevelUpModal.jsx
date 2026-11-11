import { levelUpCoins } from '../../game/config/index.js'
import { unlocksAtLevel } from '../../game/state/unlocks.js'
import { Button, CoinTag } from '../ui/primitives.jsx'
import Sprite from '../ui/Sprite.jsx'
import BuildingIcon from '../ui/BuildingIcon.jsx'

export default function LevelUpModal({ level, onClose }) {
  const unlocks = unlocksAtLevel(level)
  return (
    <div className="fixed inset-0 z-50 grid animate-fade-in place-items-center bg-ink/30 p-6">
      <div className="w-full max-w-sm animate-pop rounded-[2rem] bg-cream p-6 text-center shadow-2xl">
        <div className="relative mx-auto -mt-16 h-24 w-24">
          <Sprite id="ui.xp" />
          <span className="absolute inset-0 grid place-items-center pt-1 text-3xl font-bold text-white [text-shadow:0_2px_3px_#4ba3d6]">{level}</span>
        </div>
        <h2 className="mt-2 text-2xl font-bold">Level up!</h2>
        <p className="text-ink-soft">
          The town is growing. Bonus: <CoinTag amount={levelUpCoins(level)} />
        </p>
        {unlocks.length > 0 && (
          <>
            <h3 className="mt-4 text-sm font-semibold text-ink-soft">New to unlock</h3>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {unlocks.map((u) => (
                <div key={u.key + u.name} className="flex flex-col items-center rounded-2xl bg-white p-2">
                  {u.key.startsWith('building.') ? <BuildingIcon type={u.key.slice(9)} className="h-12 w-12" /> : <Sprite id={u.key} className="h-12 w-12" />}
                  <span className="mt-1 text-xs font-semibold leading-tight">{u.name}</span>
                  <span className="text-[10px] text-ink-soft">{u.kind}</span>
                </div>
              ))}
            </div>
          </>
        )}
        <Button size="lg" className="mt-5 w-full" onClick={onClose}>
          Hooray!
        </Button>
      </div>
    </div>
  )
}
