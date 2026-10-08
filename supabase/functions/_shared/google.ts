// Helper Google OAuth + Calendar REST API (dipakai semua Edge Function)

export const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const REVOKE_URL = 'https://oauth2.googleapis.com/revoke'
const EVENTS_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'

/** Refresh token sudah tidak berlaku (dicabut user, kedaluwarsa, dsb). User perlu hubungkan ulang. */
export class GoogleAuthError extends Error {}

export type EventRow = {
  id: string
  title: string
  client: string
  category: string
  start_date: string
  end_date: string | null
  location: string
  fee: number
  status: string
  payment_status: string
  doc_link: string
  notes: string
}

function requireEnv(name: string): string {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Secret ${name} belum di-set`)
  return value
}

/** Tukar refresh token dengan access token (berlaku ~1 jam). */
export async function getAccessToken(refreshToken: string): Promise<{ accessToken: string; scope: string }> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: requireEnv('GOOGLE_CLIENT_ID'),
      client_secret: requireEnv('GOOGLE_CLIENT_SECRET'),
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  const data = await res.json()
  if (!res.ok) {
    if (data.error === 'invalid_grant') throw new GoogleAuthError('Refresh token Google tidak berlaku lagi')
    throw new Error(`Gagal mengambil access token Google: ${data.error ?? res.status}`)
  }
  return { accessToken: data.access_token, scope: data.scope ?? '' }
}

export async function revokeToken(token: string): Promise<void> {
  await fetch(`${REVOKE_URL}?token=${encodeURIComponent(token)}`, { method: 'POST' }).catch(() => {})
}

// Hanya status ini yang masuk kalender, beserta warnanya.
// colorId = palet warna event bawaan Google Calendar:
//   1 Lavender, 2 Sage, 3 Grape, 4 Flamingo, 5 Banana, 6 Tangerine,
//   7 Peacock, 8 Graphite, 9 Blueberry, 10 Basil, 11 Tomato
const CALENDAR_COLORS: Record<string, string> = {
  Negosiasi: '5', // Banana (kuning)
  Confirmed: '10', // Basil (hijau)
}

/** Event berstatus lain (Inquiry, Selesai, Dibatalkan) tidak masuk, atau dihapus kalau sebelumnya sudah ada. */
export function shouldBeOnCalendar(event: EventRow): boolean {
  return event.status in CALENDAR_COLORS
}

const rupiah = (n: number) => `Rp. ${Math.round(n || 0).toLocaleString('id-ID')},-`

// Semua perhitungan tanggal memakai jam dinding (WIB) apa adanya, diperlakukan sebagai UTC
// agar tidak tergeser zona waktu server.
const wallClock = (value: string) => new Date(`${value.slice(0, 16)}:00Z`)
const dateOnly = (d: Date) => d.toISOString().slice(0, 10)
const hhmm = (d: Date) => `${String(d.getUTCHours()).padStart(2, '0')}.${String(d.getUTCMinutes()).padStart(2, '0')}`
const longDate = (d: Date) =>
  d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

/**
 * Event dikirim sebagai event seharian (all-day) supaya tampil sebagai blok warna penuh
 * di tampilan bulan. Jam mulai ditaruh di depan judul.
 */
function allDayRange(event: EventRow) {
  const start = wallClock(event.start_date)
  let lastDay = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()))

  if (event.end_date) {
    const end = wallClock(event.end_date)
    const endDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()))
    // Acara yang selesai lewat tengah malam (sebelum 06.00) tetap dihitung satu hari
    if (end.getUTCHours() < 6) endDay.setUTCDate(endDay.getUTCDate() - 1)
    if (endDay > lastDay) lastDay = endDay
  }

  // Untuk all-day, tanggal end di Google bersifat eksklusif (hari setelah hari terakhir)
  const endExclusive = new Date(lastDay)
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1)

  let timeLine = `${longDate(start)}, ${hhmm(start)} WIB`
  if (event.end_date) {
    const end = wallClock(event.end_date)
    timeLine = dateOnly(end) === dateOnly(start)
      ? `${longDate(start)}, ${hhmm(start)} - ${hhmm(end)} WIB`
      : `${longDate(start)} ${hhmm(start)} - ${longDate(end)} ${hhmm(end)} WIB`
  }

  return {
    start: { date: dateOnly(start) },
    end: { date: dateOnly(endExclusive) },
    startTime: hhmm(start),
    timeLine,
  }
}

export function toGoogleEvent(event: EventRow) {
  const range = allDayRange(event)

  const description = [
    `Waktu: ${range.timeLine}`,
    `Klien: ${event.client}`,
    `Kategori: ${event.category}`,
    `Progres: ${event.status}`,
    `Pembayaran: ${event.payment_status}`,
    `Honor: ${rupiah(event.fee)}`,
    event.notes && `\n${event.notes}`,
    event.doc_link && `\nRundown: ${event.doc_link}`,
    '\nDisinkronkan dari Alpha Visual Event Tracker',
  ].filter(Boolean).join('\n')

  return {
    summary: `${range.startTime} ${event.title}`,
    location: event.location || undefined,
    description,
    // Pastikan event yang sempat dihapus manual di Google muncul kembali
    status: 'confirmed',
    colorId: CALENDAR_COLORS[event.status],
    start: range.start,
    end: range.end,
    // Sekadar catatan: tidak menandai jam kosong jadi "sibuk"
    transparency: 'transparent',
    extendedProperties: { private: { alphaVisualEventId: event.id } },
  }
}

async function calendarFetch(accessToken: string, url: string, init: RequestInit = {}) {
  return await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })
}

async function failure(res: Response, action: string): Promise<never> {
  if (res.status === 401) throw new GoogleAuthError('Access token Google ditolak')
  const detail = await res.text().catch(() => '')
  throw new Error(`Google Calendar ${action} gagal (${res.status}): ${detail.slice(0, 300)}`)
}

/** Update event Google kalau sudah ada, buat baru kalau belum. Mengembalikan ID event Google. */
export async function upsertGoogleEvent(accessToken: string, googleEventId: string | null, event: EventRow): Promise<string> {
  const body = JSON.stringify(toGoogleEvent(event))

  if (googleEventId) {
    // PUT (ganti seluruh event), bukan PATCH: PATCH menggabungkan objek start/end, sehingga
    // event lama yang berjam (dateTime) akan bentrok dengan format all-day (date)
    const res = await calendarFetch(accessToken, `${EVENTS_URL}/${encodeURIComponent(googleEventId)}`, { method: 'PUT', body })
    if (res.ok) return (await res.json()).id
    // 404/410: event sudah hilang dari kalender, buat ulang di bawah
    if (res.status !== 404 && res.status !== 410) await failure(res, 'update')
  }

  const res = await calendarFetch(accessToken, EVENTS_URL, { method: 'POST', body })
  if (!res.ok) await failure(res, 'create')
  return (await res.json()).id
}

export async function deleteGoogleEvent(accessToken: string, googleEventId: string): Promise<void> {
  const res = await calendarFetch(accessToken, `${EVENTS_URL}/${encodeURIComponent(googleEventId)}`, { method: 'DELETE' })
  // 404/410 berarti memang sudah tidak ada: anggap sukses
  if (!res.ok && res.status !== 404 && res.status !== 410) await failure(res, 'delete')
}
