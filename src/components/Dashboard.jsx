import { useCallback, useMemo, useState } from 'react'
import Header from './Header'
import AccountMenu from './AccountMenu'
import ImportBanner from './ImportBanner'
import StatsCards from './StatsCards'
import Toolbar from './Toolbar'
import ListView, { ListSkeleton } from './ListView'
import KanbanView from './KanbanView'
import EventDrawer from './EventDrawer'
import Toast from './Toast'
import { LoadError } from './AuthScreens'
import { useEvents } from '../hooks/useEvents'
import { useGoogleCalendar } from '../hooks/useGoogleCalendar'
import { useTheme } from '../hooks/useTheme'
import { useToast } from '../hooks/useToast'
import { markLegacyImported, readLegacyEvents } from '../lib/legacyStorage'
import { DEFAULT_FILTERS, filterAndSortEvents, hasActiveFilters } from '../utils/filter'
import { exportToCSV, exportToJSON } from '../utils/export'
import { formatLongDate } from '../utils/format'

export default function Dashboard({ user, onSignOut }) {
  const { toast, showToast } = useToast()
  const { isDark, toggleTheme } = useTheme()
  const calendar = useGoogleCalendar({ user, notify: showToast })
  const { events, status, reload, addEvent, updateEvent, deleteEvent, importEvents } = useEvents({
    enabled: true,
    onSyncError: () => showToast('Data tersimpan, tapi sinkronisasi Google Calendar gagal.', 'error'),
  })

  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [view, setView] = useState('list') // 'list' | 'kanban'
  const [editor, setEditor] = useState(null) // null = tertutup, { event: null } = tambah, { event } = edit
  const [today] = useState(() => formatLongDate(new Date()))
  const [legacyEvents, setLegacyEvents] = useState(readLegacyEvents)

  const filteredEvents = useMemo(() => filterAndSortEvents(events, filters), [events, filters])
  const isFiltered = hasActiveFilters(filters)
  const isLoading = status === 'loading'

  const openNewEvent = () => setEditor({ event: null })
  const closeEditor = useCallback(() => setEditor(null), [])
  const resetFilters = () => setFilters((f) => ({ ...DEFAULT_FILTERS, sort: f.sort }))

  const handleSave = async (data) => {
    try {
      if (editor?.event) {
        await updateEvent(editor.event.id, data)
        showToast('Perubahan event tersimpan.')
      } else {
        await addEvent(data)
        showToast('Event baru tercatat.')
      }
      setEditor(null)
    } catch (err) {
      console.error(err)
      showToast('Gagal menyimpan event. Periksa koneksi lalu coba lagi.', 'error')
      throw err // biar drawer tetap terbuka
    }
  }

  const run = async (action, success, failure) => {
    try {
      await action()
      showToast(success)
    } catch (err) {
      console.error(err)
      showToast(failure, 'error')
    }
  }

  const cardHandlers = {
    onEdit: (event) => setEditor({ event }),
    onDelete: (event) =>
      run(() => deleteEvent(event.id), `"${event.title || 'Event'}" dihapus.`, 'Gagal menghapus event.'),
    onStatusChange: (id, value) =>
      run(() => updateEvent(id, { status: value }), `Progres diubah ke ${value}.`, 'Gagal mengubah progres.'),
    onPaymentChange: (id, value) =>
      run(() => updateEvent(id, { paymentStatus: value }), `Pembayaran diubah ke ${value}.`, 'Gagal mengubah pembayaran.'),
  }

  const handleImport = async () => {
    try {
      const count = await importEvents(legacyEvents)
      markLegacyImported()
      setLegacyEvents([])
      showToast(`${count} event lama berhasil diimpor.`)
    } catch (err) {
      console.error(err)
      showToast('Impor gagal. Data lama tetap aman di browser ini.', 'error')
    }
  }

  const dismissImport = () => {
    markLegacyImported()
    setLegacyEvents([])
  }

  const handleExportCSV = () => {
    if (events.length === 0) {
      showToast('Belum ada data event untuk diekspor.')
      return
    }
    exportToCSV(events)
    showToast('File CSV diunduh.')
  }

  const handleExportJSON = () => {
    exportToJSON(events)
    showToast('Backup JSON diunduh.')
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-zinc-900 focus:shadow-lg"
      >
        Lewati ke konten
      </a>

      <Header
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        onAddEvent={openNewEvent}
        onLogoUploaded={() => showToast('Logo Alpha Visual terpasang.')}
        accountMenu={<AccountMenu user={user} calendar={calendar} onSignOut={onSignOut} />}
      />

      <main id="konten" className="max-w-7xl mx-auto w-full flex-1 px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-8">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{today}</p>
          <h1 className="mt-1 text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white">Agenda event</h1>
        </div>

        {status === 'ready' && legacyEvents.length > 0 && (
          <ImportBanner count={legacyEvents.length} onImport={handleImport} onDismiss={dismissImport} />
        )}

        {status === 'error' ? (
          <LoadError onRetry={reload} />
        ) : (
          <>
            <StatsCards events={events} loading={isLoading} />

            <div className="space-y-4">
              <Toolbar
                filters={filters}
                onFiltersChange={setFilters}
                onResetFilters={resetFilters}
                isFiltered={isFiltered}
                view={view}
                onViewChange={setView}
                shownCount={filteredEvents.length}
                totalCount={events.length}
              />

              {isLoading ? (
                <ListSkeleton />
              ) : view === 'list' ? (
                <ListView
                  events={filteredEvents}
                  isFiltered={isFiltered}
                  onAddEvent={openNewEvent}
                  onResetFilters={resetFilters}
                  {...cardHandlers}
                />
              ) : (
                <KanbanView events={filteredEvents} {...cardHandlers} />
              )}
            </div>
          </>
        )}
      </main>

      {editor && (
        <EventDrawer
          key={editor.event?.id ?? 'new'}
          event={editor.event}
          onClose={closeEditor}
          onSave={handleSave}
        />
      )}

      <Toast message={toast.message} tone={toast.tone} visible={toast.visible} />
    </div>
  )
}
