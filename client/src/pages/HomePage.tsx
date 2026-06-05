import { useAuth } from '../context/authContext'
import { Button } from '../components/ui/Button'

export function HomePage() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {user?.name ?? 'usuário'}!
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Você entrou como <span className="font-medium text-indigo-600">{user?.role}</span>.
        </p>
        <div className="mt-6">
          <Button type="button" onClick={logout}>
            Sair
          </Button>
        </div>
      </div>
    </div>
  )
}
