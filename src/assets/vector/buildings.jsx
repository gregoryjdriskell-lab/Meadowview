/**
 * Isometric building sprites. Each renders into a square (w+h)*100 box with its
 * footprint diamond at the bottom (see isoKit.jsx). Art is assembled from a few
 * parametric templates, so a new building is mostly a matter of choosing colors.
 */
import { itemArt } from './items.jsx'
import { animalArt } from './animals.jsx'
import { Badge, GableRoof, GroundShadow, Poly, Prism, floorRect, groundCircle, isoFrame, shade, wallX, wallY } from './isoKit.jsx'

const PAVING = '#efe3cc'
const GLASS = '#cdeefd'

function Glass({ points }) {
  return <Poly points={points} fill={GLASS} stroke="#ffffff" round={5} />
}

// ── Homes ──────────────────────────────────────────────────

function Cottage({ wall, roof, door, flowerBox = false }) {
  const { P } = isoFrame(2, 2)
  const [x0, y0, x1, y1, zt] = [0.35, 0.4, 1.65, 1.6, 72]
  return (
    <g>
      <Poly points={floorRect(P, 0.08, 0.08, 1.92, 1.92)} fill="#bfe39d" round={14} />
      <Poly points={floorRect(P, 0.86, 1.6, 1.14, 1.98)} fill={PAVING} />
      <GroundShadow P={P} x0={x0} y0={y0} x1={x1} y1={y1} />
      <Prism P={P} x0={x0} y0={y0} x1={x1} y1={y1} z1={zt} color={wall} />
      <Poly points={wallY(P, y1, 0.86, 1.14, 0, 44)} fill={door} />
      <circle cx={P(1.09, y1, 22)[0]} cy={P(1.09, y1, 22)[1]} r="3" fill="#ffd45c" />
      {[[0.48, 0.74], [1.26, 1.52]].map(([a, b]) => (
        <g key={a}>
          <Glass points={wallY(P, y1, a, b, 30, 54)} />
          {flowerBox && (
            <g>
              <Poly points={wallY(P, y1 + 0.05, a - 0.02, b + 0.02, 22, 30)} fill="#a47551" />
              {[0.2, 0.5, 0.8].map((t, i) => {
                const [cx, cy] = P(a + (b - a) * t, y1 + 0.05, 33)
                return <circle key={t} cx={cx} cy={cy} r="5" fill={['#ff8fa3', '#ffd45c', '#cbbcf5'][i]} />
              })}
            </g>
          )}
        </g>
      ))}
      {[[0.6, 0.86], [1.14, 1.4]].map(([a, b]) => (
        <Glass key={a} points={wallX(P, x1, a, b, 30, 54)} />
      ))}
      <GableRoof P={P} x0={0.24} y0={0.3} x1={1.76} y1={1.72} z={zt} rise={58} color={roof} end={shade(wall, -0.08)} />
      <Prism P={P} x0={1.18} y0={0.62} x1={1.36} y1={0.8} z0={100} z1={150} color="#c8a080" />
      <circle className="smoke" cx={P(1.27, 0.71, 168)[0]} cy={P(1.27, 0.71, 168)[1]} r="9" fill="#fff" />
    </g>
  )
}

// ── Factories ──────────────────────────────────────────────

function Workshop({ wall, roof, awningA, awningB, door, product, chimney = false }) {
  const { P } = isoFrame(2, 2)
  const Icon = itemArt[product]
  const [x0, y0, x1, y1, zt] = [0.25, 0.25, 1.75, 1.45, 82]
  const stripes = 6
  return (
    <g>
      <Poly points={floorRect(P, 0.05, 0.05, 1.95, 1.95)} fill={PAVING} round={12} />
      <GroundShadow P={P} x0={x0} y0={y0} x1={x1} y1={y1} />
      <Prism P={P} x0={x0} y0={y0} x1={x1} y1={y1} z1={zt} color={wall} />
      {/* storefront */}
      <Glass points={wallY(P, y1, 0.38, 1.08, 16, 52)} />
      <Poly points={wallY(P, y1 + 0.04, 0.34, 1.12, 10, 16)} fill="#c8925f" />
      <Poly points={wallY(P, y1, 1.24, 1.6, 0, 56)} fill={door} />
      <Glass points={wallX(P, x1, 0.45, 1.15, 28, 58)} />
      {/* awning */}
      {Array.from({ length: stripes }, (_, i) => {
        const a = x0 + ((x1 - x0) * i) / stripes
        const b = x0 + ((x1 - x0) * (i + 1)) / stripes
        return <Poly key={i} points={[P(a, y1, 78), P(b, y1, 78), P(b, y1 + 0.26, 60), P(a, y1 + 0.26, 60)]} fill={i % 2 ? awningB : awningA} round={2} />
      })}
      <Poly points={wallY(P, y1 + 0.26, x0, x1, 52, 60)} fill={shade(awningA, -0.08)} round={2} />
      <GableRoof P={P} x0={0.14} y0={0.14} x1={1.86} y1={1.56} z={zt} rise={46} color={roof} end={shade(wall, -0.08)} />
      {chimney && (
        <g>
          <Prism P={P} x0={1.42} y0={0.36} x1={1.6} y1={0.54} z0={100} z1={162} color="#c8a080" />
          <circle className="smoke" cx={P(1.51, 0.45, 178)[0]} cy={P(1.51, 0.45, 178)[1]} r="10" fill="#fff" />
          <circle className="smoke delay" cx={P(1.51, 0.45, 178)[0] + 6} cy={P(1.51, 0.45, 178)[1]} r="7" fill="#fff" />
        </g>
      )}
      {Icon && (
        <Badge at={P(0.85, 0.85, 168)} r={34} ring={roof}>
          <Icon />
        </Badge>
      )}
    </g>
  )
}

// ── Animal pens ────────────────────────────────────────────

function Fence({ P, color = '#a47551' }) {
  const lo = 0.07
  const hi = 1.93
  const edges = [
    [[lo, lo], [hi, lo]],
    [[lo, lo], [lo, hi]],
    [[lo, hi], [hi, hi]],
    [[hi, lo], [hi, hi]],
  ]
  const posts = []
  for (const [[ax, ay], [bx, by]] of edges) {
    const n = 6
    for (let i = 0; i <= n; i++) posts.push([ax + ((bx - ax) * i) / n, ay + ((by - ay) * i) / n])
  }
  const rail = (z) =>
    edges.map(([[ax, ay], [bx, by]], i) => {
      const [p, q] = [P(ax, ay, z), P(bx, by, z)]
      return <line key={`${z}${i}`} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={shade(color, 0.15)} strokeWidth="6" strokeLinecap="round" />
    })
  return (
    <g>
      {rail(14)}
      {rail(28)}
      {posts.map(([gx, gy], i) => {
        const [p, q] = [P(gx, gy, 0), P(gx, gy, 38)]
        return <line key={i} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={color} strokeWidth="8" strokeLinecap="round" />
      })}
    </g>
  )
}

function Pen({ ground, wall, roof, animal, pond = false }) {
  const { P } = isoFrame(2, 2)
  const Icon = animalArt[animal]
  return (
    <g>
      <Poly points={floorRect(P, 0.04, 0.04, 1.96, 1.96)} fill={shade(ground, -0.12)} round={14} />
      <Poly points={floorRect(P, 0.08, 0.08, 1.92, 1.92)} fill={ground} round={14} />
      {pond && (
        <g>
          <Poly points={groundCircle(P, 1.18, 1.18, 0.62)} fill="#7cc6f2" round={6} />
          <Poly points={groundCircle(P, 1.18, 1.16, 0.54)} fill="#a6d8f5" round={6} />
          <Poly points={groundCircle(P, 1.0, 1.0, 0.12)} fill="#cdeafc" round={4} />
        </g>
      )}
      <Fence P={P} />
      <GroundShadow P={P} x0={0.12} y0={0.12} x1={0.72} y1={0.72} />
      <Prism P={P} x0={0.12} y0={0.12} x1={0.72} y1={0.72} z1={46} color={wall} />
      <Poly points={wallY(P, 0.72, 0.3, 0.54, 0, 32)} fill="#6e4a33" />
      <GableRoof P={P} x0={0.06} y0={0.06} x1={0.78} y1={0.8} z={46} rise={34} axis="y" color={roof} end={shade(wall, -0.08)} />
      <line x1={P(1.62, 0.2, 0)[0]} y1={P(1.62, 0.2, 0)[1]} x2={P(1.62, 0.2, 70)[0]} y2={P(1.62, 0.2, 70)[1]} stroke="#8a5f41" strokeWidth="7" strokeLinecap="round" />
      {Icon && (
        <Badge at={P(1.62, 0.2, 96)} r={28} ring={roof}>
          <Icon />
        </Badge>
      )}
    </g>
  )
}

// ── Small things ──────────────────────────────────────────

function Board() {
  const { P } = isoFrame(2, 1)
  const y = 0.5
  return (
    <g>
      <Poly points={floorRect(P, 0.04, 0.06, 1.96, 0.94)} fill={PAVING} round={12} />
      <Poly points={floorRect(P, 0.2, 0.5, 1.84, 0.64)} fill="#3d5a2a" opacity=".14" />
      {[0.28, 1.72].map((gx) => {
        const [p, q] = [P(gx, y, 0), P(gx, y, 120)]
        return <line key={gx} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke="#8a5f41" strokeWidth="11" strokeLinecap="round" />
      })}
      <Poly points={wallY(P, y, 0.12, 1.88, 46, 128)} fill="#c8925f" stroke="#a47551" round={7} />
      <Poly points={wallY(P, y, 0.12, 1.88, 124, 136)} fill="#a47551" round={4} />
      {[[0.26, '#fff8ec'], [0.8, '#fff1b8'], [1.34, '#ffd9c2']].map(([a, c]) => (
        <g key={a}>
          <Poly points={wallY(P, y + 0.01, a, a + 0.4, 58, 116)} fill={c} />
          {[100, 88, 76].map((z) => {
            const [p, q] = [P(a + 0.08, y + 0.01, z), P(a + 0.32, y + 0.01, z)]
            return <line key={z} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke="#c9b8a4" strokeWidth="3.5" strokeLinecap="round" />
          })}
          <circle cx={P(a + 0.2, y + 0.01, 112)[0]} cy={P(a + 0.2, y + 0.01, 112)[1]} r="5" fill="#f2667f" />
        </g>
      ))}
    </g>
  )
}

function Tree() {
  const { P } = isoFrame(1, 1)
  const [bx, by] = P(0.5, 0.5)
  return (
    <g>
      <Poly points={groundCircle(P, 0.56, 0.56, 0.34)} fill="#3d5a2a" opacity=".18" round={6} />
      <rect x={bx - 9} y={by - 64} width="18" height="66" rx="7" fill="#a47551" />
      <rect x={bx + 1} y={by - 64} width="8" height="66" rx="4" fill="#8a5f41" />
      <circle cx={bx} cy={by - 98} r="52" fill="#6fbf5a" />
      <circle cx={bx - 32} cy={by - 76} r="32" fill="#7fcf68" />
      <circle cx={bx + 34} cy={by - 74} r="30" fill="#5fae4f" />
      <circle cx={bx - 14} cy={by - 122} r="18" fill="#9be07f" />
    </g>
  )
}

function Flowers() {
  const { P } = isoFrame(1, 1)
  const blooms = [
    [0.3, 0.3, '#ff8fa3'], [0.62, 0.28, '#ffd45c'], [0.3, 0.64, '#cbbcf5'],
    [0.52, 0.5, '#ffa877'], [0.72, 0.62, '#ff8fa3'], [0.6, 0.78, '#cbbcf5'], [0.82, 0.36, '#ffd45c'],
  ].sort((a, b) => a[0] + a[1] - (b[0] + b[1]))
  return (
    <g>
      <Prism P={P} x0={0.1} y0={0.1} x1={0.9} y1={0.9} z1={8} color="#a47551" top="#b9875e" />
      {blooms.map(([gx, gy, c]) => {
        const [x, y] = P(gx, gy, 8)
        return (
          <g key={`${gx}${gy}`}>
            <line x1={x} y1={y} x2={x} y2={y - 18} stroke="#5fae5f" strokeWidth="4" strokeLinecap="round" />
            <ellipse cx={x + 7} cy={y - 7} rx="7" ry="3.5" fill="#6fbf5a" />
            {[0, 72, 144, 216, 288].map((a) => (
              <circle key={a} cx={x + 7 * Math.cos((a * Math.PI) / 180)} cy={y - 22 + 7 * Math.sin((a * Math.PI) / 180)} r="6" fill={c} />
            ))}
            <circle cx={x} cy={y - 22} r="4" fill="#fff1b8" />
          </g>
        )
      })}
    </g>
  )
}

export function FieldSoil() {
  const { P } = isoFrame(1, 1)
  return (
    <g>
      <Prism P={P} x0={0.06} y0={0.06} x1={0.94} y1={0.94} z1={9} color="#a7744d" top="#b9875e" />
      {[0.28, 0.5, 0.72].map((gy) => {
        const [p, q] = [P(0.14, gy, 9), P(0.86, gy, 9)]
        return <line key={gy} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke="#9c6a44" strokeWidth="6" strokeLinecap="round" />
      })}
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
  feedmill: () => <Workshop wall="#fdf0d5" roof="#b07a4f" awningA="#f6d58a" awningB="#ffffff" door="#8a5f41" product="poultryfeed" />,
  dairy: () => <Workshop wall="#ffffff" roof="#7cc6f2" awningA="#a6d8f5" awningB="#ffffff" door="#4ba3d6" product="cheese" />,
  textile: () => <Workshop wall="#fff0f5" roof="#e08bb0" awningA="#f7b6cf" awningB="#ffffff" door="#c96d95" product="fabric" chimney />,
  tailor: () => <Workshop wall="#eefaf3" roof="#5fb38a" awningA="#9fdcbc" awningB="#ffffff" door="#3f8f68" product="tshirt" />,
  downmill: () => <Workshop wall="#f3f6ff" roof="#8ea5d8" awningA="#c9d6f5" awningB="#ffffff" door="#6b82b8" product="pillow" chimney />,
  florist: () => <Workshop wall="#fff7fb" roof="#ff7eb3" awningA="#ffd1e3" awningB="#ffffff" door="#d95c92" product="bouquet" />,
  coop: () => <Pen ground="#e9d3a8" wall="#ffe9d1" roof="#e57d5a" animal="chicken" />,
  pasture: () => <Pen ground="#a9dc87" wall="#fff8ec" roof="#c0562f" animal="cow" />,
  sheepfold: () => <Pen ground="#b8e39a" wall="#f1ecff" roof="#8a6fc0" animal="sheep" />,
  duckpond: () => <Pen ground="#a9dc87" wall="#eef7ff" roof="#4ba3d6" animal="duck" pond />,
  board: Board,
  tree: Tree,
  flowers: Flowers,
}
