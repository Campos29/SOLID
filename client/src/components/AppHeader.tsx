import { useAuth } from '../context/authContext'

export function AppHeader() {
  const { user } = useAuth()

  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="font-outfit text-3xl font-extrabold tracking-tight text-gray-900">
          Olá, {user?.name ?? 'usuário'}
        </h1>
        <p className="mt-1 text-sm text-gray-500 font-medium">
          Bem-vindo ao seu painel SlotWise.
        </p>
      </div>
      <div className="hidden md:flex items-center gap-3">
        <span className="rounded-2xl bg-white/80 border border-[#ECE6E2] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-600 shadow-sm backdrop-blur-sm">
          {user?.role === 'Provider' ? '💼 Prestador de Serviços' : '👤 Cliente'}
        </span>
      </div>
    </div>
  )
}
