// Kelas Tailwind bersama agar tombol, input, dan panel konsisten di seluruh aplikasi

const PRESS = 'whitespace-nowrap transition duration-200 ease-out active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none'

export const btnPrimary = `inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-brand-600 text-white text-sm font-medium shadow-sm shadow-brand-900/20 hover:bg-brand-700 ${PRESS}`

export const btnSecondary = `inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 text-sm font-medium ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/70 ${PRESS}`

export const btnGhost = `inline-flex items-center justify-center gap-2 h-10 px-3 rounded-xl text-zinc-600 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-white ${PRESS}`

export const iconBtn = `inline-flex items-center justify-center size-8 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 ${PRESS}`

export const fieldBase = 'w-full h-10 px-3 rounded-xl bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 hover:ring-zinc-300 dark:hover:ring-zinc-700 focus:ring-brand-500 dark:focus:ring-brand-500 focus-visible:outline-none transition'

export const fieldError = 'ring-red-500 dark:ring-red-500 hover:ring-red-500 dark:hover:ring-red-500'

export const selectBase = `${fieldBase} appearance-none pr-9 cursor-pointer`

export const panel = 'rounded-2xl bg-white dark:bg-zinc-900 ring-1 ring-zinc-200/80 dark:ring-zinc-800/80'
