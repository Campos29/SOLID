import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
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
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <main className="mx-auto max-w-lg px-4 py-10 text-center text-sm text-gray-500">
          Agendamento não encontrado.{' '}
          <Link to="/appointments" className="font-medium text-indigo-600 hover:underline">
            Voltar
          </Link>
        </main>
      </div>
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
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="mx-auto max-w-lg px-4 py-8">
        <Link
          to="/appointments"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          ← Meus agendamentos
        </Link>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h1 className="text-xl font-bold text-gray-900">Avaliar atendimento</h1>
          <p className="mt-2 text-sm text-gray-500">
            Como foi sua experiência com <span className="font-medium text-gray-700">{providerLabel}</span>?
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Sua nota</p>
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>

            <div>
              <label htmlFor="comment" className="mb-2 block text-sm font-medium text-gray-700">
                Comentário (opcional)
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={4}
                maxLength={1000}
                placeholder="Conte como foi o atendimento..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <Link
                to="/appointments"
                className="flex flex-1 items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancelar
              </Link>
              <div className="flex-1">
                <Button type="submit" isLoading={isSubmitting} disabled={rating < 1}>
                  Enviar avaliação
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
