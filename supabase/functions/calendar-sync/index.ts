// POST /functions/v1/calendar-sync
//   { action: 'sync', eventId }  -> samakan satu event (dibuat/diubah/dihapus) ke kalender semua anggota
//   { action: 'sync', eventIds } -> sama, untuk banyak event sekaligus (maks 200, mis. setelah impor)
//   { action: 'resync' }         -> samakan seluruh kalender milik user yang memanggil

import { withSupabase } from 'npm:@supabase/server@1'
import { resyncUser, syncEventForAll } from '../_shared/sync.ts'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    const { data: isMember, error: memberError } = await ctx.supabase.rpc('is_team_member')
    if (memberError || !isMember) {
      return Response.json({ error: 'Akun ini bukan anggota tim' }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))

    try {
      if (body.action === 'resync') {
        return Response.json(await resyncUser(ctx.supabaseAdmin, ctx.userClaims!.id))
      }

      if (body.action === 'sync') {
        const ids: unknown[] = Array.isArray(body.eventIds) ? body.eventIds : [body.eventId]
        if (!ids.length || ids.length > 200 || !ids.every((id) => typeof id === 'string' && UUID.test(id))) {
          return Response.json({ error: 'eventId tidak valid' }, { status: 400 })
        }
        // Kalau event sudah dihapus, syncEventForAll otomatis menghapusnya dari kalender
        const total = { synced: 0, removed: 0, failed: 0, needsReconnect: 0 }
        for (const id of ids as string[]) {
          const s = await syncEventForAll(ctx.supabaseAdmin, id)
          total.synced += s.synced
          total.removed += s.removed
          total.failed += s.failed
          total.needsReconnect = Math.max(total.needsReconnect, s.needsReconnect)
        }
        return Response.json(total)
      }

      return Response.json({ error: 'action tidak dikenal' }, { status: 400 })
    } catch (err) {
      console.error('calendar-sync error', err)
      return Response.json({ error: 'Sinkronisasi kalender gagal' }, { status: 500 })
    }
  }),
}
