import { useEffect, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { CATEGORY_OPTIONS, PAYMENT_OPTIONS, STATUS_OPTIONS } from '../constants'
import { btnGhost, btnPrimary, fieldBase, fieldError, iconBtn, selectBase } from '../styles'
import { formatDateTimeInput, formatFeeInput, formatRupiah, parseFeeInput } from '../utils/format'

function createInitialForm(event) {
  if (event) {
    return {
      title: event.title || '',
      client: event.client || '',
      category: event.category || 'Wedding',
      startDate: event.startDate || '',
      endDate: event.endDate || '',
      location: event.location || '',
      fee: event.fee || 0,
      status: event.status || 'Inquiry',
      paymentStatus: event.paymentStatus || 'Belum DP',
      docLink: event.docLink || '',
      notes: event.notes || '',
    }
  }

  // Default waktu mulai: besok jam 10:00
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)

  return {
    title: '',
    client: '',
    category: 'Wedding',
    startDate: formatDateTimeInput(tomorrow),
    endDate: '',
    location: '',
    fee: 0,
    status: 'Inquiry',
    paymentStatus: 'Belum DP',
    docLink: '',
    notes: '',
  }
}

function validate(form) {
  const errors = {}
  if (!form.title.trim()) errors.title = 'Nama event wajib diisi.'
  if (!form.client.trim()) errors.client = 'Nama klien atau EO wajib diisi.'
  if (!form.startDate) errors.startDate = 'Waktu mulai wajib diisi.'
  if (form.startDate && form.endDate && form.endDate < form.startDate) {
    errors.endDate = 'Waktu selesai harus setelah waktu mulai.'
  }
  if (form.docLink.trim() && !/^https?:\/\/\S+$/i.test(form.docLink.trim())) {
    errors.docLink = 'Gunakan link lengkap yang diawali https://'
  }
  return errors
}

function Field({ id, label, required, error, hint, children, className = '' }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
        {required && <span className="ml-0.5 text-brand-600 dark:text-brand-400" aria-hidden="true">*</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
      ) : null}
    </div>
  )
}

function SelectField({ id, value, onChange, options, optionLabel = 'label' }) {
  return (
    <div className="relative">
      <select id={id} value={value} onChange={onChange} className={selectBase}>
        {options.map((o) => <option key={o.value} value={o.value}>{o[optionLabel]}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
    </div>
  )
}

export default function EventDrawer({ event, onClose, onSave }) {
  const [form, setForm] = useState(() => createInitialForm(event))
  const [submitted, setSubmitted] = useState(false)
  const isEdit = Boolean(event)
  const errors = submitted ? validate(form) : {}

  // Escape menutup drawer, dan halaman di belakangnya tidak ikut scroll
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  const bind = (field) => ({
    id: `f-${field}`,
    value: form[field],
    onChange: (e) => setForm((f) => ({ ...f, [field]: e.target.value })),
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `f-${field}-error` : undefined,
  })
  const inputClass = (field) => `${fieldBase} ${errors[field] ? fieldError : ''}`

  const handleSubmit = (e) => {
    e.preventDefault()
    const found = validate(form)
    const firstInvalid = Object.keys(found)[0]
    if (firstInvalid) {
      setSubmitted(true)
      document.getElementById(`f-${firstInvalid}`)?.focus()
      return
    }
    onSave({
      ...form,
      title: form.title.trim(),
      client: form.client.trim(),
      location: form.location.trim(),
      docLink: form.docLink.trim(),
      notes: form.notes.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <div className="absolute inset-0 bg-zinc-950/40 dark:bg-black/60 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-white dark:bg-zinc-900 shadow-2xl shadow-zinc-950/20 sm:ring-1 sm:ring-zinc-200 dark:sm:ring-zinc-800 animate-slide-in">
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 id="drawer-title" className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
              {isEdit ? 'Edit event' : 'Tambah event'}
            </h2>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">Detail acara, jadwal, honor, dan status pembayaran.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup" className={`${iconBtn} size-9 rounded-xl`}>
            <X className="size-5" />
          </button>
        </div>

        <form id="event-form" onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          <fieldset className="space-y-4">
            <legend className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-3">Acara</legend>
            <Field id="f-title" label="Nama event" required error={errors.title}>
              <input type="text" autoFocus placeholder="Wedding Dian & Rangga" className={inputClass('title')} {...bind('title')} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="f-client" label="Klien / EO" required error={errors.client}>
                <input type="text" placeholder="PT Kreasi Bangsa" className={inputClass('client')} {...bind('client')} />
              </Field>
              <Field id="f-category" label="Kategori">
                <SelectField {...bind('category')} options={CATEGORY_OPTIONS} />
              </Field>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-3">Jadwal & lokasi</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="f-startDate" label="Waktu mulai" required error={errors.startDate}>
                <input type="datetime-local" className={inputClass('startDate')} {...bind('startDate')} />
              </Field>
              <Field id="f-endDate" label="Waktu selesai" error={errors.endDate}>
                <input type="datetime-local" className={inputClass('endDate')} {...bind('endDate')} />
              </Field>
            </div>
            <Field id="f-location" label="Venue">
              <input type="text" placeholder="Ballroom Hotel Mulia Senayan, Jakarta" className={inputClass('location')} {...bind('location')} />
            </Field>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-3">Honor & status</legend>
            <Field id="f-fee" label="Honor / budget" hint={`Tercatat sebagai ${formatRupiah(form.fee)}`}>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">Rp.</span>
                <input
                  id="f-fee"
                  type="text"
                  inputMode="numeric"
                  placeholder="2.000.000"
                  aria-describedby="f-fee-hint"
                  value={formatFeeInput(form.fee)}
                  onChange={(e) => setForm((f) => ({ ...f, fee: parseFeeInput(e.target.value) }))}
                  className={`${fieldBase} pl-10 pr-8 tabular-nums`}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">,-</span>
              </div>
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="f-status" label="Progres">
                <SelectField {...bind('status')} options={STATUS_OPTIONS} optionLabel="longLabel" />
              </Field>
              <Field id="f-paymentStatus" label="Pembayaran" required>
                <SelectField {...bind('paymentStatus')} options={PAYMENT_OPTIONS} />
              </Field>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-3">Dokumen & catatan</legend>
            <Field id="f-docLink" label="Link rundown / brief" error={errors.docLink} hint="Google Drive, Notion, atau link lain">
              <input type="url" placeholder="https://drive.google.com/..." className={inputClass('docLink')} {...bind('docLink')} />
            </Field>
            <Field id="f-notes" label="Catatan & kebutuhan rider">
              <textarea
                rows={4}
                placeholder="Rundown, dresscode, PIC lapangan, kebutuhan teknis"
                className={`${fieldBase} h-auto py-2.5 leading-relaxed resize-y`}
                {...bind('notes')}
              />
            </Field>
          </fieldset>
        </form>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900">
          <button type="button" onClick={onClose} className={btnGhost}>Batal</button>
          <button type="submit" form="event-form" className={btnPrimary}>
            {isEdit ? 'Simpan perubahan' : 'Simpan event'}
          </button>
        </div>
      </div>
    </div>
  )
}
