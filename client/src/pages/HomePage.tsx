import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { AppLayout } from '../components/AppLayout'
import { AppHeader } from '../components/AppHeader'
import { ProviderCard } from '../components/ProviderCard'
import { AppointmentScheduler } from '../components/AppointmentScheduler'
import { providerService } from '../services/providerService'
import { extractErrorMessage } from '../lib/api'
import type { Provider } from '../types/scheduling'

export function HomePage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [appliedCategory, setAppliedCategory] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeProvider, setActiveProvider] = useState<Provider | null>(null)

  useEffect(() => {
    let active = true
    async function loadProviders() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await providerService.list(appliedCategory)
        if (active) setProviders(result)
      } catch (err) {
        if (active) {
          setError(extractErrorMessage(err, 'Não foi possível carregar os prestadores.'))
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }
    loadProviders()
    return () => {
      active = false
    }
  }, [appliedCategory])

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAppliedCategory(searchTerm.trim())
  }

  return (
    <AppLayout>
      <AppHeader />

      <div className="mb-8">
        <h2 className="font-outfit text-xl font-bold text-gray-900">Encontre um prestador</h2>
        <p className="mt-1 text-sm text-gray-500 font-medium">
          Busque por categoria e escolha o melhor horário para você.
        </p>

        <form onSubmit={handleSearch} className="mt-5 flex gap-3 max-w-md">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Ex.: Barbearia, Estética, Saúde..."
            className="flex-1 rounded-2xl border border-[#ECE6E2] bg-white px-4 py-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#E65F2B] focus:outline-none focus:ring-1 focus:ring-[#E65F2B] transition-all"
          />
          <button
            type="submit"
            className="rounded-2xl bg-[#E65F2B] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#D04F1D] active:scale-[0.98] shadow-md shadow-[#E65F2B]/10"
          >
            Buscar
          </button>
        </form>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-6 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-500 font-medium">Carregando prestadores...</p>
      ) : providers.length === 0 ? (
        <div className="rounded-[24px] bg-white p-12 text-center text-sm text-gray-500 border border-[#ECE6E2] shadow-sm">
          Nenhum prestador encontrado
          {appliedCategory ? ` para "${appliedCategory}"` : ''}.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onSchedule={setActiveProvider}
            />
          ))}
        </div>
      )}

      {activeProvider && (
        <AppointmentScheduler
          provider={activeProvider}
          onClose={() => setActiveProvider(null)}
        />
      )}
    </AppLayout>
  )
}
