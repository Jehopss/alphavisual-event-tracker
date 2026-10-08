import { useState } from 'react'
import { DatabaseBackup, LoaderCircle } from 'lucide-react'
import { btnGhost, btnPrimary, panel } from '../styles'

// Muncul sekali kalau browser ini masih menyimpan data dari versi lama (localStorage)
export default function ImportBanner({ count, onImport, onDismiss }) {
  const [importing, setImporting] = useState(false)

  const handleImport = async () => {
    setImporting(true)
    try {
      await onImport()
    } finally {
      setImporting(false)
    }
  }

  return (
    <section className={`${panel} p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 animate-fade-up`} aria-label="Impor data lama">
      <div className="flex items-start gap-3 flex-1">
        <span className="size-9 shrink-0 rounded-xl grid place-items-center bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <DatabaseBackup className="size-4" />
        </span>
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Ada {count} event dari versi lama di browser ini</p>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">Impor ke database supaya bisa dilihat seluruh tim. Data lama di browser tetap disimpan sebagai cadangan.</p>
        </div>
      </div>
      <div className="flex gap-2 sm:shrink-0">
        <button onClick={onDismiss} disabled={importing} className={btnGhost}>Abaikan</button>
        <button onClick={handleImport} disabled={importing} className={btnPrimary}>
          {importing && <LoaderCircle className="size-4 animate-spin" />}
          Impor {count} event
        </button>
      </div>
    </section>
  )
}
