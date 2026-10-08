import { ChevronDown, PenLine, Trash2 } from 'lucide-react'
import BadgeSelect from './BadgeSelect'
import { KANBAN_COLUMNS, PAYMENT_OPTIONS, STATUS_OPTIONS } from '../constants'
import { iconBtn } from '../styles'
import { getPaymentBadge, getStatusBadge } from '../utils/badges'
import { formatDateOnly, formatRupiah } from '../utils/format'

// Label versi ringkas untuk kartu kanban yang sempit
const KANBAN_PAYMENT_OPTIONS = PAYMENT_OPTIONS.map((o) =>
  o.value === 'Menunggu Pelunasan' ? { ...o, label: '3. Nunggu Pelunasan' } : o,
)
const KANBAN_STATUS_OPTIONS = STATUS_OPTIONS.map((o) =>
  o.value === 'Dibatalkan' ? { ...o, label: 'Batal' } : o,
)

function KanbanCard({ event, index, onEdit, onDelete, onStatusChange, onPaymentChange }) {
  const paymentStatus = event.paymentStatus || 'Belum DP'

  return (
    <article
      className="group rounded-xl bg-white dark:bg-zinc-900 p-3.5 ring-1 ring-zinc-200/80 dark:ring-zinc-800 shadow-sm shadow-zinc-900/[0.03] animate-fade-up transition duration-200 hover:ring-zinc-300 dark:hover:ring-zinc-700 hover:shadow-md hover:shadow-zinc-900/[0.06]"
      style={{ animationDelay: `${Math.min(index, 6) * 40}ms` }}
    >
      <div className="flex items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="truncate">{formatDateOnly(event.startDate)}</span>
        <span className="shrink-0">{event.category}</span>
      </div>

      <h3 className="mt-1.5 text-sm font-semibold leading-snug text-zinc-900 dark:text-white line-clamp-2">{event.title}</h3>
      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 truncate">{event.client}</p>

      <p className="mt-3 text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{formatRupiah(event.fee || 0)}</p>

      <BadgeSelect
        className="mt-2 w-full"
        size="sm"
        ariaLabel="Ubah status pembayaran"
        value={paymentStatus}
        options={KANBAN_PAYMENT_OPTIONS}
        onChange={(value) => onPaymentChange(event.id, value)}
        badge={getPaymentBadge(paymentStatus)}
      />

      <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
        <label className="sr-only" htmlFor={`status-${event.id}`}>Pindahkan ke kolom</label>
        <div className="relative">
          <select
            id={`status-${event.id}`}
            value={event.status}
            onChange={(e) => onStatusChange(event.id, e.target.value)}
            className="h-7 appearance-none rounded-lg bg-zinc-100 dark:bg-zinc-800 pl-2.5 pr-7 text-xs font-medium text-zinc-700 dark:text-zinc-200 cursor-pointer hover:bg-zinc-200/70 dark:hover:bg-zinc-700 transition"
          >
            {KANBAN_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" aria-hidden="true" />
        </div>

        <div className="flex items-center">
          <button onClick={() => onEdit(event)} title="Edit event" aria-label="Edit event" className={`${iconBtn} size-7!`}>
            <PenLine className="size-3.5" />
          </button>
          <button
            onClick={() => onDelete(event)}
            title="Hapus event"
            aria-label="Hapus event"
            className={`${iconBtn} size-7! hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10`}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </article>
  )
}

export default function KanbanView({ events, ...cardHandlers }) {
  return (
    <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto pb-4 snap-x snap-mandatory md:snap-none">
      <div className="grid grid-flow-col auto-cols-[78%] sm:auto-cols-[45%] md:grid-flow-row md:grid-cols-5 gap-3 md:min-w-[1040px]">
        {KANBAN_COLUMNS.map((status) => {
          const colEvents = events.filter((e) => e.status === status)
          const total = colEvents.reduce((acc, e) => acc + (Number(e.fee) || 0), 0)
          return (
            <section
              key={status}
              aria-label={`Kolom ${status}`}
              className="snap-start flex flex-col rounded-2xl bg-zinc-100/70 dark:bg-zinc-900/50 ring-1 ring-inset ring-zinc-200/60 dark:ring-zinc-800/60 p-2"
            >
              <header className="px-2 pt-1.5 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${getStatusBadge(status).dot}`} aria-hidden="true" />
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">{status}</h2>
                  <span className="ml-auto text-xs font-medium tabular-nums text-zinc-500 dark:text-zinc-400">{colEvents.length}</span>
                </div>
                <p className="mt-1 pl-4 text-xs tabular-nums text-zinc-500 dark:text-zinc-400 truncate">{formatRupiah(total)}</p>
              </header>

              <div className="flex-1 space-y-2 overflow-y-auto max-h-[68vh] p-0.5 -m-0.5">
                {colEvents.length === 0 ? (
                  <div className="py-10 text-center text-xs text-zinc-400 dark:text-zinc-500 rounded-xl border border-dashed border-zinc-300/80 dark:border-zinc-800">
                    Belum ada event
                  </div>
                ) : (
                  colEvents.map((evt, i) => <KanbanCard key={evt.id} event={evt} index={i} {...cardHandlers} />)
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
