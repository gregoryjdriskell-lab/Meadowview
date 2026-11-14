/** UI glyphs and townsfolk avatars, drawn in the same style as the world art. */

function starPath(cx, cy, outer, inner) {
  const pts = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? inner : outer
    const a = (Math.PI / 5) * i - Math.PI / 2
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`)
  }
  return `M${pts.join('L')}Z`
}

export const uiArt = {
  coin: () => (
    <g>
      <circle cx="50" cy="54" r="40" fill="#e8a93a" />
      <circle cx="50" cy="48" r="40" fill="#ffd45c" />
      <circle cx="50" cy="48" r="28" fill="none" stroke="#f2b94a" strokeWidth="5" />
      <path d="M50 30 L55 44 L69 48 L55 52 L50 66 L45 52 L31 48 L45 44Z" fill="#fff4c2" />
    </g>
  ),
  xp: () => (
    <g>
      <path d={starPath(50, 54, 44, 20)} fill="#4ba3d6" stroke="#4ba3d6" strokeWidth="8" strokeLinejoin="round" />
      <path d={starPath(50, 50, 42, 19)} fill="#7cc6f2" stroke="#7cc6f2" strokeWidth="6" strokeLinejoin="round" />
      <ellipse cx="40" cy="40" rx="8" ry="5" fill="#fff" opacity=".5" />
    </g>
  ),
  land: () => (
    <g>
      <rect x="10" y="30" width="80" height="60" rx="12" fill="#95d06f" />
      <path d="M10 60 h80" stroke="#78b956" strokeWidth="4" />
      {[22, 42, 62, 82].map((x) => <rect key={x} x={x - 4} y="22" width="8" height="40" rx="3" fill="#c8925f" />)}
      <rect x="12" y="32" width="76" height="7" rx="3" fill="#a47551" />
    </g>
  ),
}

const SKIN = ['#ffd9c2', '#f1c27d', '#c68642', '#8d5524', '#ffe0bd', '#e0ac69', '#f6cfa8', '#a46a3d']
const HAIR = ['#6e4a33', '#2f2a26', '#f2c94c', '#c0562f', '#8a5f41', '#d9d4cf', '#3b2f2f', '#e57d3a']
const BG = ['#ffd9c2', '#cdeafc', '#e6defc', '#fff1b8', '#cdeeb4', '#ffb3c1', '#a6d8f5', '#ffe58a']

export function Avatar({ index }) {
  const i = Math.abs(index) % 8
  const style = i % 3
  return (
    <g>
      <circle cx="50" cy="50" r="48" fill={BG[i]} />
      {style === 2 && <ellipse cx="50" cy="62" rx="30" ry="30" fill={HAIR[i]} />}
      <circle cx="50" cy="56" r="26" fill={SKIN[i]} />
      {style === 0 && <path d="M24 52 C24 30 76 30 76 52 C66 42 40 40 24 52Z" fill={HAIR[i]} />}
      {style === 1 && <path d="M26 50 C26 26 74 26 74 50 L70 46 L64 50 L58 44 L50 50 L42 44 L36 50 L30 46Z" fill={HAIR[i]} />}
      {style === 2 && <path d="M26 54 C24 28 76 28 74 54 C66 40 36 40 26 54Z" fill={HAIR[i]} />}
      <circle cx="41" cy="58" r="3" fill="#4a3f35" />
      <circle cx="59" cy="58" r="3" fill="#4a3f35" />
      <ellipse cx="35" cy="66" rx="4.5" ry="3" fill="#ff8fa3" opacity=".55" />
      <ellipse cx="65" cy="66" rx="4.5" ry="3" fill="#ff8fa3" opacity=".55" />
      <path d="M44 67 Q50 72 56 67" fill="none" stroke="#4a3f35" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  )
}

/** Reputation boosters (100x100). */
export const boosterArt = {
  tonic: () => (
    <g>
      <ellipse cx="50" cy="90" rx="26" ry="5" fill="#000" opacity=".08" />
      <path d="M40 14 H60 V34 Q78 42 78 62 Q78 88 50 88 Q22 88 22 62 Q22 42 40 34Z" fill="#e6f4fd" stroke="#a6d8f5" strokeWidth="3" />
      <path d="M25 60 Q50 52 75 60 Q76 84 50 85 Q24 84 25 60Z" fill="#78b956" />
      <circle cx="40" cy="70" r="4" fill="#cdeeb4" />
      <circle cx="58" cy="64" r="3" fill="#cdeeb4" />
      <rect x="37" y="8" width="26" height="10" rx="4" fill="#c8925f" />
      <path d="M50 40 Q62 28 70 34 Q62 46 50 40Z" fill="#6fbf5a" />
      <path d="M50 44 V36" stroke="#5e9c43" strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  rush: () => (
    <g>
      <g transform="rotate(-12 50 50)">
        <path d="M12 30 H88 V44 Q80 50 88 56 V70 H12 V56 Q20 50 12 44Z" fill="#ffd45c" stroke="#e8a93a" strokeWidth="3" strokeLinejoin="round" />
        <path d="M30 30 V70" stroke="#e8a93a" strokeWidth="2.5" strokeDasharray="4 4" />
        <path d="M58 33 L46 52 H56 L50 67 L66 46 H56 L62 33Z" fill="#f28b5c" />
      </g>
    </g>
  ),
  voucher: () => (
    <g>
      <rect x="14" y="24" width="72" height="54" rx="10" fill="#e6defc" stroke="#b8a6ef" strokeWidth="3" />
      <rect x="14" y="24" width="72" height="14" rx="7" fill="#b8a6ef" />
      <path d="M50 44 L55 54 L66 55 L58 62 L60 73 L50 68 L40 73 L42 62 L34 55 L45 54Z" fill="#ffd45c" stroke="#e8a93a" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="14" cy="58" r="6" fill="#fff8ec" />
      <circle cx="86" cy="58" r="6" fill="#fff8ec" />
    </g>
  ),
}
