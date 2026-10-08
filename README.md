# Alpha Visual Event Tracker

Pencatat jadwal, pipeline, dan status pembayaran event untuk tim Alpha Visual. Data disimpan bersama di Supabase, dan setiap anggota bisa menyinkronkan event ke Google Calendar pribadinya.

**Stack:** React 19 + Vite + Tailwind CSS v4 · Supabase (Postgres, Auth, Realtime, Edge Functions) · Google Calendar API

## Mulai

```bash
npm install
cp .env.example .env.local   # isi URL & publishable key Supabase
npm run dev
```

Setup lengkap Supabase + Google Cloud: [docs/setup-supabase-google-calendar.md](docs/setup-supabase-google-calendar.md)

## Script

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan app di `http://localhost:5173` |
| `npm run build` | Build production ke `dist/` |
| `npm run lint` | Cek kode dengan ESLint |
| `npm run db:push` | Terapkan migration di `supabase/migrations` ke project Supabase |
| `npm run secrets:set` | Kirim `supabase/functions/.env` sebagai secret Edge Functions |
| `npm run functions:deploy` | Deploy Edge Functions (`calendar-sync`, `google-connect`) |

## Struktur

```
src/
  components/   UI (Dashboard, kartu event, drawer form, menu akun, dll.)
  hooks/        useAuth, useEvents (data + realtime), useGoogleCalendar, dll.
  lib/          client Supabase, akses data event, impor data versi lama
  utils/        format Rupiah/tanggal, filter, ekspor CSV/JSON
supabase/
  migrations/   skema database + Row Level Security
  functions/    Edge Functions untuk sinkronisasi Google Calendar
```
