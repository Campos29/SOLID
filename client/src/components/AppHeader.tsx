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
        <span className="inline-flex items-center gap-1.5 rounded-2xl bg-white/80 border border-[#ECE6E2] px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-700 shadow-sm backdrop-blur-sm">
          {user?.role === 'Provider' ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E65F2B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
              Prestador de Serviços
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E65F2B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Cliente
            </>
          )}
        </span>
      </div>
    </div>
  )
}
