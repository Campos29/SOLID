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
    <article className="flex flex-col rounded-[28px] bg-white p-6 shadow-sm border border-[#ECE6E2] hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-outfit text-base font-bold text-gray-900 leading-tight">{provider.name}</h3>
        <span className="shrink-0 rounded-full bg-[#F9EBE6] px-2.5 py-0.5 text-[11px] font-bold text-[#E65F2B] uppercase tracking-wider">
          {provider.category}
        </span>
      </div>

      {showRating && (
        <div className="mt-2 flex items-center gap-2">
          <StarRating value={averageRating} readOnly size="sm" />
          <span className="text-xs font-semibold text-gray-600">
            {formatRating(averageRating)}
            {provider.reviewCount != null && provider.reviewCount > 0 && (
              <span className="text-gray-400"> ({provider.reviewCount})</span>
            )}
          </span>
        </div>
      )}

      <p className="mt-3 line-clamp-3 grow text-sm text-gray-500 font-medium leading-relaxed">
        {provider.description || 'Sem descrição disponível.'}
      </p>

      <button
        type="button"
        onClick={() => onSchedule(provider)}
        className="mt-5 w-full rounded-2xl border border-[#E65F2B] px-5 py-2.5 text-xs font-bold text-[#E65F2B] transition-all hover:bg-[#E65F2B] hover:text-white active:scale-[0.98]"
      >
        Agendar horário
      </button>
    </article>
  )
}
