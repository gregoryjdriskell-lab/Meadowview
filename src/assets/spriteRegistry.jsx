/** Maps sprite ids to the built-in vector art. Custom art overrides these via the sprite manifest. */
import { CROPS } from '../game/config/index.js'
import { buildingArt } from './vector/buildings.jsx'
import { itemArt } from './vector/items.jsx'
import { CropStage } from './vector/crops.jsx'
import { uiArt, Avatar } from './vector/ui.jsx'
import { animalArt } from './vector/animals.jsx'
import { spriteBox } from './spriteKeys.js'

export function getVectorArt(id) {
  const [ns, name, extra] = id.split('.')
  let render = null
  if (ns === 'building' && buildingArt[name]) render = buildingArt[name]
  else if (ns === 'item' && itemArt[name]) render = itemArt[name]
  else if (ns === 'crop' && CROPS[name]) render = () => <CropStage crop={CROPS[name]} stage={Number(extra) || 0} />
  else if (ns === 'animal' && animalArt[name]) render = animalArt[name]
  else if (ns === 'avatar') render = () => <Avatar index={Number(name) || 0} />
  else if (ns === 'ui' && uiArt[name]) render = uiArt[name]
  if (!render) return null
  const { width, height } = spriteBox(id)
  return { viewBox: `0 0 ${width} ${height}`, render }
}
