// Data versi lama (sebelum pakai database). Hanya dibaca untuk fitur impor.
export const STORAGE_KEY = 'alphavisual_events_data_v1'
export const LEGACY_STORAGE_KEYS = ['eventledger_events_data_v2', 'eventledger_events_data_v1']
export const IMPORTED_FLAG_KEY = 'alphavisual_legacy_imported_v1'
export const CONNECT_FLAG_KEY = 'alphavisual_connecting_calendar'
export const LOGO_STORAGE_KEY = 'alphavisual_custom_logo_v1'
export const THEME_STORAGE_KEY = 'eventledger_theme'

export const STATUS_OPTIONS = [
  { value: 'Inquiry', label: 'Inquiry', longLabel: 'Inquiry (Prospek)' },
  { value: 'Negosiasi', label: 'Negosiasi', longLabel: 'Negosiasi' },
  { value: 'Confirmed', label: 'Confirmed', longLabel: 'Confirmed' },
  { value: 'Selesai', label: 'Selesai', longLabel: 'Selesai' },
  { value: 'Dibatalkan', label: 'Dibatalkan', longLabel: 'Dibatalkan' },
]

export const PAYMENT_OPTIONS = [
  { value: 'Belum DP', label: '1. Belum DP' },
  { value: 'Sudah DP', label: '2. Sudah DP' },
  { value: 'Menunggu Pelunasan', label: '3. Menunggu Pelunasan' },
  { value: 'Lunas', label: '4. Lunas' },
]

export const CATEGORY_OPTIONS = [
  { value: 'Wedding', label: 'Wedding' },
  { value: 'Corporate', label: 'Corporate / Kantor' },
  { value: 'Music/Gig', label: 'Music / Gig' },
  { value: 'Birthday', label: 'Birthday / Party' },
  { value: 'Workshop', label: 'Workshop / Seminar' },
  { value: 'Lainnya', label: 'Lainnya' },
]

export const SORT_OPTIONS = [
  { value: 'date-asc', label: 'Tanggal Terdekat' },
  { value: 'date-desc', label: 'Tanggal Terjauh' },
  { value: 'fee-desc', label: 'Honor Tertinggi' },
  { value: 'fee-asc', label: 'Honor Terendah' },
  { value: 'created-desc', label: 'Baru Ditambahkan' },
]

export const KANBAN_COLUMNS = STATUS_OPTIONS.map((o) => o.value)
