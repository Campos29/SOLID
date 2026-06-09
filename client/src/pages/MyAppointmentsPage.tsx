import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { extractErrorMessage } from '../lib/api'
import { formatAppointmentStatus, formatSlotTime } from '../lib/format'
import { hasReviewedAppointment } from '../services/reviewService'
import { providerService } from '../services/providerService'
import { schedulingService } from '../services/schedulingService'
import type { Appointment, Provider } from '../types/scheduling'

function canReview(appointment: Appointment): boolean {
  return (
    appointment.status.toLowerCase() === 'completed' &&
    !hasReviewedAppointment(appointment.id)
  )
}

function canCancel(appointment: Appointment): boolean {
  const status = appointment.status.toLowerCase()
  return status === 'pending' || status === 'confirmed'
}

export function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [providersById, setProvidersById] = useState<Record<string, Provider>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const loadAppointments = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [appointmentsResult, providersResult] = await Promise.all([
        schedulingService.listMyAppointments(),
        providerService.list(),
      ])
      setAppointments(appointmentsResult)
      setProvidersById(
        Object.fromEntries(providersResult.map((provider) => [provider.id, provider])),
      )
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível carregar seus agendamentos.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  async function handleCancel(appointmentId: string) {
    setCancellingId(appointmentId)
    setError(null)
    try {
      const updated = await schedulingService.cancelAppointment(appointmentId)
      setAppointments((current) =>
        current.map((item) => (item.id === appointmentId ? updated : item)),
      )
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível cancelar o agendamento.'))
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Meus agendamentos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Acompanhe seus horários, cancele quando necessário e avalie atendimentos concluídos.
          </p>
        </div>

        {error && (
          <p role="alert" className="mb-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
            {error}
          </p>
        )}

        {isLoading ? (
          <p className="text-sm text-gray-500">Carregando agendamentos...</p>
        ) : appointments.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-gray-100">
            <p className="text-sm text-gray-500">Você ainda não possui agendamentos.</p>
            <Link
              to="/"
              className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Buscar prestadores
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {appointments.map((appointment) => {
              const providerName =
                providersById[appointment.providerId]?.name ?? 'Prestador'

              return (
                <li
                  key={appointment.id}
                  className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{providerName}</p>
                    <p className="mt-1 text-sm text-gray-700">
                      {formatSlotTime(appointment.startsAt)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Status: {formatAppointmentStatus(appointment.status)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {canCancel(appointment) && (
                      <button
                        type="button"
                        onClick={() => handleCancel(appointment.id)}
                        disabled={cancellingId === appointment.id}
                        className="inline-flex items-center justify-center rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60"
                      >
                        {cancellingId === appointment.id ? 'Cancelando...' : 'Cancelar'}
                      </button>
                    )}
                    {canReview(appointment) && (
                      <Link
                        to={`/appointments/${appointment.id}/review`}
                        state={{ providerName }}
                        className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
                      >
                        Avaliar
                      </Link>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}
