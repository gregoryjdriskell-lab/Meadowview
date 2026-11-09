/**
 * Building sprites. Each renders into a (w*100) x (h*100) box matching its footprint
 * from src/game/config/buildings.js. Art is assembled from a few parametric
 * templates so new buildings are mostly a matter of choosing colors.
 */
import { itemArt } from './items.jsx'

const Shadow = ({ cx, cy, rx, ry = 10 }) => <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#3d5a2a" opacity=".16" />

function Cottage({ wall, roof, door, flowerBox = false }) {
  return (
    <g>
      <Shadow cx={100} cy={182} rx={82} />
      <rect x="132" y="34" width="18" height="36" rx="4" fill="#b98b6e" />
      <circle className="smoke" cx="141" cy="26" r="7" fill="#fff" />
      <rect x="30" y="84" width="140" height="92" rx="10" fill={wall} />
      <path d="M20 92 L100 30 L180 92 Z" fill={roof} stroke={roof} strokeWidth="12" strokeLinejoin="round" />
      <path d="M44 84 L100 42 L156 84" fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth="6" strokeLinecap="round" />
      <circle cx="100" cy="66" r="10" fill="#cdeefd" stroke="#fff" strokeWidth="4" />
      <rect x="86" y="122" width="28" height="54" rx="14" fill={door} />
      <circle cx="107" cy="150" r="2.5" fill="#ffd45c" />
      {[44, 128].map((x) => (
        <g key={x}>
          <rect x={x} y="108" width="28" height="28" rx="6" fill="#cdeefd" stroke="#fff" strokeWidth="4" />
          <path d={`M${x + 14} 108 V136 M${x} 122 H${x + 28}`} stroke="#fff" strokeWidth="3" />
          {flowerBox && (
            <g>
              <rect x={x - 3} y="138" width="34" height="9" rx="4" fill="#a47551" />
              {[6, 14, 22].map((dx, i) => (
                <circle key={dx} cx={x + dx} cy="136" r="4" fill={['#ff8fa3', '#ffd45c', '#cbbcf5'][i]} />
              ))}
            </g>
          )}
        </g>
      ))}
    </g>
  )
}

function Workshop({ wall, roof, awningA, awningB, door, product, chimney = false }) {
  const Icon = itemArt[product]
  return (
    <g>
      <Shadow cx={100} cy={184} rx={86} />
      {chimney && (
        <g>
          <rect x="140" y="26" width="20" height="40" rx="4" fill="#b98b6e" />
          <circle className="smoke" cx="150" cy="18" r="8" fill="#fff" />
          <circle className="smoke delay" cx="154" cy="18" r="6" fill="#fff" />
        </g>
      )}
      <rect x="22" y="70" width="156" height="108" rx="10" fill={wall} />
      <path d="M14 78 L42 40 H158 L186 78 Z" fill={roof} stroke={roof} strokeWidth="8" strokeLinejoin="round" />
      {Array.from({ length: 6 }, (_, i) => (
        <path key={i} d={`M${22 + i * 26} 96 h26 v14 a13 13 0 0 1 -26 0z`} fill={i % 2 ? awningB : awningA} />
      ))}
      <rect x="22" y="90" width="156" height="8" rx="3" fill={awningA} />
      <rect x="34" y="130" width="64" height="38" rx="6" fill="#cdeefd" stroke="#fff" strokeWidth="4" />
      <rect x="30" y="164" width="72" height="8" rx="4" fill="#c8925f" />
      <rect x="114" y="124" width="46" height="54" rx="8" fill={door} />
      <circle cx="152" cy="152" r="2.5" fill="#ffd45c" />
      <circle cx="100" cy="54" r="24" fill="#fff" stroke={roof} strokeWidth="4" />
      {Icon && (
        <g transform="translate(81 35) scale(0.38)">
          <Icon />
        </g>
      )}
    </g>
  )
}

function Board() {
  return (
    <g>
      <Shadow cx={100} cy={92} rx={78} ry={6} />
      <rect x="32" y="40" width="10" height="54" rx="3" fill="#8a5f41" />
      <rect x="158" y="40" width="10" height="54" rx="3" fill="#8a5f41" />
      <rect x="16" y="8" width="168" height="62" rx="10" fill="#c8925f" stroke="#a47551" strokeWidth="4" />
      {[[30, -4], [78, 3], [128, -2]].map(([x, r], i) => (
        <g key={x} transform={`rotate(${r} ${x + 18} 40)`}>
          <rect x={x} y="18" width="36" height="42" rx="4" fill={['#fff8ec', '#fff1b8', '#ffd9c2'][i]} />
          <path d={`M${x + 7} 32 h22 M${x + 7} 40 h18 M${x + 7} 48 h20`} stroke="#c9b8a4" strokeWidth="3" strokeLinecap="round" />
          <circle cx={x + 18} cy="20" r="4" fill="#f2667f" />
        </g>
      ))}
    </g>
  )
}

function Tree() {
  return (
    <g>
      <Shadow cx={50} cy={88} rx={30} ry={7} />
      <rect x="44" y="56" width="12" height="32" rx="5" fill="#a47551" />
      <circle cx="50" cy="40" r="28" fill="#6fbf5a" />
      <circle cx="32" cy="50" r="17" fill="#7fcf68" />
      <circle cx="68" cy="50" r="17" fill="#7fcf68" />
      <circle cx="40" cy="30" r="8" fill="#9be07f" />
    </g>
  )
}

function Flowers() {
  const blooms = [[30, 52, '#ff8fa3'], [52, 44, '#ffd45c'], [72, 54, '#cbbcf5'], [40, 70, '#ffa877'], [64, 72, '#ff8fa3']]
  return (
    <g>
      <ellipse cx="50" cy="62" rx="42" ry="28" fill="#a47551" />
      <ellipse cx="50" cy="60" rx="38" ry="24" fill="#b9875e" />
      {blooms.map(([x, y, c]) => (
        <g key={`${x}${y}`}>
          <ellipse cx={x + 6} cy={y + 4} rx="5" ry="2.5" fill="#6fbf5a" />
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={x + 5 * Math.cos((a * Math.PI) / 180)} cy={y + 5 * Math.sin((a * Math.PI) / 180)} r="4.5" fill={c} />
          ))}
          <circle cx={x} cy={y} r="3" fill="#fff1b8" />
        </g>
      ))}
    </g>
  )
}

export function FieldSoil() {
  return (
    <g>
      <rect x="5" y="5" width="90" height="90" rx="16" fill="#c99b72" />
      <rect x="10" y="10" width="80" height="80" rx="12" fill="#b9875e" />
      {[30, 50, 70].map((y) => (
        <line key={y} x1="20" y1={y + 8} x2="80" y2={y + 8} stroke="#a7744d" strokeWidth="5" strokeLinecap="round" />
      ))}
    </g>
  )
}

export const buildingArt = {
  field: FieldSoil,
  house: () => <Cottage wall="#ffe9d1" roof="#f28b82" door="#a47551" />,
  gardenhouse: () => <Cottage wall="#e3f1ff" roof="#7aa7e0" door="#8a5f41" flowerBox />,
  bakery: () => <Workshop wall="#fff1e0" roof="#c97b4a" awningA="#ff8fa3" awningB="#ffffff" door="#a47551" product="bread" chimney />,
  snackstand: () => <Workshop wall="#fff8d6" roof="#ffb347" awningA="#ff6b6b" awningB="#ffffff" door="#c97b4a" product="popcorn" />,
  sugarmill: () => <Workshop wall="#f1ecff" roof="#a18cd1" awningA="#b8a6ef" awningB="#ffffff" door="#8a6fc0" product="sugar" chimney />,
  board: Board,
  tree: Tree,
  flowers: Flowers,
}
