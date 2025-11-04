import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <div className="text-center">
      {/* Hero Section */}
      <div className="py-12">
        <div className="flex justify-center mb-6">
          <img src="/logo-esiee.svg" alt="ESIEE Paris" className="h-24" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Système d'Affectation d'Étudiants
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Optimisez l'affectation des étudiants aux projets avec des algorithmes intelligents
        </p>
        <div className="space-x-4">
          <Link to="/login" className="btn-primary inline-block">
            Commencer
          </Link>
          <a href="#features" className="btn-secondary inline-block">
            En savoir plus
          </a>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-12 grid md:grid-cols-3 gap-8 mt-12">
        <div className="card hover:shadow-lg transition-shadow">
          <div className="text-primary-600 text-4xl mb-4">👥</div>
          <h3 className="text-xl font-bold mb-2">Gestion des Étudiants</h3>
          <p className="text-gray-600">
            Gérez facilement les profils, préférences et informations académiques des étudiants
          </p>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <div className="text-primary-600 text-4xl mb-4">📊</div>
          <h3 className="text-xl font-bold mb-2">Création de Projets</h3>
          <p className="text-gray-600">
            Créez et gérez des projets avec des exigences et contraintes spécifiques
          </p>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <div className="text-primary-600 text-4xl mb-4">🧬</div>
          <h3 className="text-xl font-bold mb-2">Affectation Intelligente</h3>
          <p className="text-gray-600">
            Utilisez des algorithmes génétiques pour optimiser les affectations
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-12 mt-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Comment ça Marche</h2>
        <div className="space-y-6 max-w-3xl mx-auto text-left">
          <div className="card flex items-start space-x-4 hover:shadow-lg transition-shadow">
            <div className="bg-primary-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">Les Étudiants Soumettent leurs Préférences</h4>
              <p className="text-gray-600">
                Les étudiants classent leurs projets préférés selon leurs intérêts
              </p>
            </div>
          </div>

          <div className="card flex items-start space-x-4 hover:shadow-lg transition-shadow">
            <div className="bg-primary-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">Les Enseignants Définissent les Contraintes</h4>
              <p className="text-gray-600">
                Définissez les tailles min/max des groupes, les exigences linguistiques et autres contraintes
              </p>
            </div>
          </div>

          <div className="card flex items-start space-x-4 hover:shadow-lg transition-shadow">
            <div className="bg-primary-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">L'Algorithme Optimise</h4>
              <p className="text-gray-600">
                Notre algorithme génétique trouve la meilleure affectation en tenant compte de toutes les contraintes
              </p>
            </div>
          </div>

          <div className="card flex items-start space-x-4 hover:shadow-lg transition-shadow">
            <div className="bg-primary-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              4
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">Révision & Export</h4>
              <p className="text-gray-600">
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
