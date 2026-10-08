import { ChevronDown, LayoutGrid, Search, SquareKanban, X } from 'lucide-react'
import { CATEGORY_OPTIONS, PAYMENT_OPTIONS, SORT_OPTIONS, STATUS_OPTIONS } from '../constants'
import { fieldBase, selectBase } from '../styles'

function FilterSelect({ label, value, onChange, allLabel, options, optionLabel = 'label' }) {
  const active = allLabel && value !== 'ALL'
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${selectBase} w-full ${active ? 'ring-zinc-400 dark:ring-zinc-600 font-medium' : ''}`}
      >
        {allLabel && <option value="ALL">{allLabel}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o[optionLabel]}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
    </div>
  )
}

function ViewButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium transition duration-200 ${
        active
          ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm shadow-zinc-900/5'
          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
      }`}
    >
      <Icon className="size-4" />
      <span className="hidden sm:inline">{children}</span>
    </button>
  )
}

export default function Toolbar({ filters, onFiltersChange, onResetFilters, isFiltered, view, onViewChange, shownCount, totalCount }) {
  const setFilter = (key) => (value) => onFiltersChange({ ...filters, [key]: value })

  return (
    <section aria-label="Filter event" className="space-y-3 print:hidden">
      <div className="flex flex-col xl:flex-row gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
          <input
            type="search"
            aria-label="Cari event"
            value={filters.search}
            onChange={(e) => setFilter('search')(e.target.value)}
            placeholder="Cari event, klien, venue, atau catatan"
            className={`${fieldBase} pl-9`}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 xl:flex gap-2">
          <FilterSelect label="Filter progres" value={filters.status} onChange={setFilter('status')} allLabel="Semua progres" options={STATUS_OPTIONS} optionLabel="longLabel" />
          <FilterSelect label="Filter pembayaran" value={filters.payment} onChange={setFilter('payment')} allLabel="Semua pembayaran" options={PAYMENT_OPTIONS} />
          <FilterSelect label="Filter kategori" value={filters.category} onChange={setFilter('category')} allLabel="Semua kategori" options={CATEGORY_OPTIONS} />
          <FilterSelect label="Urutkan" value={filters.sort} onChange={setFilter('sort')} options={SORT_OPTIONS} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
          <span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{shownCount}</span>
            {isFiltered ? ` dari ${totalCount} event` : ' event'}
          </span>
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 rounded-md text-zinc-600 dark:text-zinc-300 hover:text-brand-600 dark:hover:text-brand-400 transition"
            >
              <X className="size-3.5" />
              Reset filter
            </button>
          )}
        </div>

        <div className="inline-flex rounded-xl p-1 bg-zinc-200/60 dark:bg-zinc-800/80" role="group" aria-label="Tampilan">
          <ViewButton active={view === 'list'} onClick={() => onViewChange('list')} icon={LayoutGrid}>Daftar</ViewButton>
          <ViewButton active={view === 'kanban'} onClick={() => onViewChange('kanban')} icon={SquareKanban}>Pipeline</ViewButton>
        </div>
      </div>
    </section>
  )
}
