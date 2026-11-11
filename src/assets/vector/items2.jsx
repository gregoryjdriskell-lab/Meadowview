/**
 * Item icons for the animal & industry expansion (100x100 each).
 * Merged into itemArt in items.jsx.
 */

const Shade = ({ cx = 50, cy = 88, rx = 34 }) => <ellipse cx={cx} cy={cy} rx={rx} ry="6" fill="#000" opacity=".08" />

// ── Crops ────────────────────────────────────────────────
const Cotton = () => (
  <g>
    <path d="M50 92 V62" stroke="#8a5f41" strokeWidth="4" strokeLinecap="round" />
    <path d="M30 70 L50 58 L70 70 L60 62 L50 76 L40 62Z" fill="#8a5f41" />
    {[[38, 46, 14], [62, 46, 14], [50, 32, 15], [50, 54, 13]].map(([x, y, r]) => (
      <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="#fff" stroke="#e6ddd2" strokeWidth="2" />
    ))}
  </g>
)

const Tulip = () => (
  <g>
    {[[-16, '#ff9ec4'], [16, '#ffd45c'], [0, '#ff6b9a']].map(([r, c]) => (
      <g key={r} transform={`rotate(${r} 50 92)`}>
        <path d="M50 92 V40" stroke="#5fae5f" strokeWidth="4" strokeLinecap="round" />
        <path d="M39 30 Q39 15 44 13 L50 21 L56 13 Q61 15 61 30 Q61 42 50 42 Q39 42 39 30Z" fill={c} />
      </g>
    ))}
    <ellipse cx="38" cy="74" rx="5" ry="14" transform="rotate(-30 38 74)" fill="#6fbf5a" />
    <ellipse cx="62" cy="74" rx="5" ry="14" transform="rotate(30 62 74)" fill="#6fbf5a" />
  </g>
)

// ── Feed sacks ───────────────────────────────────────────
function Sack({ color, dark, grain }) {
  return (
    <g>
      <Shade />
      <path d="M26 40 Q22 64 24 80 Q26 90 50 90 Q74 90 76 80 Q78 64 74 40Z" fill={color} />
      <path d="M30 40 L36 22 Q50 16 64 22 L70 40Z" fill={color} />
      <rect x="30" y="34" width="40" height="8" rx="4" fill={dark} />
      <circle cx="50" cy="64" r="15" fill="#fff8ec" />
      {[[-5, -3], [4, -5], [0, 4], [6, 4], [-6, 5]].map(([dx, dy]) => (
        <ellipse key={`${dx}${dy}`} cx={50 + dx} cy={64 + dy} rx="3" ry="4" fill={grain} />
      ))}
    </g>
  )
}

// ── Animal goods ─────────────────────────────────────────
const Egg = () => (
  <g>
    <Shade rx={30} />
    <ellipse cx="38" cy="58" rx="20" ry="27" fill="#e9b98a" stroke="#d29a63" strokeWidth="2.5" />
    <ellipse cx="62" cy="62" rx="20" ry="26" fill="#fff6e8" stroke="#d9bf98" strokeWidth="2.5" />
    <ellipse cx="55" cy="50" rx="5" ry="8" fill="#fff" opacity=".8" />
  </g>
)

const Milk = () => (
  <g>
    <Shade rx={26} />
    <path d="M38 22 H62 V32 L70 44 V84 Q70 90 64 90 H36 Q30 90 30 84 V44 L38 32Z" fill="#fff" stroke="#d6e2f0" strokeWidth="3" />
    <rect x="37" y="12" width="26" height="12" rx="4" fill="#7cc6f2" />
    <rect x="30" y="54" width="40" height="22" fill="#a6d8f5" />
    <path d="M50 58 Q44 66 50 71 Q56 66 50 58Z" fill="#fff" />
  </g>
)

const Wool = () => (
  <g>
    <Shade />
    {[[32, 60, 18], [52, 50, 20], [70, 62, 16], [44, 70, 16], [62, 74, 14]].map(([x, y, r]) => (
      <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="#fff8ec" stroke="#e9dcc5" strokeWidth="3" />
    ))}
    <path d="M42 50 q4 -6 8 0 M58 62 q4 -6 8 0" fill="none" stroke="#e9dcc5" strokeWidth="3" strokeLinecap="round" />
  </g>
)

const Feather = () => (
  <g>
    {[[-20, '#e8f1fb'], [14, '#ffffff']].map(([r, c]) => (
      <g key={r} transform={`rotate(${r} 50 88)`}>
        <path d="M50 88 C30 70 30 34 50 12 C70 34 70 70 50 88Z" fill={c} stroke="#c9d6f5" strokeWidth="2.5" />
        <path d="M50 92 V22" stroke="#b8c7e8" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M50 40 L40 34 M50 52 L60 46 M50 64 L40 58" stroke="#c9d6f5" strokeWidth="2" strokeLinecap="round" />
      </g>
    ))}
  </g>
)

// ── Dairy ────────────────────────────────────────────────
const Cream = () => (
  <g>
    <Shade rx={30} />
    <path d="M22 54 H78 L72 82 Q70 88 64 88 H36 Q30 88 28 82Z" fill="#a6d8f5" />
    <rect x="22" y="50" width="56" height="8" rx="4" fill="#7cc6f2" />
    <path d="M28 50 Q30 34 42 36 Q44 22 56 26 Q66 18 68 32 Q78 36 72 50Z" fill="#fffdf6" stroke="#efe6d4" strokeWidth="2" />
    <path d="M52 26 Q56 16 60 20" fill="none" stroke="#efe6d4" strokeWidth="3" strokeLinecap="round" />
  </g>
)

const Cheese = () => (
  <g>
    <Shade rx={36} />
    <path d="M14 76 L84 76 L84 52 L14 52Z" fill="#f6c445" />
    <path d="M14 52 L60 26 L84 52Z" fill="#ffe08a" />
    {[[30, 64, 5], [52, 60, 4], [70, 68, 6], [44, 70, 3]].map(([x, y, r]) => <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="#e6a92c" />)}
    <ellipse cx="58" cy="42" rx="5" ry="3" fill="#f6c445" />
  </g>
)

const Butter = () => (
  <g>
    <ellipse cx="50" cy="78" rx="40" ry="11" fill="#cdeafc" />
    <ellipse cx="50" cy="75" rx="40" ry="11" fill="#e6f4fd" />
    <path d="M24 70 V48 L36 38 H78 V60 L66 70Z" fill="#ffe58a" />
    <path d="M24 48 L36 38 H78 L66 48Z" fill="#fff1b8" />
    <path d="M66 48 V70 L78 60 V38Z" fill="#f6d365" />
    <path d="M40 44 q8 -6 16 0" fill="none" stroke="#f6d365" strokeWidth="3" strokeLinecap="round" />
  </g>
)

const Pancakes = () => (
  <g>
    <ellipse cx="50" cy="82" rx="40" ry="10" fill="#e6f0f8" />
    {[72, 60, 48].map((y) => (
      <g key={y}>
        <ellipse cx="50" cy={y + 4} rx="32" ry="10" fill="#c97b4a" />
        <ellipse cx="50" cy={y} rx="32" ry="10" fill="#f0b46e" />
      </g>
    ))}
    <path d="M24 50 Q30 60 34 52 Q38 64 44 54 Q52 62 58 52 Q66 60 72 50 Q60 42 50 42 Q34 42 24 50Z" fill="#b5651d" opacity=".75" />
    <rect x="42" y="34" width="16" height="10" rx="3" fill="#ffe58a" />
  </g>
)

// ── Textiles ─────────────────────────────────────────────
const Fabric = () => (
  <g>
    <Shade rx={36} />
    <rect x="14" y="56" width="72" height="24" rx="8" fill="#a6d8f5" />
    <path d="M22 56 V80 M34 56 V80 M46 56 V80 M58 56 V80 M70 56 V80" stroke="#cdeafc" strokeWidth="4" />
    <rect x="18" y="32" width="64" height="26" rx="8" fill="#ffb3c1" />
    {[28, 44, 60, 74].map((x) => <circle key={x} cx={x} cy="45" r="3.5" fill="#fff" />)}
    <path d="M82 46 Q92 56 84 70" fill="none" stroke="#ffb3c1" strokeWidth="6" strokeLinecap="round" />
  </g>
)

const Yarn = () => (
  <g>
    <Shade rx={30} />
    <path d="M70 70 Q86 80 80 92" fill="none" stroke="#a18cd1" strokeWidth="4" strokeLinecap="round" />
    <circle cx="48" cy="52" r="32" fill="#cbbcf5" />
    <path d="M22 40 Q48 52 76 38 M18 56 Q48 70 80 54 M28 76 Q50 82 70 74" fill="none" stroke="#a18cd1" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M36 22 Q30 52 40 82 M58 22 Q68 52 58 82" fill="none" stroke="#b8a6ef" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="72" y1="14" x2="40" y2="70" stroke="#c8925f" strokeWidth="4" strokeLinecap="round" />
  </g>
)

const TShirt = () => (
  <g>
    <Shade rx={30} />
    <path d="M36 16 Q50 26 64 16 L86 28 L78 46 L68 42 V86 H32 V42 L22 46 L14 28Z" fill="#9fdcbc" stroke="#7fc9a3" strokeWidth="3" strokeLinejoin="round" />
    <path d="M40 18 Q50 30 60 18" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
    <circle cx="50" cy="56" r="9" fill="#fff8ec" />
    <path d="M45 56 L50 52 L55 56 L50 61Z" fill="#ff8fa3" />
  </g>
)

const Sweater = () => (
  <g>
    <Shade rx={34} />
    <path d="M34 16 Q50 26 66 16 L84 26 L94 76 L80 80 L72 46 V88 H28 V46 L20 80 L6 76 L16 26Z" fill="#ff8f7a" stroke="#ef7560" strokeWidth="3" strokeLinejoin="round" />
    <path d="M38 18 Q50 30 62 18" fill="none" stroke="#fff1b8" strokeWidth="5" strokeLinecap="round" />
    <path d="M28 54 H72 M28 66 H72" stroke="#fff1b8" strokeWidth="4" strokeDasharray="4 4" />
    <rect x="28" y="80" width="44" height="8" fill="#ef7560" />
  </g>
)

// ── Down feather ─────────────────────────────────────────
const Pillow = () => (
  <g>
    <Shade rx={38} />
    <path d="M16 30 Q50 22 84 30 Q76 54 84 78 Q50 86 16 78 Q24 54 16 30Z" fill="#e6defc" stroke="#cbbcf5" strokeWidth="3" />
    <path d="M28 40 Q50 34 72 40" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".7" />
    <circle cx="50" cy="55" r="5" fill="#b8a6ef" />
    <path d="M50 55 L36 44 M50 55 L64 44 M50 55 L38 68 M50 55 L62 68" stroke="#cbbcf5" strokeWidth="2" />
  </g>
)

const Quilt = () => {
  const colors = ['#ffb3c1', '#fff1b8', '#a6d8f5', '#cdeeb4', '#e6defc', '#ffd9c2']
  return (
    <g>
      <Shade rx={38} />
      <rect x="14" y="20" width="72" height="66" rx="10" fill="#fff8ec" />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={20 + (i % 3) * 21} y={26 + Math.floor(i / 3) * 19} width="18" height="16" rx="3" fill={colors[(i * 2 + Math.floor(i / 3)) % colors.length]} />
      ))}
      <rect x="14" y="20" width="72" height="66" rx="10" fill="none" stroke="#f2b6a0" strokeWidth="3" strokeDasharray="5 4" />
    </g>
  )
}

// ── Florist ──────────────────────────────────────────────
const Bouquet = () => (
  <g>
    {[[36, 26, '#ff9ec4'], [50, 18, '#ff6b9a'], [64, 26, '#ffd45c'], [42, 36, '#ffd45c'], [58, 36, '#ff9ec4']].map(([x, y, c]) => (
      <g key={`${x}${y}`}>
        <path d={`M${x - 9} ${y} Q${x - 9} ${y - 12} ${x - 4} ${y - 13} L${x} ${y - 7} L${x + 4} ${y - 13} Q${x + 9} ${y - 12} ${x + 9} ${y} Q${x + 9} ${y + 9} ${x} ${y + 9} Q${x - 9} ${y + 9} ${x - 9} ${y}Z`} fill={c} />
      </g>
    ))}
    <ellipse cx="28" cy="46" rx="5" ry="11" transform="rotate(-40 28 46)" fill="#6fbf5a" />
    <ellipse cx="72" cy="46" rx="5" ry="11" transform="rotate(40 72 46)" fill="#6fbf5a" />
    <path d="M24 44 L76 44 L54 92 H46Z" fill="#fff8ec" stroke="#e9dcc5" strokeWidth="2" />
    <path d="M36 44 L50 92 M64 44 L50 92" stroke="#e9dcc5" strokeWidth="2" />
    <path d="M50 66 L36 58 L38 74Z M50 66 L64 58 L62 74Z" fill="#ff8fa3" />
    <circle cx="50" cy="66" r="4" fill="#f2667f" />
  </g>
)

const FlowerCrown = () => (
  <g>
    <ellipse cx="50" cy="58" rx="36" ry="22" fill="none" stroke="#6fbf5a" strokeWidth="6" />
    {Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2
      const x = 50 + 36 * Math.cos(a)
      const y = 58 + 22 * Math.sin(a)
      const c = ['#ff9ec4', '#ffd45c', '#cbbcf5', '#ff6b9a'][i % 4]
      return (
        <g key={i}>
          {[0, 72, 144, 216, 288].map((d) => (
            <circle key={d} cx={x + 5 * Math.cos((d * Math.PI) / 180)} cy={y + 5 * Math.sin((d * Math.PI) / 180)} r="4.5" fill={c} />
          ))}
          <circle cx={x} cy={y} r="3" fill="#fff1b8" />
        </g>
      )
    })}
  </g>
)

export const expansionItemArt = {
  cotton: Cotton,
  tulip: Tulip,
  poultryfeed: () => <Sack color="#f6d58a" dark="#d9a94f" grain="#e8b13c" />,
  cowfeed: () => <Sack color="#b8dd7a" dark="#8fbf55" grain="#f2bd3c" />,
  sheepfeed: () => <Sack color="#cbbcf5" dark="#a18cd1" grain="#ff9a52" />,
  egg: Egg,
  milk: Milk,
  wool: Wool,
  feather: Feather,
  cream: Cream,
  cheese: Cheese,
  butter: Butter,
  pancakes: Pancakes,
  fabric: Fabric,
  yarn: Yarn,
  tshirt: TShirt,
  sweater: Sweater,
  pillow: Pillow,
  quilt: Quilt,
  bouquet: Bouquet,
  flowercrown: FlowerCrown,
}
