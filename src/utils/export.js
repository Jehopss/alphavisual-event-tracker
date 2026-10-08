import { formatRupiah } from './format'

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const today = () => new Date().toISOString().slice(0, 10)
const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`

export function exportToCSV(events) {
  const headers = ['ID', 'Nama Event', 'Klien', 'Kategori', 'Waktu Mulai', 'Waktu Selesai', 'Lokasi', 'Honor/Fee (Format Rp)', 'Status Progres', 'Status Pembayaran', 'Link Dokumen', 'Catatan']
  const rows = events.map((e) => [
    e.id,
    e.title,
    e.client,
    e.category,
    e.startDate,
    e.endDate,
    e.location,
    formatRupiah(e.fee || 0),
    e.status,
    e.paymentStatus || 'Belum DP',
    e.docLink,
    e.notes,
  ].map(csvCell))

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  downloadBlob(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }), `Alpha_Visual_Events_${today()}.csv`)
}

export function exportToJSON(events) {
  const json = JSON.stringify(events, null, 2)
  downloadBlob(new Blob([json], { type: 'application/json' }), `Backup_AlphaVisual_${today()}.json`)
}
