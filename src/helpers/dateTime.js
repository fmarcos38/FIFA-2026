export function formatDateKey(date) {
  return new Intl.DateTimeFormat('en-CA').format(date)
}

export function addDays(date, days) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

export function formatKickoffParts(kickoff) {
  if (!kickoff) return { date: '', time: '' }

  const date = new Date(kickoff)
  if (Number.isNaN(date.getTime())) return { date: '', time: '' }

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const hours = String(date.getHours())
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return {
    date: `${day}/${month}`,
    time: minutes === '00' ? `${hours}hs` : `${hours}:${minutes}hs`,
  }
}

export function formatKickoff(kickoff, fallback = 'Fecha y hora a confirmar') {
  const { date, time } = formatKickoffParts(kickoff)

  return date && time ? `${date} ${time}` : fallback
}

export function formatKickoffTime(kickoff, fallback = '') {
  return formatKickoffParts(kickoff).time || fallback
}

export function toDatetimeLocalValue(kickoff) {
  if (!kickoff) return ''

  const date = new Date(kickoff)
  if (Number.isNaN(date.getTime())) return ''

  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return offsetDate.toISOString().slice(0, 16)
}

export function fromDatetimeLocalValue(value) {
  return value ? new Date(value).toISOString() : null
}
