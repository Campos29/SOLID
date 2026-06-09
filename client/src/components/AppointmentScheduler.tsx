import { useCallback, useEffect, useState } from 'react'
import { schedulingService } from '../services/schedulingService'
import { extractErrorMessage } from '../lib/api'
import {
  formatDuration,
  formatPrice,
  formatSlotRange,
  todayAsInputValue,
} from '../lib/format'
import type { AvailableSlot, Provider, Service } from '../types/scheduling'
import { Button } from './ui/Button'

interface AppointmentSchedulerProps {
  provider: Provider
  onClose: () => void
}

// Modal that walks a customer through booking with a provider: pick a service,
// choose a day, load the free slots for that day and confirm the appointment.
export function AppointmentScheduler({ provider, onClose }: AppointmentSchedulerProps) {
  const [services, setServices] = useState<Service[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState<string>('')
  const [date, setDate] = useState<string>(todayAsInputValue)

  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const [isLoadingServices, setIsLoadingServices] = useState(true)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<string | null>(null)

  // Load the provider's services once when the modal opens.
  useEffect(() => {
    let active = true
    async function loadServices() {
      try {
        const result = await schedulingService.listProviderServices(provider.id)
        if (!active) return
        setServices(result)
        setSelectedServiceId((current) => current || result[0]?.id || '')
      } catch (err) {
        if (active) setError(extractErrorMessage(err, 'Não foi possível carregar os serviços.'))
      } finally {
        if (active) setIsLoadingServices(false)
      }
    }
    loadServices()
    return () => {
      active = false
    }
  }, [provider.id])

  // Refetch the free slots whenever the selected service or day changes.
  useEffect(() => {
    if (!selectedServiceId || !date) {
      return
    }

    let active = true
    async function loadSlots() {
      setIsLoadingSlots(true)
      setSelectedSlot(null)
      setError(null)
      try {
        const result = await schedulingService.listAvailableSlots(
          provider.id,
          selectedServiceId,
          date,
        )
        if (active) setSlots(result)
      } catch (err) {
        if (active) {
          setSlots([])
          setError(extractErrorMessage(err, 'Não foi possível carregar os horários.'))
        }
      } finally {
        if (active) setIsLoadingSlots(false)
      }
    }
    loadSlots()
    return () => {
      active = false
    }
  }, [provider.id, selectedServiceId, date])

  const handleConfirm = useCallback(async () => {
    if (!selectedServiceId || !selectedSlot) return

    setIsBooking(true)
    setError(null)
    try {
      await schedulingService.createAppointment({
        providerId: provider.id,
        serviceId: selectedServiceId,
        startsAt: selectedSlot,
      })
      setConfirmation('Agendamento enviado! Aguarde a confirmação do prestador.')
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível concluir o agendamento.'))
    } finally {
      setIsBooking(false)
    }
  }, [provider.id, selectedServiceId, selectedSlot])

  const selectedService = services.find((service) => service.id === selectedServiceId)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Agendar com ${provider.name}`}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{provider.name}</h2>
            <p className="text-sm text-gray-500">{provider.category}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {confirmation ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <p className="rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700 ring-1 ring-green-100">
                {confirmation}
              </p>
              <Button type="button" onClick={onClose}>
                Concluir
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100"
                >
                  {error}
                </p>
              )}

              <div className="flex flex-col gap-1.5">
                <label htmlFor="service" className="text-sm font-medium text-gray-700">
                  Serviço
                </label>
                <select
                  id="service"
                  value={selectedServiceId}
                  onChange={(event) => setSelectedServiceId(event.target.value)}
                  disabled={isLoadingServices || services.length === 0}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50"
                >
                  {isLoadingServices && <option>Carregando serviços...</option>}
                  {!isLoadingServices && services.length === 0 && (
                    <option>Nenhum serviço disponível</option>
                  )}
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} — {formatPrice(service.priceInCents)} ·{' '}
                      {formatDuration(service.durationInMinutes)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="date" className="text-sm font-medium text-gray-700">
                  Data
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  min={todayAsInputValue()}
                  onChange={(event) => setDate(event.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">Horários disponíveis</span>
                  {selectedService && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      Cada opção mostra o período do atendimento (
                      {formatDuration(selectedService.durationInMinutes)}). Intervalos maiores
                      entre opções indicam horários já ocupados.
                    </p>
                  )}
                </div>
                {isLoadingSlots ? (
                  <p className="text-sm text-gray-500">Buscando horários...</p>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Nenhum horário livre para esta data. Tente outro dia.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {slots.map((slot) => {
                      const isSelected = selectedSlot === slot.startsAt
                      return (
                        <button
                          key={slot.startsAt}
                          type="button"
                          onClick={() => setSelectedSlot(slot.startsAt)}
                          className={
                            isSelected
                              ? 'rounded-lg bg-indigo-600 px-2 py-2 text-xs font-semibold text-white sm:text-sm'
                              : 'rounded-lg border border-gray-300 px-2 py-2 text-xs text-gray-700 transition-colors hover:border-indigo-500 hover:text-indigo-600 sm:text-sm'
                          }
                        >
                          {formatSlotRange(slot.startsAt, slot.endsAt)}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <Button
                type="button"
                onClick={handleConfirm}
                isLoading={isBooking}
                disabled={!selectedServiceId || !selectedSlot}
              >
                Confirmar agendamento
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
