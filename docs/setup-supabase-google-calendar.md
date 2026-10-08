# Setup Supabase + Google Calendar

Panduan menyiapkan backend (Supabase) dan sinkronisasi Google Calendar untuk Alpha Visual Event Tracker. Lakukan sekali per lingkungan (development / production).

## Cara kerjanya

```
Browser (React)                    Supabase                              Google
───────────────                    ────────                              ──────
Login Google  ───────────────────▶ Auth (Google provider) ─────────────▶ OAuth
CRUD event    ───────────────────▶ Postgres + RLS (tabel events)
                                    │ hanya email di team_members yang boleh akses
Hubungkan Calendar ─▶ refresh token ─▶ Edge Function google-connect
                                    │ disimpan di google_connections (tidak bisa dibaca browser)
Simpan / ubah / hapus event ───────▶ Edge Function calendar-sync ──────▶ Calendar API
                                    │ tukar refresh token -> access token,     (kalender pribadi
                                    │ buat/update/hapus event per anggota       tiap anggota)
                                    └ catat id event Google di calendar_links
```

- Semua anggota tim melihat data event yang sama, dan perubahan muncul real-time.
- Tiap anggota bisa menghubungkan kalender **pribadinya**. Hanya event berstatus **Negosiasi** dan **Confirmed** yang masuk ke sana, dan ikut berubah saat diedit di tracker.
- Event yang statusnya berubah ke Inquiry, Selesai, atau Dibatalkan otomatis **dihapus** dari kalender.
- Warna di Google Calendar: **Negosiasi = kuning (Banana)**, **Confirmed = hijau (Basil)**.
- Event dibuat sebagai **event seharian (all-day)** supaya tampil sebagai blok warna penuh. Fungsinya sebagai catatan: jam mulai ada di depan judul (`18.00 Wedding ...`), jam lengkap ada di deskripsi, dan event ditandai *free* sehingga tidak memblokir jadwal.
- Aturan status dan warna ada di `CALENDAR_COLORS` di [`supabase/functions/_shared/google.ts`](../supabase/functions/_shared/google.ts). Setelah mengubahnya, jalankan `npm run functions:deploy`.

---

## 1. Buat project Supabase

1. Buka [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**. Pilih region **Southeast Asia (Singapore)**.
2. Simpan **database password**, karena akan diminta saat `db push`.
3. Catat **Project ref** (bagian URL `https://<ref>.supabase.co`).
4. Buka **Project Settings → API Keys**, lalu catat **Project URL** dan **Publishable key** (`sb_publishable_...`).

## 2. Siapkan Google Cloud

1. Buka [console.cloud.google.com](https://console.cloud.google.com) → buat project baru (misalnya `alpha-visual-tracker`).
2. **APIs & Services → Library** → cari **Google Calendar API** → **Enable**.
3. **Google Auth Platform** (dulu bernama *OAuth consent screen*):
   - **Branding**: isi nama app, email support, dan logo (opsional).
   - **Audience**: pilih **External**. Selama status masih **Testing**, tambahkan email Gmail anggota tim di **Test users**.
   - **Data access**: tambahkan scope `.../auth/calendar.events`.
4. **Clients → Create client → Web application**:
   - **Authorized JavaScript origins**: `http://localhost:5173` dan domain production nanti.
   - **Authorized redirect URIs**: `https://<ref>.supabase.co/auth/v1/callback`
   - Simpan **Client ID** dan **Client secret**.

> **Penting: refresh token kedaluwarsa 7 hari di mode Testing.** Untuk app External berstatus *Testing* yang meminta scope Calendar, Google mematikan refresh token setelah 7 hari. Akibatnya anggota tim harus menekan "Hubungkan ulang" seminggu sekali. Untuk pemakaian sehari-hari, ubah status ke **In production** di menu Audience. Selama app belum diverifikasi Google, user akan melihat layar peringatan "Google hasn't verified this app" (klik *Advanced → Go to …*), dan jumlah user dibatasi 100. Untuk tim internal itu biasanya cukup. Verifikasi resmi butuh domain, kebijakan privasi, dan review dari Google.

## 3. Aktifkan login Google di Supabase

1. **Authentication → Sign In / Providers → Google** → aktifkan, lalu isi Client ID dan Client secret dari langkah 2.
2. **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:5173` (ganti ke domain production saat deploy).
   - **Redirect URLs**: tambahkan `http://localhost:5173` dan domain production.

## 4. Deploy database dan Edge Functions

Jalankan dari folder proyek. CLI Supabase sudah terpasang sebagai devDependency.

```bash
npx supabase login                       # buka browser, login akun Supabase
npx supabase link --project-ref <ref>    # hubungkan folder ini ke project
npm run db:push                          # jalankan migration (tabel, RLS, realtime)
```

Buat file secret untuk Edge Functions (sudah di-ignore git):

```bash
cp supabase/functions/.env.example supabase/functions/.env
# isi GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET (sama dengan langkah 2)
npm run secrets:set
npm run functions:deploy
```

## 5. Daftarkan anggota tim

Hanya email yang ada di tabel `team_members` yang bisa melihat dan mengubah data. Buka **SQL Editor** di dashboard:

```sql
insert into public.team_members (email, name) values
  ('jonathanhopee@gmail.com', 'Jonathan'),
  ('anggota.lain@gmail.com', 'Nama Anggota');
```

Email harus huruf kecil. Untuk mencabut akses: `delete from public.team_members where email = '...';`

## 6. Jalankan frontend

```bash
cp .env.example .env.local
# isi VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

Buka `http://localhost:5173`, lalu:

1. **Masuk dengan Google**.
2. Kalau sebelumnya ada data di versi lama, akan muncul banner **Impor N event**. Klik untuk memindahkan data ke database.
3. Klik avatar di kanan atas → **Hubungkan Google Calendar**. Centang izin kalender di layar Google.
4. Tambah atau edit event, lalu cek Google Calendar. Event muncul dalam beberapa detik.

## Troubleshooting

| Gejala | Penyebab & solusi |
|---|---|
| Layar "Akun belum terdaftar" | Email belum ada di `team_members` (langkah 5), atau ditulis dengan huruf besar. |
| `redirect_uri_mismatch` di Google | Redirect URI di Google Cloud harus persis `https://<ref>.supabase.co/auth/v1/callback`. |
| Setelah izin, muncul "Izin Google Calendar belum dicentang" | Di layar izin Google, checkbox akses kalender tidak dicentang. Hubungkan lagi dan centang. |
| "Izin kalender kedaluwarsa" | Refresh token dicabut user atau lewat 7 hari di mode Testing. Klik **Hubungkan ulang**, dan lihat catatan di langkah 2. |
| Event tersimpan tapi tidak muncul di kalender | Cek log di **Edge Functions → calendar-sync → Logs**. Pastikan secret `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` sudah di-set. |
| Error 403 dari Calendar API | Google Calendar API belum di-enable di project Google Cloud (langkah 2.2). |

## Catatan desain

- **Refresh token tidak pernah disimpan di browser.** Token diterima sekali setelah layar izin Google, langsung dikirim ke `google-connect`, lalu disimpan di tabel yang hanya bisa dibaca service role.
- **Zona waktu**: semua jam dianggap WIB (`Asia/Jakarta`). Event di Bali/Makassar (WITA) atau Papua (WIT) akan bergeser satu sampai dua jam di kalender. Kalau sering terjadi, tambahkan kolom zona waktu per event.
- **Sinkronisasi dipicu dari browser** setelah simpan, edit, atau hapus. Kalau sync gagal, datanya tetap tersimpan dan muncul toast peringatan. Tombol **Sync ulang sekarang** di menu akun akan menyamakan seluruh kalender.
- **Perubahan di Google Calendar tidak kembali ke tracker** (sync satu arah). Tracker adalah sumber data utama: event yang diedit langsung di Google akan tertimpa saat event itu diubah lagi di tracker.
