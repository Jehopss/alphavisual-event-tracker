// Warna = state semantik. Teks tetap memakai warna teks netral; identitas dibawa oleh titik warna.
// Warna pembayaran sudah divalidasi (dataviz validate_palette) untuk light & dark, dengan gap 2px + legenda berlabel.

const NEUTRAL = {
  dot: 'bg-zinc-400 dark:bg-zinc-500',
  tint: 'bg-zinc-100 dark:bg-zinc-800 ring-zinc-200 dark:ring-zinc-700',
}

const STATUS_BADGES = {
  Inquiry: {
    dot: 'bg-blue-500',
    tint: 'bg-blue-50 dark:bg-blue-500/10 ring-blue-200 dark:ring-blue-500/25',
  },
  Negosiasi: {
    dot: 'bg-amber-500 dark:bg-amber-600',
    tint: 'bg-amber-50 dark:bg-amber-500/10 ring-amber-200 dark:ring-amber-500/25',
  },
  Confirmed: {
    dot: 'bg-emerald-500 dark:bg-emerald-600',
    tint: 'bg-emerald-50 dark:bg-emerald-500/10 ring-emerald-200 dark:ring-emerald-500/25',
  },
  Selesai: NEUTRAL,
  Dibatalkan: {
    dot: 'bg-red-500',
    tint: 'bg-red-50 dark:bg-red-500/10 ring-red-200 dark:ring-red-500/25',
  },
}

const PAYMENT_BADGES = {
  'Belum DP': {
    dot: 'bg-red-500',
    tint: 'bg-red-50 dark:bg-red-500/10 ring-red-200 dark:ring-red-500/25',
  },
  'Sudah DP': {
    dot: 'bg-sky-500 dark:bg-sky-600',
    tint: 'bg-sky-50 dark:bg-sky-500/10 ring-sky-200 dark:ring-sky-500/25',
  },
  'Menunggu Pelunasan': {
    dot: 'bg-amber-500 dark:bg-amber-600',
    tint: 'bg-amber-50 dark:bg-amber-500/10 ring-amber-200 dark:ring-amber-500/25',
  },
  Lunas: {
    dot: 'bg-emerald-500 dark:bg-emerald-600',
    tint: 'bg-emerald-50 dark:bg-emerald-500/10 ring-emerald-200 dark:ring-emerald-500/25',
  },
}

export function getStatusBadge(status) {
  return STATUS_BADGES[status] || NEUTRAL
}

export function getPaymentBadge(paymentStatus) {
  return PAYMENT_BADGES[paymentStatus] || NEUTRAL
}
