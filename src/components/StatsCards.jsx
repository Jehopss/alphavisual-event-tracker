import { useMemo } from 'react'
import { PAYMENT_OPTIONS } from '../constants'
import { panel } from '../styles'
import { getPaymentBadge } from '../utils/badges'
import { computeStats } from '../utils/filter'
import { formatDateTimeRange, formatRupiah } from '../utils/format'

// Nominal besar: "Rp." dan ",-" dibuat lebih redup agar angkanya yang menonjol
function Money({ value, className = '' }) {
  const digits = Math.round(Number(value) || 0).toLocaleString('id-ID')
  return (
    <span className={className}>
      <span className="text-[0.5em] font-medium text-zinc-400 dark:text-zinc-500 mr-1.5 align-[0.45em]">Rp.</span>
      {digits}
      <span className="text-zinc-300 dark:text-zinc-600">,-</span>
    </span>
  )
}

function StatTile({ label, value, note, className = '' }) {
  return (
    <div className={`${panel} p-5 flex flex-col justify-between gap-6 ${className}`}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      <div>
        <p className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white">{value}</p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{note}</p>
      </div>
    </div>
  )
}

function RevenueTile({ confirmed, potential, next }) {
  const ratio = potential > 0 ? confirmed / potential : 0
  const percent = Math.round(ratio * 100)

  return (
    <div className={`${panel} relative overflow-hidden p-6 sm:p-7 flex flex-col justify-between gap-10 col-span-2 lg:row-span-2`}>
      {/* Cahaya brand yang sangat halus di sudut tile */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-28 size-80 rounded-full bg-[radial-gradient(closest-side,var(--color-brand-200),transparent)] opacity-60 dark:bg-[radial-gradient(closest-side,var(--color-brand-900),transparent)] dark:opacity-50"
      />

      <div className="relative">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Revenue confirmed</p>
        <p className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          <Money value={confirmed} />
        </p>
        {next && (
          <div className="mt-6 max-w-md rounded-xl bg-zinc-50/80 dark:bg-zinc-800/50 ring-1 ring-inset ring-zinc-200/70 dark:ring-zinc-700/50 px-4 py-3">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Confirmed berikutnya</p>
            <p className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{next.title}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{formatDateTimeRange(next.startDate, next.endDate)}</p>
          </div>
        )}
      </div>

      <div className="relative">
        <div className="flex items-baseline justify-between gap-4 text-sm">
          <span className="text-zinc-600 dark:text-zinc-300">
            <span className="font-semibold text-zinc-900 dark:text-white">{percent}%</span> dari potensi
          </span>
          <span className="text-zinc-500 dark:text-zinc-400 truncate">{formatRupiah(potential)}</span>
        </div>
        <div
          role="meter"
          aria-label="Revenue confirmed dibanding potensi"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="mt-3 h-2 rounded-full bg-brand-100 dark:bg-brand-950"
        >
          <div
            className="h-full rounded-full bg-brand-600 dark:bg-brand-500 transition-[width] duration-700 ease-out"
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">Potensi dihitung dari semua event yang tidak dibatalkan.</p>
      </div>
    </div>
  )
}

function PaymentTile({ counts, total }) {
  const segments = PAYMENT_OPTIONS.map((o) => ({
    key: o.value,
    label: o.value,
    count: counts[o.value] || 0,
    dot: getPaymentBadge(o.value).dot,
  }))
  const summary = segments.map((s) => `${s.label} ${s.count}`).join(', ')

  return (
    <div className={`${panel} p-5 flex flex-col justify-between gap-5 col-span-2`}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Status pembayaran</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{total} event</p>
      </div>

      {/* Stacked bar: gap 2px antar segmen, ujung 4px, tooltip per segmen */}
      <div role="img" aria-label={`Distribusi pembayaran: ${summary}`} className="flex gap-0.5 h-3">
        {total === 0 ? (
          <div className="flex-1 rounded-[4px] bg-zinc-100 dark:bg-zinc-800" />
        ) : (
          segments.filter((s) => s.count > 0).map((s) => (
            <div key={s.key} className="group relative h-full first:*:rounded-l-[4px] last:*:rounded-r-[4px]" style={{ flexGrow: s.count }}>
              <div className={`h-full ${s.dot} transition-opacity group-hover:opacity-80`} />
              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded-lg bg-zinc-900 dark:bg-zinc-100 px-2 py-1 text-xs font-medium text-white dark:text-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {s.label}: {s.count} ({Math.round((s.count / total) * 100)}%)
              </span>
            </div>
          ))
        )}
      </div>

      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {segments.map((s) => (
          <li key={s.key} className="flex items-center gap-2 text-sm">
            <span className={`size-2 shrink-0 rounded-full ${s.dot}`} aria-hidden="true" />
            <span className="text-zinc-600 dark:text-zinc-400">{s.label}</span>
            <span className="font-medium tabular-nums text-zinc-900 dark:text-zinc-100">{s.count}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function StatsCards({ events }) {
  const stats = useMemo(() => computeStats(events), [events])

  return (
    <section aria-label="Ringkasan" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <RevenueTile confirmed={stats.confirmedRevenue} potential={stats.potentialRevenue} next={stats.nextConfirmed} />
      <StatTile label="Total event" value={stats.total} note={`${stats.upcoming} akan datang`} />
      <StatTile label="Confirmed" value={stats.confirmed} note={`${stats.upcomingConfirmed} akan datang`} />
      <PaymentTile counts={stats.payment} total={stats.total} />
    </section>
  )
}
