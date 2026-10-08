import { IMPORTED_FLAG_KEY, LEGACY_STORAGE_KEYS, STORAGE_KEY } from '../constants'

// Data event dari versi lama yang tersimpan di localStorage browser ini.
// Mengembalikan [] kalau tidak ada, sudah pernah diimpor, atau storage tidak bisa diakses.
export function readLegacyEvents() {
  try {
    if (localStorage.getItem(IMPORTED_FLAG_KEY)) return []
    const stored = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS].map((key) => localStorage.getItem(key)).find(Boolean)
    if (!stored) return []
    const list = JSON.parse(stored)
    if (!Array.isArray(list)) return []
    return list
      .filter((e) => e && e.title && e.client && e.startDate)
      .map((e) => ({
        title: String(e.title),
        client: String(e.client),
        category: e.category || 'Lainnya',
        startDate: e.startDate,
        endDate: e.endDate || '',
        location: e.location || '',
        fee: Number(e.fee) || 0,
        status: e.status || 'Inquiry',
        paymentStatus: e.paymentStatus || 'Belum DP',
        docLink: e.docLink || '',
        notes: e.notes || '',
        ...(e.createdAt ? { createdAt: e.createdAt } : {}),
      }))
  } catch {
    return []
  }
}

// Data lama tetap disimpan sebagai cadangan, hanya ditandai sudah diproses
export function markLegacyImported() {
  try {
    localStorage.setItem(IMPORTED_FLAG_KEY, new Date().toISOString())
  } catch {
    // abaikan
  }
}
