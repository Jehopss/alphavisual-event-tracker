import { useCallback, useRef, useState } from 'react'
import { CalendarCheck2, CalendarX2, LoaderCircle, LogOut, RefreshCw, Unplug } from 'lucide-react'
import { useDismiss } from '../hooks/useDismiss'
import { btnPrimary, menuPanel } from '../styles'

function Avatar({ user, size = 'size-9' }) {
  const url = user.user_metadata?.avatar_url
  const name = user.user_metadata?.full_name || user.email
  if (url) {
    return <img src={url} alt="" referrerPolicy="no-referrer" className={`${size} rounded-xl object-cover ring-1 ring-zinc-200 dark:ring-zinc-700`} />
  }
  return (
    <span className={`${size} rounded-xl grid place-items-center bg-brand-100 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 text-sm font-semibold`}>
      {name?.[0]?.toUpperCase() ?? '?'}
    </span>
  )
}

function Switch({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-50 ${
        checked ? 'bg-brand-600' : 'bg-zinc-300 dark:bg-zinc-700'
      }`}
    >
      <span className={`size-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
    </button>
  )
}

const rowBtn = 'w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition disabled:opacity-50 disabled:pointer-events-none'

function CalendarSection({ calendar }) {
  const [confirming, setConfirming] = useState(false)
  const { connection, loaded, busy } = calendar

  if (!loaded) {
    return <div className="px-3 py-3 text-xs text-zinc-400">Memeriksa Google Calendar</div>
  }

  if (!connection || connection.needs_reconnect) {
    return (
      <div className="px-3 py-3">
        <div className="flex items-start gap-2.5">
          <CalendarX2 className="size-4 mt-0.5 shrink-0 text-zinc-400" />
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {connection ? 'Izin kalender kedaluwarsa' : 'Google Calendar'}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {connection
                ? 'Hubungkan ulang supaya event tetap tersinkron.'
                : 'Event Negosiasi dan Confirmed otomatis masuk ke kalender pribadimu, dan ikut berubah saat diedit.'}
            </p>
          </div>
        </div>
        <button onClick={calendar.connect} disabled={busy === 'connecting'} className={`${btnPrimary} mt-3 h-9! w-full`}>
          {busy === 'connecting' && <LoaderCircle className="size-4 animate-spin" />}
          {connection ? 'Hubungkan ulang' : 'Hubungkan Google Calendar'}
        </button>
      </div>
    )
  }

  return (
    <div className="px-1.5 py-1.5">
      <div className="flex items-start justify-between gap-3 px-1.5 py-1.5">
        <div className="flex items-start gap-2.5 min-w-0">
          <CalendarCheck2 className="size-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Sync Google Calendar</p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 truncate">{connection.google_email}</p>
          </div>
        </div>
        <Switch
          label="Sync otomatis ke Google Calendar"
          checked={connection.sync_enabled}
          disabled={Boolean(busy)}
          onChange={calendar.setSyncEnabled}
        />
      </div>

      {/* Warna mengikuti colorId Google: Banana (5) & Basil (10) */}
      <div className="flex items-center gap-4 px-3 pb-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#f6bf26]" aria-hidden="true" /> Negosiasi
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#0b8043]" aria-hidden="true" /> Confirmed
        </span>
      </div>

      <button onClick={calendar.resync} disabled={Boolean(busy) || !connection.sync_enabled} className={rowBtn}>
        <RefreshCw className={`size-4 text-zinc-400 ${busy === 'syncing' ? 'animate-spin' : ''}`} />
        {busy === 'syncing' ? 'Menyinkronkan' : 'Sync ulang sekarang'}
      </button>

      {confirming ? (
        <div className="mx-1.5 mt-1 rounded-lg bg-red-50 dark:bg-red-500/10 p-3">
          <p className="text-xs text-red-800 dark:text-red-200">Event dari tracker akan dihapus dari kalendermu. Lanjutkan?</p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={async () => {
                await calendar.disconnect()
                setConfirming(false)
              }}
              disabled={busy === 'disconnecting'}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-red-600 px-3 text-xs font-medium text-white hover:bg-red-700 transition disabled:opacity-50"
            >
              {busy === 'disconnecting' && <LoaderCircle className="size-3.5 animate-spin" />}
              Putuskan
            </button>
            <button onClick={() => setConfirming(false)} className="h-8 rounded-lg px-3 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-white/60 dark:hover:bg-zinc-800">
              Batal
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setConfirming(true)} disabled={Boolean(busy)} className={rowBtn}>
          <Unplug className="size-4 text-zinc-400" /> Putuskan Google Calendar
        </button>
      )}
    </div>
  )
}

export default function AccountMenu({ user, calendar, onSignOut }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(rootRef, open, close)

  const name = user.user_metadata?.full_name || user.email
  const needsAttention = calendar.loaded && (!calendar.connection || calendar.connection.needs_reconnect)

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Akun dan Google Calendar"
        className="relative rounded-xl transition active:scale-[0.97]"
      >
        <Avatar user={user} size="size-10" />
        {needsAttention && (
          <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-brand-500 ring-2 ring-zinc-50 dark:ring-zinc-950" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div role="menu" className={`${menuPanel} w-80`}>
          <div className="flex items-center gap-3 px-3 py-2.5">
            <Avatar user={user} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{name}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
            </div>
          </div>
          <div className="my-1 h-px bg-zinc-100 dark:bg-zinc-800" />
          <CalendarSection calendar={calendar} />
          <div className="my-1 h-px bg-zinc-100 dark:bg-zinc-800" />
          <div className="px-1.5 pb-0.5">
            <button onClick={onSignOut} className={rowBtn}>
              <LogOut className="size-4 text-zinc-400" /> Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
