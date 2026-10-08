// Logic sinkronisasi event tracker -> Google Calendar pribadi tiap anggota tim.
// Semua query di sini memakai client admin (service role) karena butuh refresh_token & calendar_links.

import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import {
  deleteGoogleEvent,
  type EventRow,
  getAccessToken,
  GoogleAuthError,
  revokeToken,
  shouldBeOnCalendar,
  upsertGoogleEvent,
} from './google.ts'

type Connection = { user_id: string; refresh_token: string }
type Link = { event_id: string; user_id: string; google_event_id: string }

export type SyncSummary = { synced: number; removed: number; failed: number; needsReconnect: number }

const emptySummary = (): SyncSummary => ({ synced: 0, removed: 0, failed: 0, needsReconnect: 0 })

/** Jalankan fn untuk tiap item dengan maksimal `limit` request paralel (menghindari rate limit Google). */
async function mapLimit<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
  const queue = [...items]
  const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) await fn(queue.shift()!)
  })
  await Promise.all(workers)
}

function check<T>(result: { data: T; error: unknown }): T {
  if (result.error) throw result.error
  return result.data
}

async function markNeedsReconnect(admin: SupabaseClient, userId: string) {
  await admin.from('google_connections').update({ needs_reconnect: true }).eq('user_id', userId)
}

/** Ambil access token untuk satu koneksi. null = refresh token mati, user ditandai perlu hubungkan ulang. */
async function tokenFor(admin: SupabaseClient, conn: Connection): Promise<string | null> {
  try {
    return (await getAccessToken(conn.refresh_token)).accessToken
  } catch (err) {
    if (err instanceof GoogleAuthError) {
      await markNeedsReconnect(admin, conn.user_id)
      return null
    }
    throw err
  }
}

async function saveLink(admin: SupabaseClient, eventId: string, userId: string, googleEventId: string) {
  check(await admin.from('calendar_links').upsert({
    event_id: eventId,
    user_id: userId,
    google_event_id: googleEventId,
    synced_at: new Date().toISOString(),
  }))
}

async function dropLink(admin: SupabaseClient, eventId: string, userId: string) {
  check(await admin.from('calendar_links').delete().eq('event_id', eventId).eq('user_id', userId))
}

/** Samakan satu event di kalender user: buat/update, atau hapus kalau tidak seharusnya ada. */
async function applyEvent(admin: SupabaseClient, token: string, userId: string, event: EventRow, link: Link | undefined, summary: SyncSummary) {
  if (!shouldBeOnCalendar(event)) {
    if (link) {
      await deleteGoogleEvent(token, link.google_event_id)
      await dropLink(admin, event.id, userId)
      summary.removed++
    }
    return
  }
  const googleEventId = await upsertGoogleEvent(token, link?.google_event_id ?? null, event)
  if (googleEventId !== link?.google_event_id) await saveLink(admin, event.id, userId, googleEventId)
  summary.synced++
}

async function activeConnections(admin: SupabaseClient, userId?: string): Promise<Connection[]> {
  let query = admin
    .from('google_connections')
    .select('user_id, refresh_token')
    .eq('sync_enabled', true)
    .eq('needs_reconnect', false)
  if (userId) query = query.eq('user_id', userId)
  return check(await query) ?? []
}

/** Event dibuat/diubah: sinkronkan ke kalender semua anggota yang mengaktifkan sync. */
export async function syncEventForAll(admin: SupabaseClient, eventId: string): Promise<SyncSummary> {
  const event = check(await admin.from('events').select('*').eq('id', eventId).maybeSingle()) as EventRow | null
  if (!event) return await removeEventForAll(admin, eventId)

  const summary = emptySummary()
  const connections = await activeConnections(admin)
  const links = (check(await admin.from('calendar_links').select('*').eq('event_id', eventId)) ?? []) as Link[]

  await mapLimit(connections, 4, async (conn) => {
    try {
      const token = await tokenFor(admin, conn)
      if (!token) return void summary.needsReconnect++
      await applyEvent(admin, token, conn.user_id, event, links.find((l) => l.user_id === conn.user_id), summary)
    } catch (err) {
      console.error('sync gagal untuk user', conn.user_id, err)
      summary.failed++
    }
  })
  return summary
}

/** Event dihapus: hapus juga dari kalender semua user yang pernah menerimanya. */
export async function removeEventForAll(admin: SupabaseClient, eventId: string): Promise<SyncSummary> {
  const summary = emptySummary()
  const links = (check(await admin.from('calendar_links').select('*').eq('event_id', eventId)) ?? []) as Link[]
  if (!links.length) return summary

  const connections = (check(await admin
    .from('google_connections')
    .select('user_id, refresh_token')
    .in('user_id', links.map((l) => l.user_id))) ?? []) as Connection[]

  await mapLimit(links, 4, async (link) => {
    try {
      const conn = connections.find((c) => c.user_id === link.user_id)
      const token = conn ? await tokenFor(admin, conn) : null
      if (token) await deleteGoogleEvent(token, link.google_event_id)
      await dropLink(admin, eventId, link.user_id)
      summary.removed++
    } catch (err) {
      console.error('hapus gagal untuk user', link.user_id, err)
      summary.failed++
    }
  })
  return summary
}

/** Samakan seluruh kalender satu user dengan isi tracker (dipakai saat baru terhubung / tombol sync ulang). */
export async function resyncUser(admin: SupabaseClient, userId: string): Promise<SyncSummary> {
  const summary = emptySummary()
  const [conn] = await activeConnections(admin, userId)
  if (!conn) return summary

  const token = await tokenFor(admin, conn)
  if (!token) return { ...summary, needsReconnect: 1 }

  const events = (check(await admin.from('events').select('*')) ?? []) as EventRow[]
  const links = (check(await admin.from('calendar_links').select('*').eq('user_id', userId)) ?? []) as Link[]

  await mapLimit(events, 4, async (event) => {
    try {
      await applyEvent(admin, token, userId, event, links.find((l) => l.event_id === event.id), summary)
    } catch (err) {
      console.error('resync gagal untuk event', event.id, err)
      summary.failed++
    }
  })

  // Link yang event-nya sudah tidak ada di tracker
  const eventIds = new Set(events.map((e) => e.id))
  await mapLimit(links.filter((l) => !eventIds.has(l.event_id)), 4, async (link) => {
    try {
      await deleteGoogleEvent(token, link.google_event_id)
      await dropLink(admin, link.event_id, userId)
      summary.removed++
    } catch (err) {
      console.error('hapus event yatim gagal', link.event_id, err)
      summary.failed++
    }
  })
  return summary
}

/** Putuskan koneksi: hapus event yang pernah dibuat di kalender user, cabut token, hapus data koneksi. */
export async function disconnectUser(admin: SupabaseClient, userId: string): Promise<SyncSummary> {
  const summary = emptySummary()
  const conn = check(await admin
    .from('google_connections')
    .select('user_id, refresh_token')
    .eq('user_id', userId)
    .maybeSingle()) as Connection | null
  if (!conn) return summary

  const links = (check(await admin.from('calendar_links').select('*').eq('user_id', userId)) ?? []) as Link[]
  const token = await tokenFor(admin, conn).catch(() => null)

  if (token) {
    await mapLimit(links, 4, async (link) => {
      try {
        await deleteGoogleEvent(token, link.google_event_id)
        summary.removed++
      } catch (err) {
        console.error('hapus saat disconnect gagal', link.event_id, err)
        summary.failed++
      }
    })
  }

  await revokeToken(conn.refresh_token)
  check(await admin.from('calendar_links').delete().eq('user_id', userId))
  check(await admin.from('google_connections').delete().eq('user_id', userId))
  return summary
}
