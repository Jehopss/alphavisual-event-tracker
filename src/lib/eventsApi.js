import { supabase } from './supabase'

// Nama field di React (camelCase) <-> kolom di database (snake_case)
const FIELD_TO_COLUMN = {
  title: 'title',
  client: 'client',
  category: 'category',
  startDate: 'start_date',
  endDate: 'end_date',
  location: 'location',
  fee: 'fee',
  status: 'status',
  paymentStatus: 'payment_status',
  docLink: 'doc_link',
  notes: 'notes',
  createdAt: 'created_at',
}

// Hanya field yang ada di objek yang ikut dikirim (aman untuk update sebagian)
function toRow(data) {
  const row = {}
  for (const [field, column] of Object.entries(FIELD_TO_COLUMN)) {
    if (!(field in data)) continue
    let value = data[field]
    if (field === 'endDate') value = value || null
    if (field === 'fee') value = Math.round(Number(value) || 0)
    row[column] = value
  }
  return row
}

// '2026-10-14T18:00:00' -> '2026-10-14T18:00' (format input datetime-local)
const toLocalInput = (value) => (value ? String(value).slice(0, 16) : '')

export function fromRow(row) {
  return {
    id: row.id,
    title: row.title,
    client: row.client,
    category: row.category,
    startDate: toLocalInput(row.start_date),
    endDate: toLocalInput(row.end_date),
    location: row.location ?? '',
    fee: Number(row.fee) || 0,
    status: row.status,
    paymentStatus: row.payment_status,
    docLink: row.doc_link ?? '',
    notes: row.notes ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function unwrap({ data, error }) {
  if (error) throw error
  return data
}

export async function fetchEvents() {
  const rows = unwrap(await supabase.from('events').select('*').order('start_date'))
  return rows.map(fromRow)
}

export async function insertEvent(data) {
  return fromRow(unwrap(await supabase.from('events').insert(toRow(data)).select().single()))
}

export async function insertEvents(list) {
  const rows = unwrap(await supabase.from('events').insert(list.map(toRow)).select())
  return rows.map(fromRow)
}

export async function updateEventRow(id, patch) {
  return fromRow(unwrap(await supabase.from('events').update(toRow(patch)).eq('id', id).select().single()))
}

export async function deleteEventRow(id) {
  unwrap(await supabase.from('events').delete().eq('id', id))
}

// Minta server menyamakan event di Google Calendar semua anggota (termasuk kalau sudah dihapus)
export async function syncEventsToCalendars(eventIds) {
  const { data, error } = await supabase.functions.invoke('calendar-sync', { body: { action: 'sync', eventIds } })
  if (error) throw error
  return data
}
