import { Hammer, ClipboardList, Warehouse } from 'lucide-react'

function NavButton({ icon: Icon, label, onClick, badge, color }) {
  return (
    <button onClick={onClick} className="relative flex flex-col items-center gap-1 active:scale-95">
      <span className={`grid h-14 w-14 place-items-center rounded-2xl text-white shadow-[0_4px_0_rgba(0,0,0,0.12)] ${color}`}>
        <Icon size={28} strokeWidth={2.25} />
      </span>
      <span className="text-xs font-semibold text-ink">{label}</span>
      {badge > 0 && (
        <span className="absolute -right-1 -top-1 grid h-6 min-w-6 animate-pop place-items-center rounded-full bg-berry-500 px-1.5 text-xs font-bold text-white ring-2 ring-cream">
          {badge}
        </span>
      )}
    </button>
  )
}

export default function BottomBar({ onShop, onOrders, onBarn, readyOrders }) {
  return (
    <nav className="pb-safe relative z-20 flex justify-around rounded-t-[1.75rem] bg-cream px-6 pt-3 shadow-[0_-6px_20px_rgba(74,63,53,0.10)]">
      <NavButton icon={Hammer} label="Build" onClick={onShop} color="bg-peach-400" />
      <NavButton icon={ClipboardList} label="Orders" onClick={onOrders} badge={readyOrders} color="bg-meadow-500" />
      <NavButton icon={Warehouse} label="Barn" onClick={onBarn} color="bg-pond-400" />
    </nav>
  )
}
