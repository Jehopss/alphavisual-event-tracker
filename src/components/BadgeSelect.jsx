import { ChevronDown } from 'lucide-react'

const SIZES = {
  md: { select: 'h-7 pl-6 pr-7 text-xs', dot: 'left-2.5 size-1.5', chevron: 'right-2 size-3.5' },
  sm: { select: 'h-6 pl-5 pr-6 text-[11px]', dot: 'left-2 size-1.5', chevron: 'right-1.5 size-3' },
}

// Dropdown berbentuk pill: latar tipis sesuai state, teks netral, titik warna sebagai identitas
export default function BadgeSelect({ value, options, onChange, badge, size = 'md', ariaLabel, className = '' }) {
  const s = SIZES[size]
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <span className={`absolute rounded-full pointer-events-none z-10 ${s.dot} ${badge.dot}`} aria-hidden="true" />
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none cursor-pointer rounded-full font-medium text-zinc-800 dark:text-zinc-100 ring-1 ring-inset transition hover:brightness-[0.97] dark:hover:brightness-125 ${s.select} ${badge.tint}`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className={`absolute pointer-events-none text-zinc-500 dark:text-zinc-400 ${s.chevron}`} aria-hidden="true" />
    </div>
  )
}
