import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { gameReducer } from './reducer.js'
import { createInitialState } from './initialState.js'
import { loadGame, saveGame } from './persistence.js'
import { randomSeed } from '../engine/rng.js'

const GameContext = createContext(null)
const TICK_MS = 500

function makeActions(dispatch) {
  const at = (type, payload = {}) => dispatch({ type, ...payload, now: Date.now() })
  return {
    place: (buildingType, x, y) => at('PLACE_BUILDING', { buildingType, x, y }),
    move: (id, x, y) => at('MOVE_BUILDING', { id, x, y }),
    plant: (fieldId, cropId) => at('PLANT', { fieldId, cropId }),
    harvest: (fieldId) => at('HARVEST', { fieldId }),
    queue: (buildingId, recipeId) => at('QUEUE_PRODUCTION', { buildingId, recipeId }),
    collect: (buildingId) => at('COLLECT_PRODUCTION', { buildingId }),
    collectRent: (buildingId) => at('COLLECT_RENT', { buildingId }),
    feed: (buildingId) => at('FEED_ANIMALS', { buildingId }),
    collectAnimals: (buildingId) => at('COLLECT_ANIMALS', { buildingId }),
    buyAnimal: (buildingId) => at('BUY_ANIMAL', { buildingId }),
    fulfill: (orderId, useVouchers = false) => at('FULFILL_ORDER', { orderId, useVouchers }),
    useTonic: (fieldId) => at('USE_TONIC', { fieldId }),
    rush: (buildingId) => at('USE_RUSH', { buildingId }),
    dismissRepUp: () => at('DISMISS_REP_UP'),
    setName: (name) => at('SET_NAME', { name }),
    askForHelp: (request) => at('CREATE_HELP_REQUEST', { request }),
    sendHelp: (request, giftId) => at('SEND_HELP', { request, giftId }),
    acceptGift: (gift) => at('ACCEPT_GIFT', { gift }),
    discard: (orderId) => at('DISCARD_ORDER', { orderId }),
    expand: () => at('EXPAND_LAND'),
    dismissLevelUp: () => at('DISMISS_LEVEL_UP'),
    reset: () => at('RESET', { state: createInitialState(Date.now(), randomSeed()) }),
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => loadGame() ?? createInitialState(Date.now(), randomSeed()))
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), TICK_MS)
    return () => clearInterval(t)
  }, [])

  useEffect(() => saveGame(state), [state])

  const actions = useMemo(() => makeActions(dispatch), [])
  const value = useMemo(() => ({ state, now, actions }), [state, now, actions])
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>')
  return ctx
}
