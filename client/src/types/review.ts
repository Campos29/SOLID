export interface Review {
  id: string
  appointmentId: string
  providerId: string
  clientId: string
  rating: number
  comment: string | null
  createdAt: string
}

export interface SubmitReviewPayload {
  rating: number
  comment?: string
}

export interface SubmitReviewResponse {
  review: Review
}
