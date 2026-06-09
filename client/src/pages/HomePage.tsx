import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { AppHeader } from '../components/AppHeader'
import { ProviderCard } from '../components/ProviderCard'
import { AppointmentScheduler } from '../components/AppointmentScheduler'
import { providerService } from '../services/providerService'
import { extractErrorMessage } from '../lib/api'
import type { Provider } from '../types/scheduling'

// Customer-facing landing page: search the provider catalogue by category and
// open the scheduler to book a free slot with the chosen provider.
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
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Encontre um prestador</h1>
          <p className="mt-1 text-sm text-gray-500">
            Busque por categoria e escolha o melhor horário para você.
          </p>

          <form onSubmit={handleSearch} className="mt-4 flex gap-2">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Ex.: Barbearia, Estética, Saúde..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Buscar
            </button>
          </form>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100"
          >
            {error}
          </p>
        )}

        {isLoading ? (
          <p className="text-sm text-gray-500">Carregando prestadores...</p>
        ) : providers.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center text-sm text-gray-500 ring-1 ring-gray-100">
            Nenhum prestador encontrado
            {appliedCategory ? ` para "${appliedCategory}"` : ''}.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onSchedule={setActiveProvider}
              />
            ))}
          </div>
        )}
      </main>

      {activeProvider && (
        <AppointmentScheduler
          provider={activeProvider}
          onClose={() => setActiveProvider(null)}
        />
      )}
    </div>
  )
}
