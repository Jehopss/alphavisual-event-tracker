// POST /functions/v1/google-connect
//   { action: 'connect', refreshToken } -> simpan refresh token (hanya di server) lalu sync awal
//   { action: 'disconnect' }            -> hapus event yang pernah dibuat, cabut izin, hapus koneksi

import { withSupabase } from 'npm:@supabase/server@1'
import { CALENDAR_SCOPE, getAccessToken, GoogleAuthError } from '../_shared/google.ts'
import { disconnectUser, resyncUser } from '../_shared/sync.ts'

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    const { data: isMember, error: memberError } = await ctx.supabase.rpc('is_team_member')
    if (memberError || !isMember) {
      return Response.json({ error: 'Akun ini bukan anggota tim' }, { status: 403 })
    }

    const userId = ctx.userClaims!.id
    const body = await req.json().catch(() => ({}))

    try {
      if (body.action === 'connect') {
        if (typeof body.refreshToken !== 'string' || !body.refreshToken) {
          return Response.json({ error: 'refreshToken wajib diisi' }, { status: 400 })
        }

        // Pastikan token valid DAN user benar-benar mencentang izin Google Calendar
        let scope = ''
        try {
          scope = (await getAccessToken(body.refreshToken)).scope
        } catch (err) {
          if (err instanceof GoogleAuthError) {
            return Response.json({ error: 'token_invalid' }, { status: 400 })
          }
          throw err
        }
        if (!scope.split(' ').includes(CALENDAR_SCOPE)) {
          return Response.json({ error: 'scope_missing' }, { status: 400 })
        }

        const { error } = await ctx.supabaseAdmin.from('google_connections').upsert({
          user_id: userId,
          google_email: ctx.userClaims!.email ?? null,
          refresh_token: body.refreshToken,
          sync_enabled: true,
          needs_reconnect: false,
          connected_at: new Date().toISOString(),
        })
        if (error) throw error

        const summary = await resyncUser(ctx.supabaseAdmin, userId)
        return Response.json({ connected: true, summary })
      }

      if (body.action === 'disconnect') {
        const summary = await disconnectUser(ctx.supabaseAdmin, userId)
        return Response.json({ connected: false, summary })
      }

      return Response.json({ error: 'action tidak dikenal' }, { status: 400 })
    } catch (err) {
      console.error('google-connect error', err)
      return Response.json({ error: 'Gagal memproses koneksi Google Calendar' }, { status: 500 })
    }
  }),
}
