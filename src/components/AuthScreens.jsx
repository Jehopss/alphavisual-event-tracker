import { useState } from 'react'
import { LoaderCircle, LogOut, ShieldAlert, Wrench } from 'lucide-react'
import { VectorLogo } from './Logo'
import { btnPrimary, btnSecondary, panel } from '../styles'

function AuthLayout({ children }) {
  return (
    <main className="min-h-dvh grid place-items-center px-4 py-12">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="flex justify-center">
          <div className="h-9"><VectorLogo /></div>
        </div>
        <div className={`${panel} mt-8 p-6 sm:p-8 shadow-xl shadow-zinc-900/5 dark:shadow-black/30`}>{children}</div>
      </div>
    </main>
  )
}

function GoogleMark() {
  // Logo "G" resmi Google untuk tombol Sign in with Google
  return (
    <svg viewBox="0 0 48 48" className="size-4" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}

export function FullPageLoader({ label = 'Memuat' }) {
  return (
    <main className="min-h-dvh grid place-items-center" aria-busy="true">
      <div className="flex flex-col items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
        <div className="h-8 opacity-90"><VectorLogo /></div>
        <span className="inline-flex items-center gap-2">
          <LoaderCircle className="size-4 animate-spin" /> {label}
        </span>
      </div>
    </main>
  )
}

export function LoginScreen({ onSignIn }) {
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)

  const handleClick = async () => {
    setPending(true)
    setFailed(false)
    const { error } = await onSignIn()
    if (error) {
      setPending(false)
      setFailed(true)
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">Masuk ke Event Tracker</h1>
      <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">Gunakan akun Google yang terdaftar di tim Alpha Visual.</p>
      <button onClick={handleClick} disabled={pending} className={`${btnSecondary} mt-6 w-full`}>
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : <GoogleMark />}
        Masuk dengan Google
      </button>
      {failed && (
        <p className="mt-3 text-xs font-medium text-red-600 dark:text-red-400">Gagal membuka login Google. Coba lagi.</p>
      )}
    </AuthLayout>
  )
}

export function AccessDenied({ email, onSignOut }) {
  return (
    <AuthLayout>
      <div className="size-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 ring-1 ring-inset ring-amber-200 dark:ring-amber-500/25 grid place-items-center text-amber-600 dark:text-amber-400">
        <ShieldAlert className="size-5" />
      </div>
      <h1 className="mt-4 text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">Akun belum terdaftar</h1>
      <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
        <span className="font-medium text-zinc-700 dark:text-zinc-200">{email}</span> belum ada di daftar anggota tim.
        Minta admin menambahkan email ini, lalu masuk lagi.
      </p>
      <button onClick={onSignOut} className={`${btnSecondary} mt-6 w-full`}>
        <LogOut className="size-4" /> Masuk dengan akun lain
      </button>
    </AuthLayout>
  )
}

export function SetupNotice() {
  return (
    <AuthLayout>
      <div className="size-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 grid place-items-center text-zinc-500">
        <Wrench className="size-5" />
      </div>
      <h1 className="mt-4 text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">Supabase belum dikonfigurasi</h1>
      <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
        Salin <code className="font-mono text-xs">.env.example</code> menjadi <code className="font-mono text-xs">.env.local</code>, isi URL dan publishable key project Supabase, lalu jalankan ulang <code className="font-mono text-xs">npm run dev</code>.
      </p>
    </AuthLayout>
  )
}

export function LoadError({ onRetry }) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Data event gagal dimuat</h2>
      <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">Periksa koneksi internet, lalu coba lagi.</p>
      <button onClick={onRetry} className={`${btnPrimary} mt-5`}>Coba lagi</button>
    </div>
  )
}
