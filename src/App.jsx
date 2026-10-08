import Dashboard from './components/Dashboard'
import { AccessDenied, FullPageLoader, LoginScreen, SetupNotice } from './components/AuthScreens'
import { useAuth } from './hooks/useAuth'
import { isSupabaseConfigured } from './lib/supabase'

function AuthGate() {
  const { session, user, isMember, signIn, signOut } = useAuth()

  if (session === undefined) return <FullPageLoader />
  if (!session) return <LoginScreen onSignIn={signIn} />
  if (isMember === null) return <FullPageLoader label="Memeriksa akses" />
  if (!isMember) return <AccessDenied email={user.email} onSignOut={signOut} />

  return <Dashboard key={user.id} user={user} onSignOut={signOut} />
}

export default function App() {
  return isSupabaseConfigured ? <AuthGate /> : <SetupNotice />
}
