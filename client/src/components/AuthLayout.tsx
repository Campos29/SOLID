import type { ReactNode } from 'react'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-[#FAF6F4] via-[#F9EBE6] to-[#FAF6F4] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#E65F2B] to-[#F2825B] text-white font-black text-xl shadow-md shadow-[#E65F2B]/10">
            S
          </div>
          <h1 className="font-outfit text-3xl font-extrabold tracking-tight text-gray-900">SlotWise</h1>
          <p className="mt-1 text-xs uppercase tracking-widest font-semibold text-[#E65F2B]">Agendamento Inteligente</p>
        </div>

        {/* Card */}
        <div className="rounded-[28px] bg-white p-8 shadow-xl shadow-gray-100/50 border border-white/50">
          <h2 className="font-outfit text-2xl font-bold text-gray-900 leading-none">{title}</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">{subtitle}</p>

          <div className="mt-6">{children}</div>
        </div>

        <p className="mt-6 text-center text-sm font-semibold text-gray-600">{footer}</p>
      </div>
    </div>
  )
}
