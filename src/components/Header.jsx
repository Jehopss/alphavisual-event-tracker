import { Moon, Plus, Sun } from 'lucide-react'
import Logo from './Logo'
import ExportMenu from './ExportMenu'
import { btnPrimary, iconBtn } from '../styles'

export default function Header({ isDark, onToggleTheme, onExportCSV, onExportJSON, onAddEvent, onLogoUploaded, accountMenu }) {
  return (
    <header className="sticky top-0 z-30 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200/70 dark:border-zinc-800/70 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Logo onUploaded={onLogoUploaded} />

        <nav aria-label="Aksi utama" className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onToggleTheme}
            aria-label={isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
            title={isDark ? 'Mode terang' : 'Mode gelap'}
            className={`${iconBtn} size-10 rounded-xl`}
          >
            {isDark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
          </button>

          <ExportMenu onExportCSV={onExportCSV} onExportJSON={onExportJSON} />

          <button onClick={onAddEvent} className={`${btnPrimary} max-sm:w-10 max-sm:px-0`}>
            <Plus className="size-4" />
            <span className="sr-only sm:not-sr-only">Tambah event</span>
          </button>

          {accountMenu && <div className="sm:ml-1 sm:pl-3 sm:border-l border-zinc-200 dark:border-zinc-800">{accountMenu}</div>}
        </nav>
      </div>
    </header>
  )
}
