import { useCallback, useEffect, useEffectEvent, useState } from 'react'
import { CONNECT_FLAG_KEY } from '../constants'
import { supabase } from '../lib/supabase'

const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events'

// Ambil kode error dari body response Edge Function (mis. { error: 'scope_missing' })
async function errorCode(error) {
  try {
    return (await error.context.json()).error
  } catch {
    return null
  }
}

// RLS memastikan user hanya bisa membaca baris koneksinya sendiri (tanpa refresh_token)
const fetchConnection = () =>
  supabase.from('google_connections').select('google_email, sync_enabled, needs_reconnect, connected_at').maybeSingle()

function syncMessage(summary) {
  if (!summary) return 'Kalender sudah sinkron.'
  const parts = [`${summary.synced} event tersinkron`]
  if (summary.removed) parts.push(`${summary.removed} dihapus`)
  if (summary.failed) parts.push(`${summary.failed} gagal`)
  return `${parts.join(', ')}.`
}

export function useGoogleCalendar({ user, notify }) {
  const userId = user?.id ?? null
  const [state, setState] = useState({ userId: null, connection: null })
  const [busy, setBusy] = useState(null) // 'connecting' | 'syncing' | 'disconnecting' | null

  const refresh = useCallback(async () => {
    if (!userId) return
    const { data, error } = await fetchConnection()
    if (!error) setState({ userId, connection: data })
  }, [userId])

  useEffect(() => {
    if (!userId) return
    let active = true
    fetchConnection().then(({ data, error }) => {
      if (active && !error) setState({ userId, connection: data })
    })
    return () => {
      active = false
    }
  }, [userId])

  const finishConnect = useEffectEvent(async (refreshToken) => {
    setBusy('connecting')
    const { data, error } = await supabase.functions.invoke('google-connect', {
      body: { action: 'connect', refreshToken },
    })
    setBusy(null)
    if (error) {
      const code = await errorCode(error)
      notify(
        code === 'scope_missing'
          ? 'Izin Google Calendar belum dicentang. Hubungkan lagi dan centang akses kalender.'
          : 'Gagal menghubungkan Google Calendar.',
        'error',
      )
      return
    }
    notify(`Google Calendar terhubung. ${syncMessage(data.summary)}`)
    refresh()
  })

  // Setelah kembali dari halaman izin Google, Supabase memberi provider_refresh_token SEKALI.
  // Token itu langsung dikirim ke server untuk disimpan, browser tidak menyimpannya.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== 'SIGNED_IN' && event !== 'INITIAL_SESSION') return
      const refreshToken = session?.provider_refresh_token
      if (!refreshToken || !sessionStorage.getItem(CONNECT_FLAG_KEY)) return
      sessionStorage.removeItem(CONNECT_FLAG_KEY)
      // Jangan memanggil Supabase langsung di dalam callback ini (bisa deadlock); tunda sebentar
      setTimeout(() => finishConnect(refreshToken), 0)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Harus dipanggil dari klik user. Halaman akan pindah ke layar izin Google.
  const connect = () => {
    sessionStorage.setItem(CONNECT_FLAG_KEY, '1')
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        scopes: CALENDAR_SCOPE,
        queryParams: {
          access_type: 'offline', // supaya Google memberi refresh token
          prompt: 'consent', // refresh token hanya dikirim saat layar izin muncul
          login_hint: user?.email ?? '',
        },
      },
    })
  }

  const resync = async () => {
    setBusy('syncing')
    const { data, error } = await supabase.functions.invoke('calendar-sync', { body: { action: 'resync' } })
    setBusy(null)
    if (error) return notify('Sinkronisasi kalender gagal.', 'error')
    if (data.needsReconnect) {
      refresh()
      return notify('Izin Google Calendar kedaluwarsa. Hubungkan ulang.', 'error')
    }
    notify(syncMessage(data))
  }

  const setSyncEnabled = async (enabled) => {
    setState((s) => ({ ...s, connection: s.connection && { ...s.connection, sync_enabled: enabled } }))
    const { error } = await supabase.from('google_connections').update({ sync_enabled: enabled }).eq('user_id', userId)
    if (error) {
      refresh()
      return notify('Gagal mengubah pengaturan sync.', 'error')
    }
    if (enabled) await resync()
    else notify('Sync kalender dijeda. Event yang sudah ada tetap di kalender.')
  }

  const disconnect = async () => {
    setBusy('disconnecting')
    const { error } = await supabase.functions.invoke('google-connect', { body: { action: 'disconnect' } })
    setBusy(null)
    if (error) return notify('Gagal memutuskan Google Calendar.', 'error')
    setState({ userId, connection: null })
    notify('Google Calendar diputuskan dan event tracker dihapus dari kalendermu.')
  }

  return {
    loaded: state.userId === userId,
    connection: state.userId === userId ? state.connection : null,
    busy,
    connect,
    resync,
    setSyncEnabled,
    disconnect,
  }
}
