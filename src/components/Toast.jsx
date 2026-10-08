import { CircleAlert, CircleCheck } from 'lucide-react'

export default function Toast({ message, tone = 'success', visible }) {
  const isError = tone === 'error'
  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      className={`fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-[60] flex items-start gap-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-4 py-3 text-sm font-medium text-white dark:text-zinc-900 shadow-xl shadow-zinc-950/20 transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none print:hidden ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      {isError ? (
        <CircleAlert className="size-4 mt-0.5 shrink-0 text-red-400 dark:text-red-600" />
      ) : (
        <CircleCheck className="size-4 mt-0.5 shrink-0 text-emerald-400 dark:text-emerald-600" />
      )}
      <span>{message}</span>
    </div>
  )
}
