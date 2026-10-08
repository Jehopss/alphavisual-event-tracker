import { useCallback, useMemo, useState } from 'react'
import Header from './components/Header'
import StatsCards from './components/StatsCards'
import Toolbar from './components/Toolbar'
import ListView from './components/ListView'
import KanbanView from './components/KanbanView'
import EventDrawer from './components/EventDrawer'
import Toast from './components/Toast'
import { useEvents } from './hooks/useEvents'
import { useTheme } from './hooks/useTheme'
import { useToast } from './hooks/useToast'
import { DEFAULT_FILTERS, filterAndSortEvents, hasActiveFilters } from './utils/filter'
import { exportToCSV, exportToJSON } from './utils/export'
import { formatLongDate } from './utils/format'

function App() {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents()
  const { isDark, toggleTheme } = useTheme()
  const { toast, showToast } = useToast()

  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [view, setView] = useState('list') // 'list' | 'kanban'
  const [editor, setEditor] = useState(null) // null = tertutup, { event: null } = tambah, { event } = edit
  const [today] = useState(() => formatLongDate(new Date()))

  const filteredEvents = useMemo(() => filterAndSortEvents(events, filters), [events, filters])
  const isFiltered = hasActiveFilters(filters)

  const openNewEvent = () => setEditor({ event: null })
  const closeEditor = useCallback(() => setEditor(null), [])
  const resetFilters = () => setFilters((f) => ({ ...DEFAULT_FILTERS, sort: f.sort }))

  const handleSave = (data) => {
    if (editor?.event) {
      updateEvent(editor.event.id, data)
      showToast('Perubahan event tersimpan.')
    } else {
      addEvent(data)
      showToast('Event baru tercatat.')
    }
    setEditor(null)
  }

  const cardHandlers = {
    onEdit: (event) => setEditor({ event }),
    onDelete: (event) => {
      deleteEvent(event.id)
      showToast(`"${event.title || 'Event'}" dihapus.`)
    },
    onStatusChange: (id, status) => {
      updateEvent(id, { status })
      showToast(`Progres diubah ke ${status}.`)
    },
    onPaymentChange: (id, paymentStatus) => {
      updateEvent(id, { paymentStatus })
      showToast(`Pembayaran diubah ke ${paymentStatus}.`)
    },
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
      />

      <main id="konten" className="max-w-7xl mx-auto w-full flex-1 px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-8">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{today}</p>
          <h1 className="mt-1 text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white">Agenda event</h1>
        </div>

        <StatsCards events={events} />

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

          {view === 'list' ? (
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
      </main>

      {editor && (
        <EventDrawer
          key={editor.event?.id ?? 'new'}
          event={editor.event}
          onClose={closeEditor}
          onSave={handleSave}
        />
      )}

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  )
}

export default App
