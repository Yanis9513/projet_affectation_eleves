import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md border-b-4 border-esiee-blue sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 cursor-pointer">
              <img src="/logo-esiee.svg" alt="ESIEE Paris" className="h-10 transition-transform hover:scale-110 duration-300" />
            </Link>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-esiee-blue p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                <>
                  {/* User greeting */}
                  <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full">
                    <span className="text-gray-700 text-sm">
                      Bonjour, <span className="font-semibold text-esiee-blue">{user?.name || user?.email?.split('@')[0]}</span>
                    </span>
                  </div>
                  
                  <Link 
                    to={`/${userRole}`} 
                    className={`px-3 py-2 rounded-md transition-all duration-200 ${
                      isActive(`/${userRole}`) 
                        ? 'bg-esiee-blue text-white' 
                        : 'text-gray-700 hover:text-esiee-blue hover:bg-blue-100 bg-gray-50'
                    }`}
                  >
                    Tableau de bord
                  </Link>
                  <Link 
                    to="/projects" 
                    className={`px-3 py-2 rounded-md transition-all duration-200 ${
                      isActive('/projects') 
                        ? 'bg-esiee-blue text-white' 
                        : 'text-gray-700 hover:text-esiee-blue hover:bg-blue-100 bg-gray-50'
                    }`}
                  >
                    Projets
                  </Link>
                  {userRole === 'student' && (
                    <>
                      <Link 
                        to="/my-preferences" 
                        className={`px-3 py-2 rounded-md transition-all duration-200 ${
                          isActive('/my-preferences') 
                            ? 'bg-esiee-blue text-white' 
                            : 'text-gray-700 hover:text-esiee-blue hover:bg-blue-100 bg-gray-50'
                        }`}
                      >
                        Mes Préférences
                      </Link>
                      <Link 
                        to="/my-assignments" 
                        className={`px-3 py-2 rounded-md transition-all duration-200 ${
                          isActive('/my-assignments') 
                            ? 'bg-esiee-blue text-white' 
                            : 'text-gray-700 hover:text-esiee-blue hover:bg-blue-100 bg-gray-50'
                        }`}
                      >
                        Mes Affectations
                      </Link>
                    </>
                  )}
                  <Link 
                    to="/profile" 
                    className={`px-3 py-2 rounded-md transition-all duration-200 ${
                      isActive('/profile') 
                        ? 'bg-esiee-blue text-white' 
                        : 'text-gray-700 hover:text-esiee-blue hover:bg-blue-100 bg-gray-50'
                    }`}
                  >
                    Mon Profil
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="bg-esiee-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  Connexion
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 py-2">
              <div className="px-4 space-y-2">
                {isLoggedIn ? (
                  <>
                    {/* User greeting */}
                    <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full">
                      <span className="text-gray-700 text-sm">
                        Bonjour, <span className="font-semibold text-esiee-blue">{user?.name || user?.email?.split('@')[0]}</span>
                      </span>
                    </div>
                    
                    <Link 
                      to={`/${userRole}`} 
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-3 py-2 rounded-md transition-all duration-200 ${
                        isActive(`/${userRole}`) 
                          ? 'bg-esiee-blue text-white' 
                          : 'text-gray-700 hover:text-esiee-blue hover:bg-blue-100 bg-gray-50'
                      }`}
                    >
                      Tableau de bord
                    </Link>
                    <Link 
                      to="/projects" 
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-3 py-2 rounded-md transition-all duration-200 ${
                        isActive('/projects') 
                          ? 'bg-esiee-blue text-white' 
                          : 'text-gray-700 hover:text-esiee-blue hover:bg-blue-100 bg-gray-50'
                      }`}
                    >
                      Projets
                    </Link>
                    {userRole === 'student' && (
                      <>
                        <Link 
                          to="/my-preferences" 
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block px-3 py-2 rounded-md transition-all duration-200 ${
                            isActive('/my-preferences') 
                              ? 'bg-esiee-blue text-white' 
                              : 'text-gray-700 hover:text-esiee-blue hover:bg-blue-100 bg-gray-50'
                          }`}
                        >
                          Mes Préférences
                        </Link>
                        <Link 
                          to="/my-assignments" 
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block px-3 py-2 rounded-md transition-all duration-200 ${
                            isActive('/my-assignments') 
                              ? 'bg-esiee-blue text-white' 
                              : 'text-gray-700 hover:text-esiee-blue hover:bg-blue-100 bg-gray-50'
                          }`}
                        >
                          Mes Affectations
                        </Link>
                      </>
                    )}
                    <Link 
                      to="/profile" 
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-3 py-2 rounded-md transition-all duration-200 ${
                        isActive('/profile') 
                          ? 'bg-esiee-blue text-white' 
                          : 'text-gray-700 hover:text-esiee-blue hover:bg-blue-100 bg-gray-50'
                      }`}
                    >
                      Mon Profil
                    </Link>
                    <button 
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full text-left bg-gray-200 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <Link 
                    to="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block bg-esiee-blue text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
                  >
                    Connexion
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center space-x-3">
            <img src="/logo-esiee.svg" alt="ESIEE Paris" className="h-8 opacity-70" />
            <p className="text-center text-gray-600">
              © 2025 Système d'Affectation d'Étudiants - ESIEE Paris
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
