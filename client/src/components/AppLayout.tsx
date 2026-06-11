import { ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/authContext'

interface AppLayoutProps {
  children: ReactNode
}

function renderIcon(path: string, isActive: boolean) {
  const className = `h-5 w-5 transition-colors`

  switch (path) {
    case '/':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      )
    case '/appointments':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      )
    case '/dashboard':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9"></rect>
          <rect x="14" y="3" width="7" height="5"></rect>
          <rect x="14" y="12" width="7" height="9"></rect>
          <rect x="3" y="16" width="7" height="5"></rect>
        </svg>
      )
    case '/availability':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      )
    default:
      return null
  }
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const isProvider = user?.role === 'Provider'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const clientLinks = [
    { path: '/', label: 'Prestadores' },
    { path: '/appointments', label: 'Meus agendamentos' },
  ]

  const providerLinks = [
    { path: '/dashboard', label: 'Painel Geral' },
    { path: '/availability', label: 'Disponibilidade' },
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
                  className={`flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-[#E65F2B] text-white shadow-md shadow-[#E65F2B]/10'
                      : 'text-gray-600 hover:bg-[#FAF6F4] hover:text-gray-900'
                  }`}
                >
                  {renderIcon(link.path, isActive)}
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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F9EBE6] text-[#E65F2B] font-bold text-sm border border-[#E65F2B]/10">
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
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 hover:bg-[#F9EBE6] text-gray-500 hover:text-[#E65F2B] transition-all border border-[#ECE6E2]/50 hover:border-[#E65F2B]/20 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
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
            className="rounded-xl p-2 bg-[#FAF6F4] text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
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
                  className={`flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-[#E65F2B] text-white'
                      : 'text-gray-600 hover:bg-[#FAF6F4] hover:text-gray-900'
                  }`}
                >
                  {renderIcon(link.path, isActive)}
                  {link.label}
                </Link>
              )
            })}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false)
                logout()
              }}
              className="flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-all cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
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

