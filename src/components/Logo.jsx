import { useRef, useState } from 'react'
import { LOGO_STORAGE_KEY } from '../constants'

function loadCustomLogo() {
  try {
    return localStorage.getItem(LOGO_STORAGE_KEY)
  } catch (err) {
    console.warn('Gagal memuat logo tersimpan:', err)
    return null
  }
}

// Vektor resmi Alpha Visual (presisi & langsung muncul tanpa perlu file)
function VectorLogo() {
  return (
    <svg viewBox="0 0 380 95" className="h-8 sm:h-9 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="avRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff6200" />
          <stop offset="30%" stopColor="#e5097f" />
          <stop offset="70%" stopColor="#7928ca" />
          <stop offset="100%" stopColor="#0070f3" />
        </linearGradient>
        <linearGradient id="avGradA" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff007a" />
          <stop offset="100%" stopColor="#ff6200" />
        </linearGradient>
        <linearGradient id="avGradV" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff6200" />
          <stop offset="40%" stopColor="#e5097f" />
          <stop offset="100%" stopColor="#0070f3" />
        </linearGradient>
        <linearGradient id="avGradL" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#0070f3" />
          <stop offset="100%" stopColor="#e5097f" />
        </linearGradient>
      </defs>

      {/* Monogram Lingkaran Bergradien Alpha Visual */}
      <g transform="translate(6, 6)">
        <circle cx="41" cy="41" r="37" stroke="url(#avRingGrad)" strokeWidth="8" fill="none" />
        {/* Chevron Sudut Atas (A) */}
        <path d="M41 18 L62 39 L53 48 L41 36 L29 48 L20 39 Z" fill="#ffffff" className="dark:fill-zinc-950" />
        <path d="M41 22 L59 40 L53 46 L41 34 L29 46 L23 40 Z" fill="url(#avGradA)" />
        {/* Chevron Sudut Bawah (V) */}
        <path d="M41 64 L20 43 L29 34 L41 46 L53 34 L62 43 Z" fill="#ffffff" className="dark:fill-zinc-950" />
        <path d="M41 60 L23 42 L29 36 L41 48 L53 36 L59 42 Z" fill="#0070f3" />
      </g>

      {/* Tipografi AlphaVisual Khas Brand */}
      <g fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="52" letterSpacing="-0.03em">
        <text x="100" y="64" fill="url(#avGradA)">A</text>
        <text x="141" y="64" fill="#0070f3">lpha</text>
        <text x="250" y="64" fill="url(#avGradV)">V</text>
        <text x="287" y="64" fill="#0070f3">isua</text>
        <text x="367" y="64" fill="url(#avGradL)">l</text>
      </g>
    </svg>
  )
}

export default function Logo({ onUploaded }) {
  const [customLogo, setCustomLogo] = useState(loadCustomLogo)
  const fileInputRef = useRef(null)

  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target.result
      try {
        localStorage.setItem(LOGO_STORAGE_KEY, result)
      } catch (err) {
        console.warn('Gagal menyimpan logo ke cache:', err)
      }
      setCustomLogo(result)
      onUploaded?.()
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex items-center gap-2.5">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />

      <button
        type="button"
        className="relative group flex items-center rounded-lg"
        onClick={() => fileInputRef.current?.click()}
        title="Klik untuk pilih file logo asli dari perangkat Anda"
        aria-label="Alpha Visual. Klik untuk ganti logo"
      >
        {customLogo ? (
          <img
            src={customLogo}
            alt="Alpha Visual Logo"
            className="h-8 sm:h-9 w-auto max-w-[200px] sm:max-w-[240px] object-contain transition-transform group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex items-center h-8 sm:h-9 select-none transition-transform group-hover:scale-[1.02]">
            <VectorLogo />
          </div>
        )}

        {/* Overlay Tooltip Bantuan Upload */}
        <span className="absolute -bottom-6 left-0 text-[10px] bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-1.5 py-0.5 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-20">
          Ganti / upload PNG asli
        </span>
      </button>

      <span className="hidden md:inline-block pl-3 ml-0.5 border-l border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-500 dark:text-zinc-400">
        Event Tracker
      </span>
    </div>
  )
}
