import type { Provider } from '../types/scheduling'

interface ProviderCardProps {
  provider: Provider
  onSchedule: (provider: Provider) => void
}

// Single entry in the provider catalogue. Surfaces the provider's category as
// a badge and exposes the call-to-action that opens the scheduler.
export function ProviderCard({ provider, onSchedule }: ProviderCardProps) {
  return (
    <article className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-gray-900">{provider.name}</h3>
        <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
          {provider.category}
        </span>
      </div>

      <p className="mt-2 line-clamp-3 grow text-sm text-gray-500">
        {provider.description || 'Sem descrição disponível.'}
      </p>

      <button
        type="button"
        onClick={() => onSchedule(provider)}
        className="mt-4 rounded-lg border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-600 hover:text-white"
      >
        Agendar horário
      </button>
    </article>
  )
}
