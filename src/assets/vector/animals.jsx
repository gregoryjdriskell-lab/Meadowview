/** Animal sprites (100x100, facing right, feet at y≈88). Shown inside pens. */

const Shadow = () => <ellipse cx="50" cy="90" rx="30" ry="6" fill="#3d5a2a" opacity=".18" />

const Chicken = () => (
  <g>
    <Shadow />
    <path d="M42 76 V90 M56 76 V90" stroke="#f2a33c" strokeWidth="4" strokeLinecap="round" />
    <path d="M22 52 Q12 40 18 30 Q26 40 32 44Z" fill="#c97b4a" />
    <ellipse cx="46" cy="60" rx="26" ry="22" fill="#e8a96a" />
    <ellipse cx="42" cy="60" rx="14" ry="10" fill="#d38b4f" />
    <circle cx="68" cy="38" r="14" fill="#e8a96a" />
    <path d="M60 26 Q63 18 67 24 Q70 16 74 24 Q78 20 77 28Z" fill="#f2667f" />
    <path d="M80 38 L90 42 L80 46Z" fill="#f2a33c" />
    <path d="M76 48 Q79 54 75 56 Q72 52 76 48Z" fill="#f2667f" />
    <circle cx="72" cy="36" r="2.8" fill="#4a3f35" />
  </g>
)

const Cow = () => (
  <g>
    <Shadow />
    <path d="M14 46 Q6 56 10 66" fill="none" stroke="#e2d3c3" strokeWidth="3" strokeLinecap="round" />
    {[22, 34, 56, 68].map((x) => <rect key={x} x={x} y="68" width="8" height="22" rx="3" fill="#f3ece4" />)}
    {[22, 34, 56, 68].map((x) => <rect key={`h${x}`} x={x} y="84" width="8" height="6" rx="2" fill="#6e4a33" />)}
    <rect x="14" y="40" width="64" height="36" rx="16" fill="#fff" />
    <path d="M26 42 Q34 40 36 50 Q32 60 22 54Z M52 58 Q62 52 66 62 Q62 72 50 68Z" fill="#6e4a33" />
    <ellipse cx="44" cy="76" rx="8" ry="4" fill="#ffb3c1" />
    <rect x="66" y="22" width="26" height="30" rx="12" fill="#fff" />
    <ellipse cx="80" cy="48" rx="13" ry="8" fill="#ffc9d3" />
    <circle cx="76" cy="48" r="1.8" fill="#c97b8a" />
    <circle cx="84" cy="48" r="1.8" fill="#c97b8a" />
    <circle cx="74" cy="34" r="2.6" fill="#4a3f35" />
    <circle cx="86" cy="34" r="2.6" fill="#4a3f35" />
    <path d="M68 22 Q64 14 68 12 M90 22 Q94 14 90 12" fill="none" stroke="#f2d7b6" strokeWidth="4" strokeLinecap="round" />
    <ellipse cx="64" cy="28" rx="7" ry="4" fill="#6e4a33" transform="rotate(-20 64 28)" />
  </g>
)

const Sheep = () => (
  <g>
    <Shadow />
    {[30, 42, 56, 66].map((x) => <rect key={x} x={x} y="66" width="7" height="24" rx="3" fill="#4a3f35" />)}
    {[[30, 50, 16], [48, 44, 18], [64, 52, 15], [40, 62, 16], [58, 64, 15], [24, 62, 12]].map(([x, y, r]) => (
      <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="#fff8ec" stroke="#e9dcc5" strokeWidth="2" />
    ))}
    <ellipse cx="78" cy="44" rx="11" ry="14" fill="#4a3f35" />
    <ellipse cx="68" cy="36" rx="7" ry="4" fill="#4a3f35" transform="rotate(-25 68 36)" />
    <circle cx="74" cy="32" r="8" fill="#fff8ec" />
    <circle cx="81" cy="42" r="2.4" fill="#fff" />
    <ellipse cx="82" cy="52" rx="4" ry="2" fill="#ffb3c1" opacity=".6" />
  </g>
)

const Duck = () => (
  <g>
    <ellipse cx="50" cy="80" rx="34" ry="8" fill="#7cc6f2" opacity=".55" />
    <path d="M18 60 Q20 48 30 54Z" fill="#f2f2f2" />
    <ellipse cx="46" cy="64" rx="28" ry="17" fill="#fff" stroke="#e6edf5" strokeWidth="2" />
    <path d="M30 60 Q44 52 56 62 Q44 70 30 60Z" fill="#e6edf5" />
    <path d="M62 60 Q60 40 66 30" stroke="#fff" strokeWidth="14" strokeLinecap="round" fill="none" />
    <circle cx="68" cy="30" r="12" fill="#fff" />
    <path d="M78 30 Q92 30 90 36 Q84 38 76 36Z" fill="#f2a33c" />
    <circle cx="71" cy="27" r="2.6" fill="#4a3f35" />
    <ellipse cx="66" cy="34" rx="3.5" ry="2" fill="#ffb3c1" opacity=".6" />
  </g>
)

export const animalArt = { chicken: Chicken, cow: Cow, sheep: Sheep, duck: Duck }
