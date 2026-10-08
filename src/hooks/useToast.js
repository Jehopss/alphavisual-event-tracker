import { useCallback, useEffect, useRef, useState } from 'react'

export function useToast(duration = 3000) {
  const [toast, setToast] = useState({ message: '', visible: false })
  const timerRef = useRef(null)

  const showToast = useCallback((message) => {
    setToast({ message, visible: true })
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }))
    }, duration)
  }, [duration])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return { toast, showToast }
}
