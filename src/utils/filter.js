export const DEFAULT_FILTERS = {
  search: '',
  status: 'ALL',
  payment: 'ALL',
  category: 'ALL',
  sort: 'date-asc',
}

const SORTERS = {
  'date-asc': (a, b) => new Date(a.startDate) - new Date(b.startDate),
  'date-desc': (a, b) => new Date(b.startDate) - new Date(a.startDate),
  'fee-desc': (a, b) => (Number(b.fee) || 0) - (Number(a.fee) || 0),
  'fee-asc': (a, b) => (Number(a.fee) || 0) - (Number(b.fee) || 0),
  'created-desc': (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
}

export function hasActiveFilters(filters) {
  return filters.search.trim() !== '' || ['status', 'payment', 'category'].some((k) => filters[k] !== 'ALL')
}

export function filterAndSortEvents(events, filters) {
  const search = filters.search.toLowerCase().trim()

  const result = events.filter((e) => {
    if (search) {
      const haystack = [e.title, e.client, e.location, e.notes]
      if (!haystack.some((field) => field && field.toLowerCase().includes(search))) return false
    }
    if (filters.status !== 'ALL' && e.status !== filters.status) return false
    if (filters.payment !== 'ALL' && (e.paymentStatus || 'Belum DP') !== filters.payment) return false
    if (filters.category !== 'ALL' && e.category !== filters.category) return false
    return true
  })

  const sorter = SORTERS[filters.sort]
  return sorter ? result.sort(sorter) : result
}

export function computeStats(events) {
  const now = new Date()
  const confirmed = events.filter((e) => e.status === 'Confirmed')
  const sumFee = (list) => list.reduce((acc, e) => acc + (Number(e.fee) || 0), 0)
  const countPayment = (p) => events.filter((e) => e.paymentStatus === p).length

  return {
    total: events.length,
    upcoming: events.filter((e) => e.status !== 'Dibatalkan' && new Date(e.startDate) >= now).length,
    confirmed: confirmed.length,
    upcomingConfirmed: confirmed.filter((e) => new Date(e.startDate) >= now).length,
    nextConfirmed: confirmed
      .filter((e) => new Date(e.startDate) >= now)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0] || null,
    payment: {
      'Belum DP': countPayment('Belum DP'),
      'Sudah DP': countPayment('Sudah DP'),
      'Menunggu Pelunasan': countPayment('Menunggu Pelunasan'),
      Lunas: countPayment('Lunas'),
    },
    confirmedRevenue: sumFee(confirmed),
    potentialRevenue: sumFee(events.filter((e) => e.status !== 'Dibatalkan')),
  }
}
