import { useCallback, useEffect, useRef, useState } from 'react'

export function useToast(duration = 3500) {
  const [toast, setToast] = useState({ message: '', tone: 'success', visible: false })
  const timerRef = useRef(null)

  // tone: 'success' | 'error'
  const showToast = useCallback((message, tone = 'success') => {
    setToast({ message, tone, visible: true })
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }))
    }, tone === 'error' ? duration + 2000 : duration)
  }, [duration])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return { toast, showToast }
}
