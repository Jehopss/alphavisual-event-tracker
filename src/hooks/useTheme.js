import { useState } from 'react'
import { THEME_STORAGE_KEY } from '../constants'

// Class 'dark' awal dipasang oleh script inline di index.html (mencegah kedipan)
export function useTheme() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))

  const toggleTheme = () => {
    const next = !isDark
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light')
    } catch {
      // abaikan jika storage tidak tersedia
    }
    setIsDark(next)
  }

  return { isDark, toggleTheme }
}
