import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { ProviderProfileCard } from '../components/provider/ProviderProfileCard'
import { ProviderAppointmentsPanel } from '../components/provider/ProviderAppointmentsPanel'
import { ProviderServicesCrud } from '../components/provider/ProviderServicesCrud'
import { Button } from '../components/ui/Button'
import { TextField } from '../components/ui/TextField'
import { useAuth } from '../context/authContext'
import { extractErrorMessage } from '../lib/api'
import { formatRating } from '../lib/format'
import { providerService } from '../services/providerService'
import { serviceService } from '../services/serviceService'
import type { Provider, Service } from '../types/scheduling'

type DashboardTab = 'overview' | 'services' | 'appointments'

export function ProviderDashboardPage() {
  const { user } = useAuth()
  const [provider, setProvider] = useState<Provider | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState(user?.name ?? '')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    let active = true
    async function loadDashboard() {
      if (!user) return
      try {
        const result = await providerService.findByUserId(user.id)
        if (!active) return
        setProvider(result)
        if (result) {
          const providerServices = await serviceService.listByProvider(result.id)
          if (active) setServices(providerServices)
        }
      } catch (err) {
        if (active) setError(extractErrorMessage(err, 'Não foi possível carregar seu painel.'))
      } finally {
        if (active) setIsLoading(false)
      }
    }

    loadDashboard()
    return () => {
      active = false
    }
  }, [user])

  async function handleCreateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsCreating(true)
    setError(null)
    try {
      const created = await providerService.create({
        name: name.trim(),
        description: description.trim() || undefined,
        category: category.trim(),
      })
      setProvider(created)
      setActiveTab('overview')
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível criar o perfil de prestador.'))
    } finally {
      setIsCreating(false)
    }
  }

  if (user && user.role !== 'Provider') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Painel do prestador</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie perfil, serviços e disponibilidade em um só lugar.
            </p>
          </div>
          {provider && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={
                  activeTab === 'overview'
                    ? 'rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white'
                    : 'rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white'
                }
              >
                Visão geral
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('services')}
                className={
                  activeTab === 'services'
                    ? 'rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white'
                    : 'rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white'
                }
              >
                Serviços
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('appointments')}
                className={
                  activeTab === 'appointments'
                    ? 'rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white'
                    : 'rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white'
                }
              >
                Agendamentos
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <p className="mt-8 text-sm text-gray-500">Carregando painel...</p>
        ) : !provider ? (
          <div className="mt-8 max-w-xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Criar perfil de prestador</h2>
            <p className="mt-1 text-sm text-gray-500">
              Antes de cadastrar serviços, crie como seu negócio aparece no catálogo.
            </p>

            <form onSubmit={handleCreateProfile} className="mt-6 flex flex-col gap-4">
              <TextField
                id="provider-name"
                label="Nome público"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex.: Barbearia do João"
                minLength={2}
                required
              />
              <TextField
                id="provider-category"
                label="Categoria"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Ex.: Beleza, Saúde"
                minLength={2}
                required
              />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="provider-description" className="text-sm font-medium text-gray-700">
                  Descrição (opcional)
                </label>
                <textarea
                  id="provider-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              {error && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
                  {error}
                </p>
              )}
              <Button type="submit" isLoading={isCreating}>
                Criar perfil
              </Button>
            </form>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Serviços</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{services.length}</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('services')}
                  className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Gerenciar →
                </button>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Avaliação</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {provider.averageRating ? formatRating(provider.averageRating) : '—'}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  {provider.reviewCount ? `${provider.reviewCount} avaliações` : 'Sem avaliações'}
                </p>
              </div>
              <Link
                to="/availability"
                className="rounded-2xl bg-indigo-600 p-5 text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-indigo-200">Agenda</p>
                <p className="mt-2 text-lg font-semibold">Disponibilidade</p>
                <p className="mt-2 text-sm text-indigo-100">Configure horários da semana</p>
              </Link>
            </div>

            {activeTab === 'overview' && (
              <ProviderProfileCard provider={provider} onUpdate={setProvider} />
            )}
            {activeTab === 'services' && (
              <ProviderServicesCrud
                providerId={provider.id}
                services={services}
                onChange={setServices}
              />
            )}
            {activeTab === 'appointments' && (
              <ProviderAppointmentsPanel providerId={provider.id} />
            )}
          </div>
        )}
      </main>
    </div>
  )
}
