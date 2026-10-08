import { CalendarPlus, SearchX } from 'lucide-react'
import EventCard from './EventCard'
import { btnPrimary, btnSecondary } from '../styles'

export function EmptyState({ isFiltered, onAddEvent, onResetFilters }) {
  return (
    <div className="flex flex-col items-center text-center py-20 px-6 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 animate-fade-in">
      <div className="size-12 rounded-2xl bg-white dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800 flex items-center justify-center text-zinc-400">
        {isFiltered ? <SearchX className="size-5" /> : <CalendarPlus className="size-5" />}
      </div>
      <h2 className="mt-4 text-base font-semibold text-zinc-900 dark:text-white">
        {isFiltered ? 'Tidak ada event yang cocok' : 'Belum ada event'}
      </h2>
      <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
        {isFiltered
          ? 'Coba kata kunci lain atau longgarkan filter yang sedang aktif.'
          : 'Catat event pertama untuk mulai memantau jadwal, pipeline, dan pembayaran.'}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {isFiltered && (
          <button onClick={onResetFilters} className={btnSecondary}>Reset filter</button>
        )}
        <button onClick={onAddEvent} className={btnPrimary}>Tambah event</button>
      </div>
    </div>
  )
}

export default function ListView({ events, isFiltered, onAddEvent, onResetFilters, ...cardHandlers }) {
  if (events.length === 0) {
    return <EmptyState isFiltered={isFiltered} onAddEvent={onAddEvent} onResetFilters={onResetFilters} />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {events.map((evt, i) => (
        <EventCard key={evt.id} event={evt} index={i} {...cardHandlers} />
      ))}
    </div>
  )
}
