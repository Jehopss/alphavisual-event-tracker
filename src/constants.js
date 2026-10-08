export const STORAGE_KEY = 'alphavisual_events_data_v1'
export const LEGACY_STORAGE_KEYS = ['eventledger_events_data_v2', 'eventledger_events_data_v1']
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

// Initial Indonesian Seed Data
export const INITIAL_SAMPLE_EVENTS = [
  {
    id: 'evt-101',
    title: 'Wedding Reception: Citra & Dimas',
    client: 'Citra Kirana (Pribadi)',
    category: 'Wedding',
    startDate: '2026-10-14T18:00',
    endDate: '2026-10-14T22:30',
    location: 'Grand Ballroom The Ritz-Carlton, Pacific Place Jakarta',
    fee: 12500000,
    status: 'Confirmed',
    paymentStatus: 'Sudah DP',
    docLink: 'https://docs.google.com/document/d/sample-rundown-wedding',
    notes: 'Soundcheck jam 15.00 WIB. Dresscode Black Tie. Total 600 undangan.',
    createdAt: '2026-09-18T10:00:00',
  },
  {
    id: 'evt-102',
    title: 'Annual Tech Summit Gala Night',
    client: 'PT Sinergi Digital Indonesia',
    category: 'Corporate',
    startDate: '2026-11-05T09:00',
    endDate: '2026-11-05T17:00',
    location: 'ICE BSD City Hall 3A, Tangerang',
    fee: 22000000,
    status: 'Negosiasi',
    paymentStatus: 'Belum DP',
    docLink: '',
    notes: 'Menunggu approval PO dari direktur keuangan. Draft proposal sudah dikirim.',
    createdAt: '2026-09-20T14:30:00',
  },
  {
    id: 'evt-103',
    title: 'Sunset Acoustic Live Session',
    client: 'La Brisa Club Bali',
    category: 'Music/Gig',
    startDate: '2026-10-28T17:00',
    endDate: '2026-10-28T21:00',
    location: 'Echo Beach Canggu, Bali',
    fee: 8000000,
    status: 'Inquiry',
    paymentStatus: 'Belum DP',
    docLink: '',
    notes: 'Inquiry via WhatsApp. Menanyakan ketersediaan tanggal & rider teknis audio.',
    createdAt: '2026-09-22T08:15:00',
  },
  {
    id: 'evt-104',
    title: 'Workshop Desain & Fotografi Kreatif',
    client: 'Komunitas Seni Visual Jakarta',
    category: 'Workshop',
    startDate: '2026-09-10T13:00',
    endDate: '2026-09-10T16:00',
    location: 'Kolega Co-working Space, Senopati',
    fee: 4500000,
    status: 'Selesai',
    paymentStatus: 'Lunas',
    docLink: 'https://drive.google.com/sample-materi',
    notes: 'Acara sukses berjalan lancar, pelunasan honor sudah selesai 100%.',
    createdAt: '2026-09-01T09:00:00',
  },
]
