import { Link } from 'react-router-dom'
import { useAuth } from '../context/authContext'

export function AppHeader() {
  const { user, logout } = useAuth()
  const isProvider = user?.role === 'Provider'
  const homePath = isProvider ? '/dashboard' : '/'

  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-6">
          <Link to={homePath} className="text-xl font-bold text-indigo-600">
            SlotWise
          </Link>
          <nav className="hidden gap-4 text-sm sm:flex">
            {isProvider ? (
              <>
                <Link to="/dashboard" className="font-medium text-gray-600 hover:text-gray-900">
                  Painel
                </Link>
                <Link to="/availability" className="font-medium text-gray-600 hover:text-gray-900">
                  Disponibilidade
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className="font-medium text-gray-600 hover:text-gray-900">
                  Prestadores
                </Link>
                <Link to="/appointments" className="font-medium text-gray-600 hover:text-gray-900">
                  Meus agendamentos
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-gray-600 sm:inline">
            Olá, <span className="font-medium text-gray-900">{user?.name ?? 'usuário'}</span>
          </span>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}
