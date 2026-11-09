/**
 * App = the interaction layer. Owns transient UI state (which panel is open, what's
 * being placed, which seed is selected) and turns taps into game actions.
 * All game rules live in src/game; this file only decides *what* to dispatch.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, X, ZoomIn, ZoomOut } from 'lucide-react'
import { BUILDINGS, CROPS, RECIPES, isFactory, isHousing } from './game/config/index.js'
import { useGame } from './game/state/GameProvider.jsx'
import * as rules from './game/state/rules.js'
import { buildingAt, clampToGrid, findFreeSpot } from './game/engine/grid.js'
import TopBar from './components/hud/TopBar.jsx'
import BottomBar from './components/hud/BottomBar.jsx'
import TownGrid from './components/town/TownGrid.jsx'
import BuildShop from './components/panels/BuildShop.jsx'
import FieldPanel from './components/panels/FieldPanel.jsx'
import FactoryPanel from './components/panels/FactoryPanel.jsx'
import OrderBoard from './components/panels/OrderBoard.jsx'
import BarnPanel from './components/panels/BarnPanel.jsx'
import InfoPanel from './components/panels/InfoPanel.jsx'
import LevelUpModal from './components/panels/LevelUpModal.jsx'
import SettingsPanel from './components/panels/SettingsPanel.jsx'
import { Button, CoinTag } from './components/ui/primitives.jsx'
import Sprite from './components/ui/Sprite.jsx'

const MIN_TILE = 32
const MAX_TILE = 88
const clampTile = (t) => Math.max(MIN_TILE, Math.min(MAX_TILE, t))
const initialTile = (cols) => clampTile(Math.floor((Math.min(window.innerWidth, 720) - 24) / cols))

export default function App() {
  const { state, now, actions } = useGame()
  const [panel, setPanel] = useState(null) // { kind, id?, tab? }
  const [placement, setPlacement] = useState(null) // { mode: 'new'|'move', type, id?, x, y }
  const [seed, setSeed] = useState(null) // crop id while in planting mode
  const [tile, setTileRaw] = useState(() => initialTile(state.grid.cols))
  const [fx, setFx] = useState([])
  const [toast, setToast] = useState(null)
  const fxKey = useRef(0)
  const toastTimer = useRef(null)

  const setTile = (t) => setTileRaw(clampTile(t))
  const close = () => setPanel(null)

  const notify = useCallback((text) => {
    clearTimeout(toastTimer.current)
    setToast(text)
    toastTimer.current = setTimeout(() => setToast(null), 1800)
  }, [])

  const popFx = useCallback((b, sprite, text) => {
    const [w] = BUILDINGS[b.type].size
    const key = ++fxKey.current
    setFx((list) => [...list, { key, x: b.x + w / 2, y: b.y, sprite, text }])
    setTimeout(() => setFx((list) => list.filter((f) => f.key !== key)), 1100)
  }, [])

  // ----- actions with feedback -------------------------------------------------

  const harvest = (b) => {
    if (!rules.canHarvest(state, b.id, now).ok) return
    const crop = CROPS[b.crop]
    actions.harvest(b.id)
    popFx(b, `item.${crop.id}`, `+${crop.yield}`)
  }

  const plant = (b, cropId) => {
    const check = rules.canPlant(state, b.id, cropId)
    if (!check.ok) return notify(check.reason)
    actions.plant(b.id, cropId)
    if (CROPS[cropId].seedCost) popFx(b, 'ui.coin', `-${CROPS[cropId].seedCost}`)
  }

  const collectFactory = (b) => {
    const done = rules.finishedJobs(b, now)
    if (!done.length) return
    actions.collect(b.id)
    const xp = done.reduce((s, j) => s + RECIPES[j.recipe].xp, 0)
    popFx(b, `item.${done[0].recipe}`, `+${done.length}  ★${xp}`)
  }

  const collectRent = (b) => {
    const { coins } = rules.rentDue(b, now)
    if (!coins) return
    actions.collectRent(b.id)
    popFx(b, 'ui.coin', `+${coins}`)
  }

  const deliver = (order) => {
    actions.fulfill(order.id)
    notify(`Delivered! +${order.coins} coins, +${order.xp} XP`)
  }

  const expand = () => {
    const check = rules.canExpand(state)
    if (!check.ok) return notify(check.reason)
    actions.expand()
    notify('New land unlocked!')
  }

  // ----- placement ---------------------------------------------------------------

  const startBuy = (type) => {
    const spot = findFreeSpot(state, type)
    if (!spot) return notify('No free space. Expand your land!')
    setPanel(null)
    setSeed(null)
    setPlacement({ mode: 'new', type, ...spot })
  }

  const startMove = (id) => {
    const b = state.buildings[id]
    setPanel(null)
    setSeed(null)
    setPlacement({ mode: 'move', id, type: b.type, x: b.x, y: b.y })
  }

  const confirmPlacement = () => {
    const { mode, type, id, x, y } = placement
    const check = mode === 'move' ? rules.canMove(state, id, x, y) : rules.canPlace(state, type, x, y)
    if (!check.ok) return notify(check.reason)
    if (mode === 'move') {
      actions.move(id, x, y)
      setPlacement(null)
    } else {
      actions.place(type, x, y)
      popFx({ type, x, y }, 'ui.coin', `-${check.cost}`)
      // Fields are usually bought in batches: stay in placement mode at the next free spot.
      if (type === 'field') {
        setPlacement((p) => ({ ...p, x, y, chain: true }))
      } else setPlacement(null)
    }
  }

  // After placing a field, hop the ghost to the nearest free spot (or exit if none / can't afford).
  useEffect(() => {
    if (!placement?.chain) return
    const next = rules.canBuy(state, placement.type).ok ? findFreeSpot(state, placement.type, placement) : null
    setPlacement(next ? { ...placement, ...next, chain: false } : null)
  }, [state, placement])

  // ----- grid input --------------------------------------------------------------

  const handleTap = (x, y) => {
    if (placement) {
      const [w, h] = BUILDINGS[placement.type].size
      const pos = clampToGrid(state, placement.type, x - Math.floor((w - 1) / 2), y - Math.floor((h - 1) / 2))
      setPlacement((p) => ({ ...p, ...pos }))
      return
    }
    const b = buildingAt(state, x, y)
    if (!b) return setPanel(null)

    if (b.type === 'field') {
      const status = rules.fieldStatus(b, now)
      if (status === 'ripe') return harvest(b)
      return setPanel({ kind: 'field', id: b.id })
    }
    if (isFactory(b.type)) {
      if (rules.finishedJobs(b, now).length) return collectFactory(b)
      return setPanel({ kind: 'factory', id: b.id })
    }
    if (isHousing(b.type) && rules.rentDue(b, now).coins) return collectRent(b)
    if (b.type === 'board') return setPanel({ kind: 'orders' })
    setPanel({ kind: 'info', id: b.id })
  }

  // Seed mode: drag across tiles to plant empty fields and harvest ripe ones.
  const handlePaint = (x, y) => {
    const b = buildingAt(state, x, y)
    if (!b || b.type !== 'field') return
    const status = rules.fieldStatus(b, Date.now())
    if (status === 'ripe') harvest(b)
    else if (status === 'empty') plant(b, seed)
  }

  const chooseSeed = (cropId) => {
    const field = state.buildings[panel.id]
    plant(field, cropId)
    setSeed(cropId)
    setPanel(null)
  }

  const readyOrders = state.orders.filter((o) => rules.canFulfill(state, o.id, now).ok).length
  const levelUp = state.pendingLevelUps[0]

  // ----- render ----------------------------------------------------------------

  return (
    <div className="mx-auto flex h-dvh max-w-3xl flex-col overflow-hidden bg-meadow-200">
      <main className="relative flex-1">
        <TopBar onSettings={() => setPanel({ kind: 'settings' })} />
        <TownGrid
          tile={tile}
          placement={placement}
          seedMode={Boolean(seed)}
          onTap={handleTap}
          onPaint={handlePaint}
          onExpand={() => setPanel({ kind: 'shop', tab: 'land' })}
          fx={fx}
          readyOrders={readyOrders}
        />

        {!placement && !seed && (
          <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-2">
            <button aria-label="Zoom in" onClick={() => setTile(tile + 8)} className="grid h-10 w-10 place-items-center rounded-full bg-cream/90 text-ink-soft shadow-md active:scale-95">
              <ZoomIn size={20} />
            </button>
            <button aria-label="Zoom out" onClick={() => setTile(tile - 8)} className="grid h-10 w-10 place-items-center rounded-full bg-cream/90 text-ink-soft shadow-md active:scale-95">
              <ZoomOut size={20} />
            </button>
          </div>
        )}

        {toast && (
          <div className="pointer-events-none absolute inset-x-0 top-20 z-50 flex justify-center px-6">
            <div className="animate-pop rounded-full bg-ink/85 px-4 py-2 text-sm font-medium text-white shadow-lg">{toast}</div>
          </div>
        )}

        {seed && (
          <ActionBar>
            <Sprite id={`item.${seed}`} className="h-10 w-10 shrink-0" />
            <div className="min-w-0 flex-1 leading-tight">
              <div className="font-semibold">Planting {CROPS[seed].name}</div>
              <div className="text-xs text-ink-soft">Tap or swipe over fields · ripe ones get harvested</div>
            </div>
            <Button onClick={() => setSeed(null)}>Done</Button>
          </ActionBar>
        )}

        {placement && (
          <ActionBar>
            <Sprite id={`building.${placement.type}`} className="h-10 w-10 shrink-0" />
            <div className="min-w-0 flex-1 leading-tight">
              <div className="font-semibold">{placement.mode === 'move' ? 'Move' : 'Place'} {BUILDINGS[placement.type].name}</div>
              <div className="text-xs text-ink-soft">
                Tap the map to choose a spot
                {placement.mode === 'new' && rules.canBuy(state, placement.type).cost != null && (
                  <> · <CoinTag amount={rules.canBuy(state, placement.type).cost} size="h-3 w-3" /></>
                )}
              </div>
            </div>
            <Button variant="soft" size="icon" aria-label="Cancel" onClick={() => setPlacement(null)}>
              <X size={22} />
            </Button>
            <Button size="icon" aria-label="Confirm" onClick={confirmPlacement}>
              <Check size={22} strokeWidth={3} />
            </Button>
          </ActionBar>
        )}
      </main>

      <BottomBar
        readyOrders={readyOrders}
        onShop={() => {
          setPlacement(null)
          setSeed(null)
          setPanel({ kind: 'shop' })
        }}
        onOrders={() => setPanel({ kind: 'orders' })}
        onBarn={() => setPanel({ kind: 'barn' })}
      />

      {panel?.kind === 'shop' && <BuildShop initialTab={panel.tab} onClose={close} onBuy={startBuy} onExpand={expand} notify={notify} />}
      {panel?.kind === 'orders' && <OrderBoard onClose={close} onDeliver={deliver} />}
      {panel?.kind === 'barn' && <BarnPanel onClose={close} />}
      {panel?.kind === 'settings' && <SettingsPanel onClose={close} tile={tile} setTile={setTile} />}
      {panel?.kind === 'field' && (
        <FieldPanel fieldId={panel.id} onClose={close} onChooseSeed={chooseSeed} onMove={() => startMove(panel.id)} notify={notify} />
      )}
      {panel?.kind === 'factory' && (
        <FactoryPanel
          buildingId={panel.id}
          onClose={close}
          onCollect={() => collectFactory(state.buildings[panel.id])}
          onMove={() => startMove(panel.id)}
          notify={notify}
        />
      )}
      {panel?.kind === 'info' && (
        <InfoPanel buildingId={panel.id} onClose={close} onMove={() => startMove(panel.id)} onCollectRent={() => collectRent(state.buildings[panel.id])} />
      )}

      {levelUp && <LevelUpModal level={levelUp} onClose={actions.dismissLevelUp} />}
    </div>
  )
}

function ActionBar({ children }) {
  return (
    <div className="absolute inset-x-3 bottom-3 z-30 flex animate-pop items-center gap-3 rounded-3xl bg-cream p-3 shadow-xl">{children}</div>
  )
}
