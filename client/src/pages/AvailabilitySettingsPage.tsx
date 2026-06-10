import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { AppLayout } from '../components/AppLayout'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/authContext'
import { extractErrorMessage } from '../lib/api'
import { availabilityService } from '../services/availabilityService'
import { providerService } from '../services/providerService'
import { WEEK_DAYS } from '../types/availability'
import type { WeeklyAvailabilitySlot } from '../types/availability'

interface DayState {
  enabled: boolean
  startTime: string
  endTime: string
  slotIntervalInMinutes: number
}

function buildInitialState(): Record<number, DayState> {
  const state: Record<number, DayState> = {}
  for (const day of WEEK_DAYS) {
    state[day.value] = {
      enabled: day.value >= 1 && day.value <= 5,
      startTime: '09:00',
      endTime: '18:00',
      slotIntervalInMinutes: 30,
    }
  }
  return state
}

function toWeeklySlots(state: Record<number, DayState>): WeeklyAvailabilitySlot[] {
  return WEEK_DAYS.filter((day) => state[day.value].enabled).map((day) => ({
    dayOfWeek: day.value,
    startTime: state[day.value].startTime,
    endTime: state[day.value].endTime,
    slotIntervalInMinutes: state[day.value].slotIntervalInMinutes,
  }))
}

export function AvailabilitySettingsPage() {
  const { user } = useAuth()
  const [days, setDays] = useState<Record<number, DayState>>(buildInitialState)
  const [providerId, setProviderId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function loadProvider() {
      if (!user) return
      try {
        const provider = await providerService.findByUserId(user.id)
        if (!active) return
        setProviderId(provider?.id ?? null)
        if (!provider) {
          setError('Você ainda não possui um perfil de prestador cadastrado.')
        }
      } catch (err) {
        if (active) setError(extractErrorMessage(err, 'Não foi possível carregar seu perfil.'))
      } finally {
        if (active) setIsLoading(false)
      }
    }
    loadProvider()
    return () => {
      active = false
    }
  }, [user])

  function updateDay(dayValue: number, patch: Partial<DayState>) {
    setDays((current) => ({ ...current, [dayValue]: { ...current[dayValue], ...patch } }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!providerId) return

    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await availabilityService.configure(providerId, {
        weeklySlots: toWeeklySlots(days),
        blockedDates: [],
      })
      setSuccess('Disponibilidade salva com sucesso.')
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível salvar a disponibilidade.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#E65F2B] hover:text-[#c54e20] transition-colors"
          >
            ← Voltar para o Painel
          </Link>
        </div>

        <AppHeader />

        <div className="mt-8 rounded-[28px] border border-[#ECE6E2] bg-white p-8 shadow-sm">
          <div>
            <h1 className="font-outfit text-2xl font-bold tracking-tight text-gray-900">
              Disponibilidade semanal
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Defina os horários em que você aceita agendamentos em cada dia da semana.
            </p>
          </div>

          {isLoading ? (
            <div className="mt-8 py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#E65F2B] border-t-transparent"></div>
              <p className="mt-4 text-sm font-medium text-gray-500">Carregando horários...</p>
            </div>
          ) : !providerId ? (
            <div className="mt-8 rounded-2xl bg-amber-50 px-6 py-6 text-sm text-amber-900 ring-1 ring-amber-100">
              <p className="font-semibold">{error}</p>
              <Link
                to="/dashboard"
                className="mt-4 inline-block rounded-xl bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-700 transition-colors"
              >
                Ir ao painel e criar perfil →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="space-y-3">
                {WEEK_DAYS.map((day) => {
                  const state = days[day.value]
                  return (
                    <div
                      key={day.value}
                      className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 transition-all ${
                        state.enabled
                          ? 'border-[#E65F2B]/20 bg-[#FAF6F4]/40'
                          : 'border-[#ECE6E2] bg-gray-50/50 opacity-70'
                      }`}
                    >
                      <label className="flex w-36 items-center gap-3 text-sm font-bold text-gray-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={state.enabled}
                          onChange={(event) => updateDay(day.value, { enabled: event.target.checked })}
                          className="h-5 w-5 rounded-md border-[#ECE6E2] text-[#E65F2B] focus:ring-[#E65F2B] focus:ring-offset-0 transition-colors"
                        />
                        {day.label}
                      </label>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={state.startTime}
                            disabled={!state.enabled}
                            onChange={(event) => updateDay(day.value, { startTime: event.target.value })}
                            className="rounded-xl border border-[#ECE6E2] bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm focus:border-[#E65F2B] focus:outline-none focus:ring-1 focus:ring-[#E65F2B] disabled:bg-gray-100 disabled:opacity-50"
                          />
                          <span className="text-sm font-medium text-gray-400">até</span>
                          <input
                            type="time"
                            value={state.endTime}
                            disabled={!state.enabled}
                            onChange={(event) => updateDay(day.value, { endTime: event.target.value })}
                            className="rounded-xl border border-[#ECE6E2] bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm focus:border-[#E65F2B] focus:outline-none focus:ring-1 focus:ring-[#E65F2B] disabled:bg-gray-100 disabled:opacity-50"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Intervalo:</span>
                          <select
                            value={state.slotIntervalInMinutes}
                            disabled={!state.enabled}
                            onChange={(event) =>
                              updateDay(day.value, { slotIntervalInMinutes: Number(event.target.value) })
                            }
                            className="rounded-xl border border-[#ECE6E2] bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm focus:border-[#E65F2B] focus:outline-none focus:ring-1 focus:ring-[#E65F2B] disabled:bg-gray-100 disabled:opacity-50"
                          >
                            <option value={15}>15 min</option>
                            <option value={30}>30 min</option>
                            <option value={60}>60 min</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {error && (
                <div role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-100">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700 ring-1 ring-green-100">
                  {success}
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <Button type="submit" isLoading={isSaving} disabled={!providerId} className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-[#E65F2B] hover:bg-[#c54e20] text-white font-semibold">
                  Salvar Configurações
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

