import { useCallback, useEffect, useState } from 'react'
import { extractErrorMessage } from '../../lib/api'
import { formatAppointmentStatus, formatSlotRange } from '../../lib/format'
import { schedulingService } from '../../services/schedulingService'
import type { ProviderAppointment } from '../../types/scheduling'

interface ProviderAppointmentsPanelProps {
  providerId: string
}

function canConfirm(appointment: ProviderAppointment): boolean {
  return appointment.status.toLowerCase() === 'pending'
}

function canReject(appointment: ProviderAppointment): boolean {
  return appointment.status.toLowerCase() === 'pending'
}

function canComplete(appointment: ProviderAppointment): boolean {
  return appointment.status.toLowerCase() === 'confirmed'
}

export function ProviderAppointmentsPanel({ providerId }: ProviderAppointmentsPanelProps) {
  const [appointments, setAppointments] = useState<ProviderAppointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actingId, setActingId] = useState<string | null>(null)

  const loadAppointments = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await schedulingService.listProviderAppointments(providerId)
      setAppointments(result)
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível carregar os agendamentos.'))
    } finally {
      setIsLoading(false)
    }
  }, [providerId])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  async function runAction(
    appointmentId: string,
    action: (id: string) => Promise<{ status: string }>,
    failureMessage: string,
  ) {
    setActingId(appointmentId)
    setError(null)
    try {
      const updated = await action(appointmentId)
      setAppointments((current) =>
        current.map((item) =>
          item.id === appointmentId ? { ...item, status: updated.status } : item,
        ),
      )
    } catch (err) {
      setError(extractErrorMessage(err, failureMessage))
    } finally {
      setActingId(null)
    }
  }

  const pendingCount = appointments.filter((item) => item.status.toLowerCase() === 'pending').length

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Agendamentos</h2>
          <p className="mt-1 text-sm text-gray-500">
            Confirme solicitações pendentes dos seus clientes.
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="mt-2 inline-flex w-fit items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100 sm:mt-0">
            {pendingCount} pendente{pendingCount === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100"
        >
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="mt-6 text-sm text-gray-500">Carregando agendamentos...</p>
      ) : appointments.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">Nenhum agendamento recebido ainda.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {appointments.map((appointment) => (
            <li
              key={appointment.id}
              className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">{appointment.clientName}</p>
                <p className="mt-1 text-sm text-gray-700">{appointment.serviceName}</p>
                <p className="mt-1 text-sm text-gray-600">
                  {formatSlotRange(appointment.startsAt, appointment.endsAt)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Status: {formatAppointmentStatus(appointment.status)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {canConfirm(appointment) && (
                  <button
                    type="button"
                    onClick={() =>
                      runAction(
                        appointment.id,
                        schedulingService.confirmAppointment,
                        'Não foi possível confirmar o agendamento.',
                      )
                    }
                    disabled={actingId === appointment.id}
                    className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {actingId === appointment.id ? 'Processando...' : 'Confirmar'}
                  </button>
                )}
                {canReject(appointment) && (
                  <button
                    type="button"
                    onClick={() =>
                      runAction(
                        appointment.id,
                        schedulingService.rejectAppointment,
                        'Não foi possível recusar o agendamento.',
                      )
                    }
                    disabled={actingId === appointment.id}
                    className="inline-flex items-center justify-center rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60"
                  >
                    Recusar
                  </button>
                )}
                {canComplete(appointment) && (
                  <button
                    type="button"
                    onClick={() =>
                      runAction(
                        appointment.id,
                        schedulingService.completeAppointment,
                        'Não foi possível concluir o agendamento.',
                      )
                    }
                    disabled={actingId === appointment.id}
                    className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
                  >
                    {actingId === appointment.id ? 'Processando...' : 'Concluir'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
