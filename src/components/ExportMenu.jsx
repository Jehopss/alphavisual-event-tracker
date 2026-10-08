import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Download, FileJson, FileSpreadsheet, Printer } from 'lucide-react'
import { btnSecondary } from '../styles'

function MenuItem({ icon: Icon, title, description, onClick }) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className="w-full flex items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition"
    >
      <Icon className="size-4 mt-0.5 shrink-0 text-zinc-500 dark:text-zinc-400" />
      <span>
        <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</span>
        <span className="block text-xs text-zinc-500 dark:text-zinc-400">{description}</span>
      </span>
    </button>
  )
}

export default function ExportMenu({ onExportCSV, onExportJSON }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  // Tutup saat klik di luar menu atau menekan Escape
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const run = (action) => () => {
    setOpen(false)
    action()
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`${btnSecondary} px-3`}
      >
        <Download className="size-4" />
        <span className="hidden sm:inline">Ekspor</span>
        <ChevronDown className={`size-3.5 text-zinc-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 z-50 w-72 origin-top-right animate-pop-in rounded-2xl bg-white dark:bg-zinc-900 p-1.5 ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-xl shadow-zinc-900/10 dark:shadow-black/40"
        >
          <MenuItem icon={FileSpreadsheet} title="Unduh CSV" description="Untuk Excel atau Google Sheets" onClick={run(onExportCSV)} />
          <MenuItem icon={FileJson} title="Unduh backup JSON" description="Salinan lengkap semua data event" onClick={run(onExportJSON)} />
          <div className="my-1 h-px bg-zinc-100 dark:bg-zinc-800" />
          <MenuItem icon={Printer} title="Cetak agenda" description="Simpan sebagai PDF lewat dialog cetak" onClick={run(() => window.print())} />
        </div>
      )}
    </div>
  )
}
