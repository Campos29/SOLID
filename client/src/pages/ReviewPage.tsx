import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { AppLayout } from '../components/AppLayout'
import { StarRating } from '../components/StarRating'
import { Button } from '../components/ui/Button'
import { extractErrorMessage } from '../lib/api'
import { reviewService } from '../services/reviewService'

interface ReviewLocationState {
  providerName?: string
}

export function ReviewPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as ReviewLocationState | null

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resolvedAppointmentId = appointmentId ?? ''

  if (!resolvedAppointmentId) {
    return (
      <AppLayout>
        <AppHeader />
        <main className="mx-auto max-w-lg px-4 py-10 text-center text-sm text-gray-500">
          Agendamento não encontrado.{' '}
          <Link to="/appointments" className="font-semibold text-[#E65F2B] hover:underline">
            Voltar
          </Link>
        </main>
      </AppLayout>
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (rating < 1) {
      setError('Selecione uma nota de 1 a 5 estrelas.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await reviewService.submit(resolvedAppointmentId, {
        rating,
        comment: comment.trim() || undefined,
      })
      navigate('/appointments', { replace: true, state: { reviewSubmitted: true } })
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível enviar a avaliação.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const providerLabel = state?.providerName ?? 'seu prestador'

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Link
            to="/appointments"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#E65F2B] hover:text-[#c54e20] transition-colors"
          >
            ← Meus agendamentos
          </Link>
        </div>

        <AppHeader />

        <div className="mt-8 rounded-[28px] border border-[#ECE6E2] bg-white p-8 shadow-sm">
          <h1 className="font-outfit text-2xl font-bold tracking-tight text-gray-900">
            Avaliar atendimento
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Como foi sua experiência com <span className="font-bold text-gray-700">{providerLabel}</span>?
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-700">Sua nota</p>
              <div className="inline-block rounded-2xl bg-[#FAF6F4] p-3 border border-[#E65F2B]/10">
                <StarRating value={rating} onChange={setRating} size="lg" />
              </div>
            </div>

            <div>
              <label htmlFor="comment" className="mb-2 block text-sm font-semibold text-gray-700">
                Comentário (opcional)
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={4}
                maxLength={1000}
                placeholder="Conte como foi o atendimento..."
                className="w-full rounded-2xl border border-[#ECE6E2] px-4 py-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#E65F2B] focus:outline-none focus:ring-1 focus:ring-[#E65F2B] transition-colors"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-100">
                {error}
              </p>
            )}

            <div className="flex gap-4 pt-2">
              <Link
                to="/appointments"
                className="flex flex-1 items-center justify-center rounded-2xl border border-[#ECE6E2] px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </Link>
              <div className="flex-1">
                <Button type="submit" isLoading={isSubmitting} disabled={rating < 1} className="w-full rounded-2xl bg-[#E65F2B] hover:bg-[#c54e20]">
                  Enviar avaliação
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}

