/**
 * Procedural crop sprites drawn on top of a field (100x100 box).
 * Driven by `crop.art` in src/game/config/crops.js — add a new crop there and
 * pick an existing `kind` to get growing art for free.
 *
 * Stages: 0 = sprout, 1 = growing, 2 = ripe.
 */

const SPOTS = [[26, 44], [50, 44], [74, 44], [26, 82], [50, 82], [74, 82]]
const SCALE = [0.5, 0.8, 1]

function Sprout({ stem }) {
  return (
    <g>
      <line x1="0" y1="0" x2="0" y2="-5" stroke={stem} strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="-5" cy="-7" rx="6" ry="3" transform="rotate(-30 -5 -7)" fill={stem} />
      <ellipse cx="5" cy="-7" rx="6" ry="3" transform="rotate(30 5 -7)" fill={stem} />
    </g>
  )
}

const kinds = {
  grain: ({ stem, head }) => (
    <g>
      {[-14, 0, 14].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <line x1="0" y1="0" x2="0" y2="-24" stroke={stem} strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="0" cy="-28" rx="3.5" ry="7" fill={head} />
        </g>
      ))}
    </g>
  ),
  cob: ({ stem, head, ripe }) => (
    <g>
      <line x1="0" y1="0" x2="0" y2="-32" stroke={stem} strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="-8" cy="-16" rx="3" ry="11" transform="rotate(-45 -8 -16)" fill={stem} />
      <ellipse cx="8" cy="-22" rx="3" ry="11" transform="rotate(45 8 -22)" fill={stem} />
      <ellipse cx="5" cy="-20" rx={ripe ? 4.5 : 3} ry={ripe ? 9 : 6} transform="rotate(18 5 -20)" fill={head} />
    </g>
  ),
  root: ({ stem, head, ripe }) => (
    <g>
      {[-25, 0, 25].map((a) => (
        <ellipse key={a} cx="0" cy="-12" rx="3.5" ry="11" transform={`rotate(${a} 0 0)`} fill={stem} />
      ))}
      {ripe && <path d="M-7 -1 Q0 -5 7 -1 L0 9Z" fill={head} />}
    </g>
  ),
  cane: ({ stem, head }) => (
    <g>
      {[-6, 0, 6].map((x, i) => (
        <g key={x}>
          <rect x={x - 2} y={-34 + i * 3} width="4" height={34 - i * 3} rx="2" fill={head} />
          <rect x={x - 2} y={-18} width="4" height="2" fill={stem} />
        </g>
      ))}
      <ellipse cx="-6" cy="-34" rx="2.5" ry="8" transform="rotate(-35 -6 -34)" fill={stem} />
      <ellipse cx="6" cy="-30" rx="2.5" ry="8" transform="rotate(35 6 -30)" fill={stem} />
    </g>
  ),
  berry: ({ stem, head, ripe }) => (
    <g>
      <ellipse cx="0" cy="-9" rx="13" ry="10" fill={stem} />
      <ellipse cx="-4" cy="-13" rx="5" ry="3" fill="#fff" opacity=".18" />
      {[[-6, -7], [5, -12], [3, -3], [-2, -15]].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r={ripe ? 3.5 : 2} fill={head} />
      ))}
    </g>
  ),
}

export function CropStage({ crop, stage }) {
  const { kind, stem, fruit } = crop.art
  const Plant = kinds[kind] ?? kinds.grain
  const ripe = stage >= 2
  const head = ripe ? fruit : stage === 1 && kind === 'berry' ? '#ffffff' : stem
  return (
    <g>
      {SPOTS.map(([x, y]) => (
        <g key={`${x}${y}`} transform={`translate(${x} ${y}) scale(${SCALE[stage] ?? 1})`}>
          {stage === 0 ? <Sprout stem={stem} /> : <Plant stem={stem} head={head} ripe={ripe} />}
        </g>
      ))}
    </g>
  )
}
