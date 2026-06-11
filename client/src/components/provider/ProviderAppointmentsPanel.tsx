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
    <div className="rounded-[24px] border border-[#ECE6E2] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-outfit text-lg font-bold text-gray-900">Agendamentos</h2>
          <p className="mt-1 text-sm text-gray-500">
            Confirme solicitações pendentes dos seus clientes.
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="mt-2 inline-flex w-fit items-center rounded-full bg-[#FAF6F4] px-3 py-1 text-xs font-bold text-[#E65F2B] border border-[#E65F2B]/10 sm:mt-0">
            {pendingCount} pendente{pendingCount === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 ring-1 ring-red-100"
        >
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="mt-8 py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#E65F2B] border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-gray-500">Carregando agendamentos...</p>
        </div>
      ) : appointments.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">Nenhum agendamento recebido ainda.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {appointments.map((appointment) => (
            <li
              key={appointment.id}
              className="flex flex-col gap-3 rounded-2xl border border-[#ECE6E2] p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-[#FAF6F4]/30 transition-colors"
            >
              <div>
                <p className="text-sm font-bold text-gray-900">{appointment.clientName}</p>
                <p className="mt-1 text-sm font-medium text-gray-700">{appointment.serviceName}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {formatSlotRange(appointment.startsAt, appointment.endsAt)}
                </p>
                <p className="mt-1.5 text-xs">
                  <span className="font-semibold text-gray-400 uppercase tracking-wider">Status: </span>
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                    appointment.status.toLowerCase() === 'pending'
                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                      : appointment.status.toLowerCase() === 'confirmed'
                      ? 'bg-blue-50 text-blue-700 border border-blue-100'
                      : appointment.status.toLowerCase() === 'completed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-gray-50 text-gray-700 border border-gray-100'
                  }`}>
                    {formatAppointmentStatus(appointment.status)}
                  </span>
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
                    className="inline-flex items-center justify-center rounded-xl bg-[#E65F2B] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#c54e20] disabled:opacity-60 shadow-sm"
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
                    className="inline-flex items-center justify-center rounded-xl border border-[#ECE6E2] bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-50 hover:border-red-100 disabled:opacity-60"
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
                    className="inline-flex items-center justify-center rounded-xl bg-[#E65F2B] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#c54e20] disabled:opacity-60 shadow-sm"
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
