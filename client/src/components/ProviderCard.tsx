import { StarRating } from './StarRating'
import { formatRating } from '../lib/format'
import type { Provider } from '../types/scheduling'

interface ProviderCardProps {
  provider: Provider
  onSchedule: (provider: Provider) => void
}



export function ProviderCard({ provider, onSchedule }: ProviderCardProps) {
  const averageRating = provider.averageRating ?? 0
  const showRating = averageRating > 0

  return (
    <article className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-gray-900">{provider.name}</h3>
        <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
          {provider.category}
        </span>
      </div>

      {showRating && (
        <div className="mt-2 flex items-center gap-2">
          <StarRating value={averageRating} readOnly size="sm" />
          <span className="text-xs font-medium text-gray-600">
            {formatRating(averageRating)}
            {provider.reviewCount != null && provider.reviewCount > 0 && (
              <span className="text-gray-400"> ({provider.reviewCount})</span>
            )}
          </span>
        </div>
      )}

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
