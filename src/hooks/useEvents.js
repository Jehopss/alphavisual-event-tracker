import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  deleteEventRow,
  fetchEvents,
  fromRow,
  insertEvent,
  insertEvents,
  syncEventsToCalendars,
  updateEventRow,
} from '../lib/eventsApi'

const upsertLocal = (list, event) =>
  list.some((e) => e.id === event.id) ? list.map((e) => (e.id === event.id ? event : e)) : [...list, event]

// Terapkan perubahan dari Supabase Realtime (dibuat/diubah/dihapus oleh anggota tim lain)
function applyRealtimeChange(list, payload) {
  if (payload.eventType === 'DELETE') return list.filter((e) => e.id !== payload.old.id)
  return upsertLocal(list, fromRow(payload.new))
}

export function useEvents({ enabled, onSyncError }) {
  const [state, setState] = useState({ status: 'loading', events: [], error: null })
  const [reloadKey, setReloadKey] = useState(0)
  const eventsRef = useRef(state.events)
  const onSyncErrorRef = useRef(onSyncError)

  useEffect(() => {
    eventsRef.current = state.events
    onSyncErrorRef.current = onSyncError
  })

  useEffect(() => {
    if (!enabled) return
    let active = true
    fetchEvents()
      .then((events) => active && setState({ status: 'ready', events, error: null }))
      .catch((error) => active && setState((s) => ({ ...s, status: 'error', error })))
    return () => {
      active = false
    }
  }, [enabled, reloadKey])

  useEffect(() => {
    if (!enabled) return
    const channel = supabase
      .channel('events-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (payload) => {
        setState((s) => ({ ...s, events: applyRealtimeChange(s.events, payload) }))
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [enabled])

  const setEvents = (fn) => setState((s) => ({ ...s, events: fn(s.events) }))

  // Sync kalender jalan di belakang layar; gagal sync tidak membatalkan penyimpanan data
  const syncCalendars = (ids) => {
    syncEventsToCalendars(ids).catch((err) => {
      console.warn('Sinkronisasi kalender gagal:', err)
      onSyncErrorRef.current?.()
    })
  }

  const reload = useCallback(() => {
    setState((s) => ({ ...s, status: 'loading' }))
    setReloadKey((k) => k + 1)
  }, [])

  const addEvent = async (data) => {
    const created = await insertEvent(data)
    setEvents((list) => upsertLocal(list, created))
    syncCalendars([created.id])
    return created
  }

  // Optimistic update: UI langsung berubah, dikembalikan kalau server menolak
  const updateEvent = async (id, patch) => {
    const previous = eventsRef.current.find((e) => e.id === id)
    setEvents((list) => list.map((e) => (e.id === id ? { ...e, ...patch } : e)))
    try {
      const saved = await updateEventRow(id, patch)
      setEvents((list) => upsertLocal(list, saved))
      syncCalendars([id])
    } catch (err) {
      if (previous) setEvents((list) => upsertLocal(list, previous))
      throw err
    }
  }

  const deleteEvent = async (id) => {
    const previous = eventsRef.current.find((e) => e.id === id)
    setEvents((list) => list.filter((e) => e.id !== id))
    try {
      await deleteEventRow(id)
      syncCalendars([id])
    } catch (err) {
      if (previous) setEvents((list) => upsertLocal(list, previous))
      throw err
    }
  }

  const importEvents = async (list) => {
    const created = await insertEvents(list)
    setEvents((current) => created.reduce(upsertLocal, current))
    for (let i = 0; i < created.length; i += 200) {
      syncCalendars(created.slice(i, i + 200).map((e) => e.id))
    }
    return created.length
  }

  return {
    events: state.events,
    status: state.status,
    error: state.error,
    reload,
    addEvent,
    updateEvent,
    deleteEvent,
    importEvents,
  }
}
