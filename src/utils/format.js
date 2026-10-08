// Standar format penulisan rupiah Indonesia: Rp. 2.000.000,-
export function formatRupiah(num) {
  if (num === null || num === undefined || isNaN(num)) return 'Rp. 0,-'
  const cleanNum = Math.round(Number(num))
  return `Rp. ${cleanNum.toLocaleString('id-ID')},-`
}

// Input helper: ubah string ketikan jadi angka (buang karakter non-digit)
export function parseFeeInput(value) {
  const digits = String(value).replace(/\D/g, '')
  return digits ? parseInt(digits, 10) : 0
}

// Input helper: format ribuan otomatis untuk ditampilkan di field form
export function formatFeeInput(num) {
  return num ? Math.round(num).toLocaleString('id-ID') : ''
}

export function formatDateOnly(isoString) {
  if (!isoString) return '-'
  const d = new Date(isoString)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTimeRange(startStr, endStr) {
  if (!startStr) return '-'
  const start = new Date(startStr)
  const datePart = start.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  const startTime = start.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })

  if (!endStr) {
    return `${datePart} • ${startTime} WIB`
  }

  const end = new Date(endStr)
  const endTime = end.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${datePart} • ${startTime} - ${endTime} WIB`
}

// Pecahan tanggal untuk tile kalender di kartu: { day: '14', month: 'Okt', weekday: 'Rab' }
export function getDateParts(isoString) {
  if (!isoString) return null
  const d = new Date(isoString)
  if (isNaN(d)) return null
  return {
    day: String(d.getDate()),
    month: d.toLocaleDateString('id-ID', { month: 'short' }).replace('.', ''),
    weekday: d.toLocaleDateString('id-ID', { weekday: 'short' }),
    year: d.getFullYear(),
  }
}

export function formatTimeRange(startStr, endStr) {
  if (!startStr) return '-'
  const opts = { hour: '2-digit', minute: '2-digit', hour12: false }
  const startTime = new Date(startStr).toLocaleTimeString('id-ID', opts)
  if (!endStr) return `${startTime} WIB`
  const endTime = new Date(endStr).toLocaleTimeString('id-ID', opts)
  return `${startTime} - ${endTime} WIB`
}

export function formatLongDate(dateObj) {
  return dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatDateTimeInput(dateObj) {
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  const hours = String(dateObj.getHours()).padStart(2, '0')
  const minutes = String(dateObj.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}
