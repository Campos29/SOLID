// Presentation helpers shared by the scheduling UI. They keep the
// backend's raw shapes (cents, ISO timestamps) out of the components.

export function formatPrice(priceInCents: number): string {
  return (priceInCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function formatDuration(durationInMinutes: number): string {
  const hours = Math.floor(durationInMinutes / 60)
  const minutes = durationInMinutes % 60
  if (hours === 0) {
    return `${minutes}min`
  }
  return minutes === 0 ? `${hours}h` : `${hours}h${minutes}min`
}

// Renders the start of a slot as a local HH:mm label for the time picker.
export function formatSlotTime(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Shows the full booking window (start – end) for a slot option.
export function formatSlotRange(startsAt: string, endsAt: string): string {
  return `${formatSlotTime(startsAt)} – ${formatSlotTime(endsAt)}`
}

// YYYY-MM-DD in the local timezone, used as the default scheduler date and as
// the minimum selectable day so customers cannot book in the past.
export function todayAsInputValue(): string {
  const now = new Date()
  const offsetMs = now.getTimezoneOffset() * 60 * 1000
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10)
}

export function formatRating(rating: number): string {
  return rating.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

export function formatAppointmentStatus(status: string): string {
  return STATUS_LABELS[status.toLowerCase()] ?? status
}
