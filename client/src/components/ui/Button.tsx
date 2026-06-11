import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
}

export function Button({ isLoading = false, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className="flex w-full items-center justify-center rounded-2xl bg-[#E65F2B] px-5 py-3 text-sm font-bold text-white transition-all hover:bg-[#D04F1D] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#E65F2B] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? 'Aguarde...' : children}
    </button>
  )
}
