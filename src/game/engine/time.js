/** "1h 05m", "2m 09s", "45s" */
export function formatDuration(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h) return `${h}h ${String(m).padStart(2, '0')}m`
  if (m) return `${m}m ${String(s).padStart(2, '0')}s`
  return `${s}s`
}

export const progress = (start, end, now) => (end <= start ? 1 : Math.min(1, Math.max(0, (now - start) / (end - start))))
