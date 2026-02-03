import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'

// Icons
const StudentsIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const ProjectsIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
)

const AlgorithmIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
)

function HomePage() {
  const { isLoggedIn, userRole } = useAuth()

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="relative py-20 lg:py-28">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="text-center max-w-4xl mx-auto px-4">
          {/* Logo badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200 mb-8 animate-fade-in-up">
            <img src="/logo-esiee.svg" alt="ESIEE Paris" className="h-6" />
            <span className="text-sm font-medium text-slate-600">ESIEE Paris</span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight animate-fade-in-up delay-100">
            Système d'Affectation{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
              d'Étudiants
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto animate-fade-in-up delay-200">
            Optimisez la gestion et l'affectation des étudiants aux projets grâce à notre plateforme intelligente
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in-up delay-300">
            {isLoggedIn ? (
              <Link to={`/${userRole}`}>
                <Button variant="primary" size="lg">
                  <span className="flex items-center gap-2">
                    Mon Tableau de Bord
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="primary" size="lg">
                    <span className="flex items-center gap-2">
                      Commencer
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="secondary" size="lg">
                    Créer un compte
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-gradient-to-b from-slate-50 to-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Fonctionnalités principales
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Une solution complète pour gérer les affectations de vos étudiants
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <StudentsIcon />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Gestion des Étudiants</h3>
              <p className="text-slate-600 leading-relaxed">
                Gérez facilement les profils, préférences et informations académiques des étudiants de manière centralisée.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
                <ProjectsIcon />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Création de Projets</h3>
              <p className="text-slate-600 leading-relaxed">
                Créez et gérez des projets avec des contraintes spécifiques : tailles de groupes, prérequis, dates limites.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <AlgorithmIcon />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Affectation Intelligente</h3>
              <p className="text-slate-600 leading-relaxed">
                Notre algorithme génétique trouve l'affectation optimale en respectant toutes les contraintes définies.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-lg text-slate-600">
              Un processus simple en 4 étapes
            </p>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-6 items-start group">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-transform">
                1
              </div>
              <div className="flex-1 bg-white rounded-xl p-6 border border-slate-200 shadow-sm group-hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-lg text-slate-900 mb-2">Soumission des préférences</h4>
                <p className="text-slate-600">Les étudiants classent leurs projets préférés selon leurs intérêts et compétences.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6 items-start group">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-purple-600/30 group-hover:scale-110 transition-transform">
                2
              </div>
              <div className="flex-1 bg-white rounded-xl p-6 border border-slate-200 shadow-sm group-hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-lg text-slate-900 mb-2">Configuration des contraintes</h4>
                <p className="text-slate-600">Les enseignants définissent les règles : tailles de groupes, prérequis linguistiques, etc.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6 items-start group">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-emerald-600/30 group-hover:scale-110 transition-transform">
                3
              </div>
              <div className="flex-1 bg-white rounded-xl p-6 border border-slate-200 shadow-sm group-hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-lg text-slate-900 mb-2">Optimisation automatique</h4>
                <p className="text-slate-600">L'algorithme génétique calcule l'affectation optimale en tenant compte de tous les critères.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-6 items-start group">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-amber-600/30 group-hover:scale-110 transition-transform">
                4
              </div>
              <div className="flex-1 bg-white rounded-xl p-6 border border-slate-200 shadow-sm group-hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-lg text-slate-900 mb-2">Révision et export</h4>
                <p className="text-slate-600">Consultez les affectations finales, visualisez les statistiques et exportez les résultats.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!isLoggedIn && (
        <div className="py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Prêt à commencer ?
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Rejoignez la plateforme et simplifiez la gestion de vos affectations dès aujourd'hui.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/signup">
                <Button variant="secondary" size="lg">
                  Créer un compte gratuitement
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" size="lg" className="text-white hover:bg-white/10">
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage
