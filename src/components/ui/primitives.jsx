import { X } from 'lucide-react'
import Sprite from './Sprite.jsx'

export function Sheet({ title, icon, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      <button aria-label="Close" className="absolute inset-0 animate-fade-in bg-ink/20" onClick={onClose} />
      <div className="pb-safe relative mx-auto flex max-h-[72dvh] w-full max-w-xl animate-sheet-up flex-col rounded-t-[2rem] bg-cream shadow-[0_-8px_30px_rgba(74,63,53,0.18)]">
        <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-cream-dark" />
        <div className="flex items-center gap-3 px-5 pb-2 pt-2">
          {icon && <div className="h-9 w-9 shrink-0">{icon}</div>}
          <h2 className="flex-1 text-xl font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full bg-cream-dark text-ink-soft active:scale-95">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-4">{children}</div>
        {footer && <div className="border-t border-cream-dark px-4 pt-3">{footer}</div>}
      </div>
    </div>
  )
}

export function CoinTag({ amount, className = '', size = 'h-4 w-4' }) {
  return (
    <span className={`inline-flex items-center gap-1 font-semibold tabular-nums ${className}`}>
      <Sprite id="ui.coin" className={size} />
      {amount}
    </span>
  )
}

export function XpTag({ amount, className = '', size = 'h-4 w-4' }) {
  return (
    <span className={`inline-flex items-center gap-1 font-semibold tabular-nums ${className}`}>
      <Sprite id="ui.xp" className={size} />
      {amount}
    </span>
  )
}

/** Small item chip showing have/need, red when short. */
export function ItemNeed({ id, need, have }) {
  const short = have < need
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-semibold tabular-nums ${short ? 'bg-berry-300/40 text-berry-500' : 'bg-meadow-200 text-meadow-600'}`}>
      <Sprite id={`item.${id}`} className="h-5 w-5" />
      {Math.min(have, need)}/{need}
    </span>
  )
}

export function ProgressBar({ value, className = '', color = 'bg-meadow-500' }) {
  return (
    <div className={`h-2.5 overflow-hidden rounded-full bg-cream-dark ${className}`}>
      <div className={`h-full rounded-full ${color} transition-[width] duration-500 ease-linear`} style={{ width: `${Math.round(value * 100)}%` }} />
    </div>
  )
}

const VARIANTS = {
  primary: 'bg-meadow-500 text-white shadow-[0_3px_0_#5e9c43] active:translate-y-[2px] active:shadow-[0_1px_0_#5e9c43]',
  warm: 'bg-peach-400 text-white shadow-[0_3px_0_#f28b5c] active:translate-y-[2px] active:shadow-[0_1px_0_#f28b5c]',
  soft: 'bg-cream-dark text-ink active:scale-95',
  danger: 'bg-berry-400 text-white shadow-[0_3px_0_#f2667f] active:translate-y-[2px] active:shadow-[0_1px_0_#f2667f]',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-5 py-3 text-lg',
  icon: 'h-11 w-11 shrink-0',
  iconSm: 'h-9 w-9 shrink-0',
}

export function Button({ variant = 'primary', size = 'md', className = '', disabled, children, ...rest }) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-2xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
