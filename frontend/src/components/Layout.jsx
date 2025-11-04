import { Outlet, Link } from 'react-router-dom'
import { useState } from 'react'

function Layout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState('student') // 'student' or 'teacher'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md border-b-4 border-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img src="/logo-esiee.svg" alt="ESIEE Paris" className="h-10" />
              <Link to="/" className="text-xl font-bold text-primary-600 hover:text-primary-700">
                Affectation d'Étudiants
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                <>
                  <Link to={`/${userRole}`} className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md transition-colors">
                    Tableau de bord
                  </Link>
                  <Link to="/projects" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md transition-colors">
                    Projets
                  </Link>
                  {userRole === 'student' && (
                    <Link to="/preferences" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md transition-colors">
                      Mes Préférences
                    </Link>
                  )}
                  {userRole === 'teacher' && (
                    <Link to="/assignments" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md transition-colors">
                      Affectations
                    </Link>
                  )}
                  <button 
                    onClick={() => setIsLoggedIn(false)}
                    className="btn-secondary"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn-primary">
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet context={{ isLoggedIn, setIsLoggedIn, userRole, setUserRole }} />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-primary-100 mt-12">
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
