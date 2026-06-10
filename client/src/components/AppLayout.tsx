import { ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/authContext'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const isProvider = user?.role === 'Provider'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const clientLinks = [
    { path: '/', label: 'Prestadores', icon: '🔍' },
    { path: '/appointments', label: 'Meus agendamentos', icon: '🗓️' },
  ]

  const providerLinks = [
    { path: '/dashboard', label: 'Painel Geral', icon: '📊' },
    { path: '/availability', label: 'Disponibilidade', icon: '⚙️' },
  ]

  const links = isProvider ? providerLinks : clientLinks

  return (
    <div className="flex min-h-screen bg-[#FAF6F4] text-[#2A2827]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r border-[#ECE6E2] bg-white/70 p-6 backdrop-blur-md md:flex md:flex-col md:justify-between">
        <div>
          {/* Logo */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#E65F2B] to-[#F2825B] text-white font-bold text-lg shadow-sm">
              S
            </div>
            <div>
              <span className="font-outfit text-xl font-bold tracking-tight text-gray-900">SlotWise</span>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold leading-none">Agendamentos</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {links.map((link) => {
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#E65F2B] text-white shadow-md shadow-[#E65F2B]/10'
                      : 'text-gray-600 hover:bg-[#FAF6F4] hover:text-gray-900'
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer profile */}
        <div className="border-t border-[#ECE6E2] pt-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 text-gray-700 font-bold text-sm">
                {user?.name?.slice(0, 2).toUpperCase()}
              </div>
              <div className="truncate max-w-[120px]">
                <p className="text-sm font-bold text-gray-900 leading-tight truncate">{user?.name}</p>
                <p className="text-[10px] text-gray-500 truncate">{user?.role === 'Provider' ? 'Prestador' : 'Cliente'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sair"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 hover:bg-[#F9EBE6] hover:text-[#E65F2B] transition-colors"
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="flex flex-col flex-1">
        <header className="flex items-center justify-between border-b border-[#ECE6E2] bg-white/70 px-6 py-4 backdrop-blur-md md:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#E65F2B] to-[#F2825B] text-white font-bold text-sm shadow-sm">
              S
            </div>
            <span className="font-outfit text-lg font-bold tracking-tight text-gray-900">SlotWise</span>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-xl p-2 bg-[#FAF6F4] text-gray-600 hover:text-gray-900"
          >
            🍔
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <nav className="border-b border-[#ECE6E2] bg-white px-6 py-4 space-y-1 md:hidden">
            {links.map((link) => {
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#E65F2B] text-white'
                      : 'text-gray-600 hover:bg-[#FAF6F4] hover:text-gray-900'
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  {link.label}
                </Link>
              )
            })}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false)
                logout()
              }}
              className="flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all"
            >
              <span>🚪</span>
              Sair da conta
            </button>
          </nav>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-12 md:py-10">
          {children}
        </main>
      </div>
    </div>
  )
}
