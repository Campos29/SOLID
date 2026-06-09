interface StarRatingProps {
  value: number
  max?: number
  onChange?: (rating: number) => void
  readOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'text-lg gap-0.5',
  md: 'text-2xl gap-1',
  lg: 'text-3xl gap-1.5',
}

// Reusable star input/display used by the post-appointment review form and
// read-only badges on the provider catalogue.
export function StarRating({
  value,
  max = 5,
  onChange,
  readOnly = false,
  size = 'md',
}: StarRatingProps) {
  const stars = Array.from({ length: max }, (_, index) => index + 1)

  return (
    <div
      className={`inline-flex items-center ${sizeClasses[size]}`}
      role={readOnly ? 'img' : 'radiogroup'}
      aria-label={readOnly ? `Avaliação: ${value} de ${max}` : 'Selecione uma nota'}
    >
      {stars.map((star) => {
        const filled = star <= Math.round(value)

        if (readOnly) {
          return (
            <span
              key={star}
              className={filled ? 'text-amber-400' : 'text-gray-300'}
              aria-hidden="true"
            >
              ★
            </span>
          )
        }

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            className={`transition-colors ${
              filled ? 'text-amber-400 hover:text-amber-500' : 'text-gray-300 hover:text-amber-300'
            }`}
            aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}
