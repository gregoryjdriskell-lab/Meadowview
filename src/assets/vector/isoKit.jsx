/**
 * Tiny isometric drawing kit for sprite art.
 *
 * isoFrame(w, h) gives a projector P(gx, gy, z) for a w*h footprint drawn in a
 * square (w+h)*100 box: the footprint diamond sits at the bottom, and z lifts
 * points straight up (in art units). Light comes from the left: +y faces are lit,
 * +x faces are in shade.
 */

export function isoFrame(w, h) {
  const S = (w + h) * 100
  const P = (gx, gy, z = 0) => [(gx - gy) * 100 + h * 100, (gx + gy) * 50 + S - (w + h) * 50 - z]
  return { S, P }
}

export const pts = (list) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

/** Darken (amt < 0) or lighten (amt > 0) a #rrggbb color. */
export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16)
  const ch = (v) => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)))
  const r = ch(n >> 16)
  const g = ch((n >> 8) & 255)
  const b = ch(n & 255)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

/** Polygon with softly rounded corners. */
export function Poly({ points, fill, stroke, round = 3, ...rest }) {
  return <polygon points={pts(points)} fill={fill} stroke={stroke ?? fill} strokeWidth={round} strokeLinejoin="round" {...rest} />
}

/** Footprint-aligned rectangle on the ground (or at height z). */
export const floorRect = (P, x0, y0, x1, y1, z = 0) => [P(x0, y0, z), P(x1, y0, z), P(x1, y1, z), P(x0, y1, z)]
/** Rectangle on the +y wall plane (y = const), spanning gx and z. */
export const wallY = (P, y, gx0, gx1, z0, z1) => [P(gx0, y, z0), P(gx1, y, z0), P(gx1, y, z1), P(gx0, y, z1)]
/** Rectangle on the +x wall plane (x = const), spanning gy and z. */
export const wallX = (P, x, gy0, gy1, z0, z1) => [P(x, gy0, z0), P(x, gy1, z0), P(x, gy1, z1), P(x, gy0, z1)]

/** A box: lit +y face, shaded +x face, top. */
export function Prism({ P, x0, y0, x1, y1, z0 = 0, z1, color, top }) {
  return (
    <g>
      <Poly points={wallY(P, y1, x0, x1, z0, z1)} fill={color} />
      <Poly points={wallX(P, x1, y0, y1, z0, z1)} fill={shade(color, -0.14)} />
      <Poly points={floorRect(P, x0, y0, x1, y1, z1)} fill={top ?? shade(color, 0.12)} />
    </g>
  )
}

/** Gable roof over a box. axis: direction the ridge runs ('x' or 'y'). */
export function GableRoof({ P, x0, y0, x1, y1, z, rise, axis = 'x', color, end }) {
  const zr = z + rise
  const back = shade(color, -0.2)
  const gable = end ?? shade(color, -0.08)
  if (axis === 'x') {
    const ym = (y0 + y1) / 2
    return (
      <g>
        <Poly points={[P(x0, y0, z), P(x1, y0, z), P(x1, ym, zr), P(x0, ym, zr)]} fill={back} />
        <Poly points={[P(x1, y0, z), P(x1, y1, z), P(x1, ym, zr)]} fill={gable} />
        <Poly points={[P(x0, y1, z), P(x1, y1, z), P(x1, ym, zr), P(x0, ym, zr)]} fill={color} />
        <polyline points={pts([P(x0, ym, zr), P(x1, ym, zr)])} stroke={shade(color, 0.25)} strokeWidth="5" strokeLinecap="round" fill="none" />
      </g>
    )
  }
  const xm = (x0 + x1) / 2
  return (
    <g>
      <Poly points={[P(x0, y0, z), P(x0, y1, z), P(xm, y1, zr), P(xm, y0, zr)]} fill={back} />
      <Poly points={[P(x0, y1, z), P(x1, y1, z), P(xm, y1, zr)]} fill={gable} />
      <Poly points={[P(x1, y0, z), P(x1, y1, z), P(xm, y1, zr), P(xm, y0, zr)]} fill={shade(color, -0.1)} />
      <polyline points={pts([P(xm, y0, zr), P(xm, y1, zr)])} stroke={shade(color, 0.25)} strokeWidth="5" strokeLinecap="round" fill="none" />
    </g>
  )
}

/** Soft drop shadow under a footprint area. */
export const GroundShadow = ({ P, x0, y0, x1, y1 }) => (
  <Poly points={floorRect(P, x0 + 0.06, y0 + 0.1, x1 + 0.1, y1 + 0.08)} fill="#3d5a2a" opacity=".16" round={10} />
)

/** An "iso circle" (ellipse on the ground plane) as polygon points. */
export function groundCircle(P, cx, cy, r, z = 0, n = 28) {
  return Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2
    return P(cx + r * Math.cos(t), cy + r * Math.sin(t), z)
  })
}

/** A camera-facing round sign showing another sprite's art. */
export function Badge({ at, r = 30, ring, children }) {
  const [x, y] = at
  return (
    <g>
      <circle cx={x} cy={y + 3} r={r} fill="#000" opacity=".1" />
      <circle cx={x} cy={y} r={r} fill="#fff" stroke={ring} strokeWidth="5" />
      <g transform={`translate(${x - r * 0.8} ${y - r * 0.8}) scale(${(r * 1.6) / 100})`}>{children}</g>
    </g>
  )
}
