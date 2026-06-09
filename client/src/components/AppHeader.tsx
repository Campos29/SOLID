import { useAuth } from '../context/authContext'

// Top navigation bar shared by the authenticated customer area. Shows the
// SlotWise brand, a greeting and a sign-out action.
export function AppHeader() {
  const { user, logout } = useAuth()

  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <span className="text-xl font-bold text-indigo-600">SlotWise</span>

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
