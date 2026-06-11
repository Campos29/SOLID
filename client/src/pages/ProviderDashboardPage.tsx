import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
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
    <AppLayout>
      <AppHeader />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="font-outfit text-xl font-bold text-gray-900">Painel do prestador</h2>
          <p className="mt-1 text-sm text-gray-500 font-medium">
            Gerencie perfil, serviços e disponibilidade em um só lugar.
          </p>
        </div>
        {provider && (
          <div className="flex gap-2 bg-white border border-[#ECE6E2] p-1.5 rounded-2xl w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#E65F2B] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-[#FAF6F4] hover:text-gray-900'
              }`}
            >
              Visão geral
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('services')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'services'
                  ? 'bg-[#E65F2B] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-[#FAF6F4] hover:text-gray-900'
              }`}
            >
              Serviços
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('appointments')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'appointments'
                  ? 'bg-[#E65F2B] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-[#FAF6F4] hover:text-gray-900'
              }`}
            >
              Agendamentos
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500 font-medium">Carregando painel...</p>
      ) : !provider ? (
        <div className="max-w-xl rounded-[28px] bg-white p-8 border border-[#ECE6E2] shadow-sm">
          <h3 className="font-outfit text-lg font-bold text-gray-900">Criar perfil de prestador</h3>
          <p className="mt-1 text-sm text-gray-500 font-medium">
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
              <label htmlFor="provider-description" className="text-sm font-semibold text-gray-700">
                Descrição (opcional)
              </label>
              <textarea
                id="provider-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                className="rounded-2xl border border-[#ECE6E2] bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-[#E65F2B] focus:outline-none focus:ring-1 focus:ring-[#E65F2B] transition-all"
              />
            </div>
            {error && (
              <p role="alert" className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}
            <Button type="submit" isLoading={isCreating}>
              Criar perfil
            </Button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-[24px] bg-white p-6 border border-[#ECE6E2] shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Serviços</p>
              <p className="mt-1 font-outfit text-3xl font-extrabold text-gray-900">{services.length}</p>
              <button
                type="button"
                onClick={() => setActiveTab('services')}
                className="mt-3 text-xs font-bold text-[#E65F2B] hover:text-[#D04F1D] flex items-center gap-1"
              >
                Gerenciar ➔
              </button>
            </div>
            <div className="rounded-[24px] bg-white p-6 border border-[#ECE6E2] shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Avaliação</p>
              <p className="mt-1 font-outfit text-3xl font-extrabold text-gray-900">
                {provider.averageRating ? formatRating(provider.averageRating) : '—'}
              </p>
              <p className="mt-3 text-xs text-gray-500 font-semibold">
                {provider.reviewCount ? `${provider.reviewCount} avaliações` : 'Sem avaliações'}
              </p>
            </div>
            <Link
              to="/availability"
              className="rounded-[24px] bg-[#E65F2B] p-6 text-white shadow-md shadow-[#E65F2B]/10 transition-all hover:bg-[#D04F1D] active:scale-[0.98]"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-200">Agenda</p>
              <p className="mt-1 font-outfit text-lg font-bold">Disponibilidade</p>
              <p className="mt-3 text-xs text-orange-100 font-medium">Configure horários da semana</p>
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
    </AppLayout>
  )
}
