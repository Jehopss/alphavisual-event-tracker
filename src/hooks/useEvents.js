import { useCallback, useEffect, useState } from 'react'
import { INITIAL_SAMPLE_EVENTS, LEGACY_STORAGE_KEYS, STORAGE_KEY } from '../constants'

function loadEvents() {
  try {
    const stored = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS]
      .map((key) => localStorage.getItem(key))
      .find(Boolean)
    if (!stored) return INITIAL_SAMPLE_EVENTS

    return JSON.parse(stored).map((e) => ({
      ...e,
      paymentStatus: e.paymentStatus || 'Belum DP',
      fee: Number(e.fee) || 0,
    }))
  } catch {
    return INITIAL_SAMPLE_EVENTS
  }
}

export function useEvents() {
  const [events, setEvents] = useState(loadEvents)

  // Simpan ke localStorage setiap kali data berubah (termasuk seed awal)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
    } catch (err) {
      console.warn('Gagal menyimpan data event:', err)
    }
  }, [events])

  const addEvent = useCallback((data) => {
    const newEvent = {
      id: 'evt-' + Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
    }
    setEvents((prev) => [newEvent, ...prev])
  }, [])

  const updateEvent = useCallback((id, patch) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }, [])

  const deleteEvent = useCallback((id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return { events, addEvent, updateEvent, deleteEvent }
}
