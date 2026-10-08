import { Clock, ExternalLink, MapPin, PenLine, Trash2 } from 'lucide-react'
import BadgeSelect from './BadgeSelect'
import { CATEGORY_OPTIONS, PAYMENT_OPTIONS, STATUS_OPTIONS } from '../constants'
import { panel, iconBtn } from '../styles'
import { getPaymentBadge, getStatusBadge } from '../utils/badges'
import { formatRupiah, formatTimeRange, getDateParts } from '../utils/format'

const categoryLabel = (value) => CATEGORY_OPTIONS.find((o) => o.value === value)?.label || value || 'Event'

function DateTile({ startDate, muted }) {
  const parts = getDateParts(startDate)
  return (
    <div
      className={`shrink-0 w-14 rounded-xl py-2 text-center ring-1 ring-inset ${
        muted
          ? 'bg-zinc-50 dark:bg-zinc-800/50 ring-zinc-200 dark:ring-zinc-800 text-zinc-400 dark:text-zinc-500'
          : 'bg-brand-50 dark:bg-brand-500/10 ring-brand-100 dark:ring-brand-500/20 text-brand-700 dark:text-brand-300'
      }`}
    >
      {parts ? (
        <>
          <p className="text-[11px] font-medium uppercase leading-none">{parts.month}</p>
          <p className="mt-1 text-xl font-semibold leading-none tracking-tight text-zinc-900 dark:text-white">{parts.day}</p>
          <p className="mt-1 text-[11px] leading-none">{parts.weekday}</p>
        </>
      ) : (
        <p className="text-xs">-</p>
      )}
    </div>
  )
}

export default function EventCard({ event, index = 0, onEdit, onDelete, onStatusChange, onPaymentChange }) {
  const paymentStatus = event.paymentStatus || 'Belum DP'
  const isClosed = event.status === 'Selesai' || event.status === 'Dibatalkan'

  return (
    <article
      className={`${panel} group flex flex-col p-5 animate-fade-up transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-zinc-900/[0.06] dark:hover:shadow-black/30 hover:ring-zinc-300/80 dark:hover:ring-zinc-700`}
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      <div className="flex items-start gap-4">
        <DateTile startDate={event.startDate} muted={isClosed} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{categoryLabel(event.category)}</span>
            <BadgeSelect
              ariaLabel="Ubah status progres"
              value={event.status}
              options={STATUS_OPTIONS}
              onChange={(value) => onStatusChange(event.id, value)}
              badge={getStatusBadge(event.status)}
            />
          </div>
          <h3 className="mt-1.5 text-[15px] font-semibold leading-snug text-zinc-900 dark:text-white line-clamp-2">
            {event.title}
          </h3>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400 truncate">{event.client || '-'}</p>
        </div>
      </div>

      <dl className="mt-4 space-y-1.5 text-sm text-zinc-600 dark:text-zinc-300">
        <div className="flex items-center gap-2">
          <dt className="sr-only">Waktu</dt>
          <Clock className="size-4 shrink-0 text-zinc-400" aria-hidden="true" />
          <dd>{formatTimeRange(event.startDate, event.endDate)}</dd>
        </div>
        {event.location && (
          <div className="flex items-center gap-2">
            <dt className="sr-only">Lokasi</dt>
            <MapPin className="size-4 shrink-0 text-zinc-400" aria-hidden="true" />
            <dd className="truncate">{event.location}</dd>
          </div>
        )}
      </dl>

      {event.notes && (
        <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-2">{event.notes}</p>
      )}

      {/* Footer selalu menempel di bawah agar sejajar antar kartu */}
      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-4">
          <div className="min-w-0">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Honor</p>
            <p className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100 truncate">
              {formatRupiah(event.fee || 0)}
            </p>
          </div>
          <BadgeSelect
            ariaLabel="Ubah status pembayaran"
            value={paymentStatus}
            options={PAYMENT_OPTIONS}
            onChange={(value) => onPaymentChange(event.id, value)}
            badge={getPaymentBadge(paymentStatus)}
          />
        </div>

        <div className="mt-3 flex items-center justify-end gap-0.5 sm:opacity-60 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
          {event.docLink && (
            <a href={event.docLink} target="_blank" rel="noopener noreferrer" title="Buka dokumen / rundown" aria-label="Buka dokumen / rundown" className={iconBtn}>
              <ExternalLink className="size-4" />
            </a>
          )}
          <button onClick={() => onEdit(event)} title="Edit event" aria-label="Edit event" className={iconBtn}>
            <PenLine className="size-4" />
          </button>
          <button
            onClick={() => onDelete(event)}
            title="Hapus event"
            aria-label="Hapus event"
            className={`${iconBtn} hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10`}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </article>
  )
}
