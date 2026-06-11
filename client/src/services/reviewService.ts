import { api } from '../lib/api'
import type { SubmitReviewPayload, SubmitReviewResponse } from '../types/review'

const REVIEWED_KEY = 'slotwise.reviewedAppointments'



export function markAppointmentReviewed(appointmentId: string): void {
  const reviewed = getReviewedAppointmentIds()
  reviewed.add(appointmentId)
  sessionStorage.setItem(REVIEWED_KEY, JSON.stringify([...reviewed]))
}

export function getReviewedAppointmentIds(): Set<string> {
  try {
    const raw = sessionStorage.getItem(REVIEWED_KEY)
    if (!raw) return new Set()
    const parsed: unknown = JSON.parse(raw)
    return new Set(Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [])
  } catch {
    return new Set()
  }
}

export function hasReviewedAppointment(appointmentId: string): boolean {
  return getReviewedAppointmentIds().has(appointmentId)
}

export const reviewService = {
  async submit(
    appointmentId: string,
    payload: SubmitReviewPayload,
  ): Promise<SubmitReviewResponse> {
    const { data } = await api.post<SubmitReviewResponse>(
      `/appointments/${appointmentId}/reviews`,
      payload,
    )
    markAppointmentReviewed(appointmentId)
    return data
  },
}
