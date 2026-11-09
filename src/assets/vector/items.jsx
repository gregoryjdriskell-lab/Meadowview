/**
 * Item icons (crops + products). Each renders into a 100x100 box.
 * These are also nested inside factory signs, so keep them self-contained.
 */

const Wheat = () => (
  <g>
    {[-16, 0, 16].map((a) => (
      <g key={a} transform={`rotate(${a} 50 88)`}>
        <line x1="50" y1="88" x2="50" y2="30" stroke="#c9a23f" strokeWidth="4" strokeLinecap="round" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <ellipse cx="45" cy={30 + i * 9} rx="4.5" ry="7.5" transform={`rotate(-28 45 ${30 + i * 9})`} fill="#f2c94c" />
            <ellipse cx="55" cy={30 + i * 9} rx="4.5" ry="7.5" transform={`rotate(28 55 ${30 + i * 9})`} fill="#f6d365" />
          </g>
        ))}
        <ellipse cx="50" cy="20" rx="4.5" ry="8" fill="#f6d365" />
      </g>
    ))}
    <rect x="38" y="66" width="24" height="8" rx="4" fill="#e2725b" />
  </g>
)

const Corn = () => (
  <g>
    <ellipse cx="50" cy="46" rx="17" ry="36" fill="#ffd85e" />
    {[0, 1, 2, 3, 4, 5, 6].map((r) =>
      [-8, 0, 8].map((dx) => <circle key={`${r}${dx}`} cx={50 + dx} cy={20 + r * 8} r="3" fill="#f2bd3c" />),
    )}
    <path d="M50 94 C30 86 22 62 28 40 C38 54 44 72 50 94Z" fill="#7fbf6a" />
    <path d="M50 94 C70 86 78 62 72 40 C62 54 56 72 50 94Z" fill="#6aae58" />
  </g>
)

const Carrot = () => (
  <g>
    <ellipse cx="42" cy="22" rx="5" ry="14" transform="rotate(-25 42 22)" fill="#6fbf5a" />
    <ellipse cx="50" cy="18" rx="5" ry="15" fill="#7fcf68" />
    <ellipse cx="58" cy="22" rx="5" ry="14" transform="rotate(25 58 22)" fill="#6fbf5a" />
    <path d="M50 94 C44 82 30 52 33 40 C36 30 64 30 67 40 C70 52 56 82 50 94Z" fill="#ff9a52" />
    <path d="M38 50 h8 M56 62 h7 M42 72 h6" stroke="#e57d3a" strokeWidth="3" strokeLinecap="round" />
  </g>
)

const Sugarcane = () => (
  <g>
    {[[-12, 34], [0, 50], [12, 66]].map(([a, x]) => (
      <g key={x} transform={`rotate(${a / 2} ${x} 90)`}>
        <rect x={x - 6} y="16" width="12" height="76" rx="5" fill="#b8dd7a" />
        {[34, 54, 74].map((y) => <rect key={y} x={x - 6} y={y} width="12" height="4" fill="#8fbf55" />)}
        <ellipse cx={x - 8} cy="16" rx="4" ry="12" transform={`rotate(-30 ${x - 8} 16)`} fill="#7cc45f" />
        <ellipse cx={x + 8} cy="16" rx="4" ry="12" transform={`rotate(30 ${x + 8} 16)`} fill="#6fb75e" />
      </g>
    ))}
  </g>
)

const Strawberry = () => (
  <g>
    <path d="M50 92 C30 80 18 58 22 44 C26 32 40 30 50 34 C60 30 74 32 78 44 C82 58 70 80 50 92Z" fill="#ff6b81" />
    {[[38, 48], [52, 46], [64, 52], [44, 62], [58, 66], [50, 78], [34, 58]].map(([x, y]) => (
      <ellipse key={`${x}${y}`} cx={x} cy={y} rx="2" ry="3" fill="#ffe08a" />
    ))}
    <path d="M50 36 L36 26 L46 30 L42 18 L50 28 L58 18 L54 30 L64 26 Z" fill="#5fae5f" stroke="#5fae5f" strokeWidth="4" strokeLinejoin="round" />
  </g>
)

const Bread = () => (
  <g>
    <ellipse cx="50" cy="82" rx="38" ry="6" fill="#000" opacity=".08" />
    <path d="M12 66 C12 40 30 28 50 28 C70 28 88 40 88 66 C88 74 82 80 74 80 H26 C18 80 12 74 12 66Z" fill="#e3a565" />
    <path d="M22 54 C24 42 36 34 50 34 C64 34 76 42 78 54" fill="none" stroke="#f2c18c" strokeWidth="5" strokeLinecap="round" />
    {[32, 50, 68].map((x) => (
      <path key={x} d={`M${x - 6} 58 L${x + 6} 46`} stroke="#c77f3f" strokeWidth="4.5" strokeLinecap="round" />
    ))}
  </g>
)

const Cornbread = () => (
  <g>
    <rect x="10" y="52" width="80" height="30" rx="7" fill="#c97b4a" />
    <rect x="15" y="36" width="70" height="34" rx="7" fill="#ffd36b" />
    <rect x="15" y="36" width="70" height="10" rx="5" fill="#f0b94a" />
    <path d="M38 40 V68 M62 40 V68 M15 54 H85" stroke="#e3a83f" strokeWidth="3" />
  </g>
)

const Popcorn = () => (
  <g>
    {[[34, 34], [48, 26], [62, 32], [40, 20], [56, 16], [70, 42], [28, 44], [50, 38]].map(([x, y]) => (
      <circle key={`${x}${y}`} cx={x} cy={y} r="10" fill="#fff7e0" stroke="#f2d28a" strokeWidth="2" />
    ))}
    <path d="M24 44 L76 44 L67 94 L33 94Z" fill="#fff" />
    <path d="M34 44 L40 94 H33 L24 44Z M50 44 h8 v50 h-8Z M68 44 h8 L67 94 H60Z" fill="#ff6b6b" />
  </g>
)

const Sugar = () => (
  <g>
    {[[16, 52], [50, 52], [33, 22]].map(([x, y]) => (
      <g key={`${x}${y}`}>
        <rect x={x} y={y} width="34" height="32" rx="7" fill="#ffffff" stroke="#a9c1de" strokeWidth="4" />
        <rect x={x + 5} y={y + 5} width="12" height="6" rx="3" fill="#dbe8f6" />
      </g>
    ))}
  </g>
)

const CarrotCake = () => (
  <g>
    <ellipse cx="50" cy="86" rx="42" ry="9" fill="#e6f0f8" />
    <rect x="16" y="46" width="68" height="38" rx="6" fill="#e9b07a" />
    <rect x="16" y="62" width="68" height="5" fill="#fff3e0" />
    <ellipse cx="50" cy="46" rx="34" ry="10" fill="#fff3e0" />
    <path d="M20 48 q4 10 8 0 q4 8 8 0 q4 10 8 0 q4 8 8 0 q4 10 8 0 q4 8 8 0" fill="#fff3e0" />
    {[36, 50, 64].map((x) => (
      <g key={x}>
        <path d={`M${x - 3} 40 L${x + 3} 40 L${x} 48Z`} fill="#ff9a52" />
        <ellipse cx={x} cy="38" rx="2" ry="4" fill="#6fbf5a" />
      </g>
    ))}
  </g>
)

const Jam = () => (
  <g>
    <rect x="24" y="34" width="52" height="58" rx="12" fill="#e8455c" />
    <rect x="31" y="42" width="7" height="34" rx="3.5" fill="#fff" opacity=".45" />
    <rect x="22" y="20" width="56" height="16" rx="5" fill="#fff" />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={24 + i * 14} y="20" width="7" height="16" fill="#ff8fa3" />)}
    <circle cx="56" cy="64" r="12" fill="#fff8ec" />
    <circle cx="56" cy="65" r="5" fill="#ff6b81" />
  </g>
)

export const itemArt = {
  wheat: Wheat,
  corn: Corn,
  carrot: Carrot,
  sugarcane: Sugarcane,
  strawberry: Strawberry,
  bread: Bread,
  cornbread: Cornbread,
  popcorn: Popcorn,
  sugar: Sugar,
  carrotcake: CarrotCake,
  jam: Jam,
}
