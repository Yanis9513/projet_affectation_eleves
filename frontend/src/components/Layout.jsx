import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Icons
const DashboardIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
)

const ProjectsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
)

const PreferencesIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
)

const AssignmentsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
)

const ProfileIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

function Layout() {
  const { isLoggedIn, userRole, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const NavLink = ({ to, icon: Icon, children, onClick }) => (
    <Link 
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive(to) 
          ? 'bg-blue-600 text-white shadow-sm' 
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      {Icon && <Icon />}
      {children}
    </Link>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo-esiee.svg" alt="ESIEE Paris" className="h-10" />
            </Link>

            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {isLoggedIn ? (
                <>
                  <NavLink to={`/${userRole}`} icon={DashboardIcon}>Tableau de bord</NavLink>
                  <NavLink to="/projects" icon={ProjectsIcon}>Projets</NavLink>
                  
                  {userRole === 'student' && (
                    <>
                      <NavLink to="/my-preferences" icon={PreferencesIcon}>Préférences</NavLink>
                      <NavLink to="/my-assignments" icon={AssignmentsIcon}>Affectations</NavLink>
                    </>
                  )}
                  
                  <NavLink to="/profile" icon={ProfileIcon}>Profil</NavLink>
                  
                  <div className="w-px h-6 bg-slate-200 mx-2" />
                  
                  {/* User badge */}
                  <div className="flex items-center gap-3 pl-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                        {(user?.name || user?.email || 'U')[0].toUpperCase()}
                      </div>
                      <div className="hidden lg:block">
                        <p className="text-sm font-medium text-slate-900 leading-tight">
                          {user?.name || user?.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">{userRole}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleLogout}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                      title="Déconnexion"
                    >
                      <LogoutIcon />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link 
                    to="/login" 
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    Connexion
                  </Link>
                  <Link 
                    to="/signup" 
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm hover:shadow transition-all"
                  >
                    S'inscrire
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white animate-fade-in">
            <div className="p-4 space-y-1">
              {isLoggedIn ? (
                <>
                  {/* User info */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                      {(user?.name || user?.email || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{user?.name || user?.email?.split('@')[0]}</p>
                      <p className="text-sm text-slate-500 capitalize">{userRole}</p>
                    </div>
                  </div>
                  
                  <NavLink to={`/${userRole}`} icon={DashboardIcon} onClick={() => setMobileMenuOpen(false)}>
                    Tableau de bord
                  </NavLink>
                  <NavLink to="/projects" icon={ProjectsIcon} onClick={() => setMobileMenuOpen(false)}>
                    Projets
                  </NavLink>
                  
                  {userRole === 'student' && (
                    <>
                      <NavLink to="/my-preferences" icon={PreferencesIcon} onClick={() => setMobileMenuOpen(false)}>
                        Mes Préférences
                      </NavLink>
                      <NavLink to="/my-assignments" icon={AssignmentsIcon} onClick={() => setMobileMenuOpen(false)}>
                        Mes Affectations
                      </NavLink>
                    </>
                  )}
                  
                  <NavLink to="/profile" icon={ProfileIcon} onClick={() => setMobileMenuOpen(false)}>
                    Mon Profil
                  </NavLink>
                  
                  <div className="border-t border-slate-200 pt-3 mt-3">
                    <button 
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogoutIcon />
                      Deconnexion
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Link 
                    to="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-2.5 text-center text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Connexion
                  </Link>
                  <Link 
                    to="/signup" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-2.5 text-center text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    S'inscrire
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 bg-white">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo-esiee.svg" alt="ESIEE Paris" className="h-6 opacity-60" />
              <span className="text-sm text-slate-500">
                © 2026 Système d'Affectation - ESIEE Paris
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <a href="#" className="hover:text-slate-700 transition-colors">Aide</a>
              <a href="#" className="hover:text-slate-700 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
