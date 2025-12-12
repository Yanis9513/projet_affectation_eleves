import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'

function HomePage() {
  const { isLoggedIn, userRole } = useAuth()

  return (
    <div className="text-center">
      {/* Hero Section */}
      <div className="py-16 px-4">
        <div className="flex justify-center mb-8">
          <img 
            src="/logo-esiee.svg" 
            alt="ESIEE Paris" 
            className="h-28 drop-shadow-lg" 
          />
        </div>
        <h1 className="text-6xl font-extrabold bg-gradient-to-r from-esiee-blue to-blue-700 bg-clip-text text-transparent mb-6">
          Système d'Affectation d'Étudiants
        </h1>
        <p className="text-2xl text-gray-700 mb-10 max-w-3xl mx-auto">
          Optimisez l'affectation des étudiants aux projets avec des algorithmes intelligents
        </p>
        <div className="space-x-4">
          {isLoggedIn ? (
            <Link to={`/${userRole}`}>
              <Button variant="primary" size="lg">
                📊 Mon Tableau de Bord
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="primary" size="lg">
                  🚀 Commencer
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg">
                  📖 En savoir plus
                </Button>
              </a>
            </>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-16 grid md:grid-cols-3 gap-8 mt-16 px-4">
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-blue-100">
          <div className="text-esiee-blue text-5xl mb-6">👥</div>
          <h3 className="text-2xl font-bold mb-3 text-gray-800">Gestion des Étudiants</h3>
          <p className="text-gray-600 leading-relaxed">
            Gérez facilement les profils, préférences et informations académiques des étudiants
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-purple-100">
          <div className="text-esiee-blue text-5xl mb-6">📊</div>
          <h3 className="text-2xl font-bold mb-3 text-gray-800">Création de Projets</h3>
          <p className="text-gray-600 leading-relaxed">
            Créez et gérez des projets avec des exigences et contraintes spécifiques
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-lg p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-green-100">
          <div className="text-esiee-blue text-5xl mb-6">🧬</div>
          <h3 className="text-2xl font-bold mb-3 text-gray-800">Affectation Intelligente</h3>
          <p className="text-gray-600 leading-relaxed">
            Utilisez des algorithmes génétiques pour optimiser les affectations
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 mt-16 px-4">
        <h2 className="text-4xl font-bold text-gray-900 mb-12">Comment ça Marche</h2>
        <div className="space-y-6 max-w-4xl mx-auto text-left">
          <div className="bg-gradient-to-r from-white to-blue-50 rounded-xl shadow-lg p-6 flex items-start space-x-5 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 border border-blue-100">
            <div className="bg-gradient-to-br from-esiee-blue to-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0 text-lg shadow-md">
              1
            </div>
            <div>
              <h4 className="font-bold text-xl mb-2 text-gray-800">Les Étudiants Soumettent leurs Préférences</h4>
              <p className="text-gray-600 leading-relaxed">
                Les étudiants classent leurs projets préférés selon leurs intérêts
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-white to-purple-50 rounded-xl shadow-lg p-6 flex items-start space-x-5 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 border border-purple-100">
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0 text-lg shadow-md">
              2
            </div>
            <div>
              <h4 className="font-bold text-xl mb-2 text-gray-800">Les Enseignants Définissent les Contraintes</h4>
              <p className="text-gray-600 leading-relaxed">
                Définissez les tailles min/max des groupes, les exigences linguistiques et autres contraintes
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-white to-green-50 rounded-xl shadow-lg p-6 flex items-start space-x-5 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 border border-green-100">
            <div className="bg-gradient-to-br from-green-600 to-green-800 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0 text-lg shadow-md">
              3
            </div>
            <div>
              <h4 className="font-bold text-xl mb-2 text-gray-800">L'Algorithme Optimise</h4>
              <p className="text-gray-600 leading-relaxed">
                Notre algorithme génétique trouve la meilleure affectation en tenant compte de toutes les contraintes
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-white to-orange-50 rounded-xl shadow-lg p-6 flex items-start space-x-5 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 border border-orange-100">
            <div className="bg-gradient-to-br from-orange-600 to-orange-800 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0 text-lg shadow-md">
              4
            </div>
            <div>
              <h4 className="font-bold text-xl mb-2 text-gray-800">Révision & Export</h4>
              <p className="text-gray-600 leading-relaxed">
                Consultez les affectations, visualisez les statistiques et exportez les résultats
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
