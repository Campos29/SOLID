import type { InputHTMLAttributes } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function TextField({ label, id, ...props }: TextFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-gray-700">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="rounded-2xl border border-[#ECE6E2] bg-white px-4 py-3 text-sm text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-[#E65F2B] focus:outline-none focus:ring-1 focus:ring-[#E65F2B]"
      />
    </div>
  )
}
