/** Building sprite for menus. Animal pens get a couple of residents so they don't look empty. */
import { BUILDINGS, isPen } from '../../game/config/index.js'
import Sprite from './Sprite.jsx'

export default function BuildingIcon({ type, className = 'h-full w-full' }) {
  if (!isPen(type)) return <Sprite id={`building.${type}`} className={className} />
  const animal = BUILDINGS[type].animal
  const spots = type === 'duckpond' ? [[50, 58], [72, 70]] : [[56, 52], [32, 68]]
  return (
    <div className={`relative ${className}`}>
      <Sprite id={`building.${type}`} className="h-full w-full" />
      {spots.map(([x, y]) => (
        <div key={x} className="absolute h-[38%] w-[38%] -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
          <Sprite id={`animal.${animal}`} />
        </div>
      ))}
    </div>
  )
}
