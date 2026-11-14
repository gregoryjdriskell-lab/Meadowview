/** Building sprite for menus. Animal pens get a couple of residents so they don't look empty. */
import { BUILDINGS, isPen } from '../../game/config/index.js'
import Sprite from './Sprite.jsx'
import { ANIMAL_SIZE, penSlots } from '../../assets/penSlots.js'

export default function BuildingIcon({ type, className = 'h-full w-full' }) {
  if (!isPen(type)) return <Sprite id={`building.${type}`} className={className} />
  const animal = BUILDINGS[type].animal
  const size = ANIMAL_SIZE * 100
  return (
    <div className={`relative ${className}`} style={{ aspectRatio: '1 / 1' }}>
      <Sprite id={`building.${type}`} className="h-full w-full" />
      {penSlots(type)
        .slice(1, 4)
        .map(([x, y]) => (
          <div key={x} className="absolute" style={{ left: `${x * 100 - size / 2}%`, top: `${y * 100 - size * 0.9}%`, width: `${size}%`, height: `${size}%` }}>
            <Sprite id={`animal.${animal}`} />
          </div>
        ))}
    </div>
  )
}
