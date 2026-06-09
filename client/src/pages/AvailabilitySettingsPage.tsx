import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
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

// Provider-facing form to configure the weekly availability grid that drives
// the customer slot calculation.
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
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link to="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          ← Painel
        </Link>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h1 className="text-xl font-bold text-gray-900">Disponibilidade semanal</h1>
          <p className="mt-2 text-sm text-gray-500">
            Defina os horários em que você aceita agendamentos em cada dia da semana.
          </p>

          {isLoading ? (
            <p className="mt-6 text-sm text-gray-500">Carregando...</p>
          ) : !providerId ? (
            <div className="mt-6 rounded-lg bg-amber-50 px-4 py-4 text-sm text-amber-900 ring-1 ring-amber-100">
              <p>{error}</p>
              <Link
                to="/dashboard"
                className="mt-3 inline-block font-medium text-indigo-600 hover:text-indigo-700"
              >
                Ir ao painel e criar perfil →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              {WEEK_DAYS.map((day) => {
                const state = days[day.value]
                return (
                  <div
                    key={day.value}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 p-3"
                  >
                    <label className="flex w-28 items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={state.enabled}
                        onChange={(event) => updateDay(day.value, { enabled: event.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                      />
                      {day.label}
                    </label>

                    <input
                      type="time"
                      value={state.startTime}
                      disabled={!state.enabled}
                      onChange={(event) => updateDay(day.value, { startTime: event.target.value })}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-sm disabled:opacity-50"
                    />
                    <span className="text-gray-400">até</span>
                    <input
                      type="time"
                      value={state.endTime}
                      disabled={!state.enabled}
                      onChange={(event) => updateDay(day.value, { endTime: event.target.value })}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-sm disabled:opacity-50"
                    />

                    <select
                      value={state.slotIntervalInMinutes}
                      disabled={!state.enabled}
                      onChange={(event) =>
                        updateDay(day.value, { slotIntervalInMinutes: Number(event.target.value) })
                      }
                      className="rounded-lg border border-gray-300 px-2 py-1 text-sm disabled:opacity-50"
                    >
                      <option value={15}>15 min</option>
                      <option value={30}>30 min</option>
                      <option value={60}>60 min</option>
                    </select>
                  </div>
                )
              })}

              {error && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
                  {error}
                </p>
              )}
              {success && (
                <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 ring-1 ring-green-100">
                  {success}
                </p>
              )}

              <div className="pt-2">
                <Button type="submit" isLoading={isSaving} disabled={!providerId}>
                  Salvar disponibilidade
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
