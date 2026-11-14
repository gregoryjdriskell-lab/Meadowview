/** A business's little shop sign: its color with its signature item. */
import { CLIENTS } from '../../game/config/index.js'
import Sprite from './Sprite.jsx'

export default function ClientEmblem({ client, className = 'h-10 w-10' }) {
  const c = typeof client === 'string' ? CLIENTS[client] : client
  return (
    <div className={`grid shrink-0 place-items-center rounded-2xl p-1.5 shadow-sm ${className}`} style={{ background: c.color }}>
      <div className="grid h-full w-full place-items-center rounded-xl bg-white/85 p-0.5">
        <Sprite id={`item.${c.emblem}`} />
      </div>
    </div>
  )
}

export function RepBadge({ level, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full bg-butter-200 px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-ink ${className}`}>
      {'★'.repeat(level)}
      <span className="text-ink-soft/40">{'★'.repeat(5 - level)}</span>
    </span>
  )
}
