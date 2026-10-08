import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  // undefined = masih memeriksa sesi, null = belum login
  const [session, setSession] = useState(undefined)
  const [membership, setMembership] = useState({ userId: null, isMember: null })

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const userId = session?.user?.id ?? null

  // Cek apakah email ini terdaftar di tabel team_members
  useEffect(() => {
    if (!userId) return
    let active = true
    supabase.rpc('is_team_member').then(({ data, error }) => {
      if (active) setMembership({ userId, isMember: !error && data === true })
    })
    return () => {
      active = false
    }
  }, [userId])

  const signIn = useCallback(() => {
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }, [])

  const signOut = useCallback(() => supabase.auth.signOut(), [])

  return {
    session,
    user: session?.user ?? null,
    // null = sedang dicek
    isMember: userId && membership.userId === userId ? membership.isMember : null,
    signIn,
    signOut,
  }
}
