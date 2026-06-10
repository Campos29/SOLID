import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
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

function getStatusStyles(status: string): string {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-amber-50 text-amber-700 border border-amber-200'
    case 'confirmed':
      return 'bg-[#F9EBE6] text-[#E65F2B] border border-[#F9EBE6]'
    case 'completed':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    default:
      return 'bg-gray-100 text-gray-600 border border-gray-200'
  }
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
    <AppLayout>
      <AppHeader />

      <div className="mb-6">
        <h2 className="font-outfit text-xl font-bold text-gray-900">Meus agendamentos</h2>
        <p className="mt-1 text-sm text-gray-500 font-medium">
          Acompanhe seus horários, cancele quando necessário e avalie atendimentos concluídos.
        </p>
      </div>

      {error && (
        <p role="alert" className="mb-6 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-500 font-medium">Carregando agendamentos...</p>
      ) : appointments.length === 0 ? (
        <div className="rounded-[24px] bg-white p-12 text-center border border-[#ECE6E2] shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Você ainda não possui agendamentos.</p>
          <Link
            to="/"
            className="mt-4 inline-block text-sm font-bold text-[#E65F2B] hover:text-[#D04F1D] hover:underline"
          >
            Buscar prestadores
          </Link>
        </div>
      ) : (
        <ul className="space-y-4 max-w-3xl">
          {appointments.map((appointment) => {
            const providerName =
              providersById[appointment.providerId]?.name ?? 'Prestador'

            return (
              <li
                key={appointment.id}
                className="flex flex-col gap-4 rounded-[24px] bg-white p-6 shadow-sm border border-[#ECE6E2] sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-outfit text-base font-bold text-gray-900">{providerName}</p>
                  <p className="mt-1 text-sm text-gray-600 font-semibold">
                    {new Date(appointment.startsAt).toLocaleString('pt-BR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <div className="mt-2 flex items-center">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${getStatusStyles(appointment.status)}`}>
                      {formatAppointmentStatus(appointment.status)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {canCancel(appointment) && (
                    <button
                      type="button"
                      onClick={() => handleCancel(appointment.id)}
                      disabled={cancellingId === appointment.id}
                      className="inline-flex items-center justify-center rounded-2xl border border-red-200 px-4 py-2.5 text-xs font-bold text-red-600 transition-all hover:bg-red-50 disabled:opacity-60"
                    >
                      {cancellingId === appointment.id ? 'Cancelando...' : 'Cancelar'}
                    </button>
                  )}
                  {canReview(appointment) && (
                    <Link
                      to={`/appointments/${appointment.id}/review`}
                      state={{ providerName }}
                      className="inline-flex items-center justify-center rounded-2xl bg-[#E65F2B] px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#D04F1D] active:scale-[0.98]"
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
    </AppLayout>
  )
}
