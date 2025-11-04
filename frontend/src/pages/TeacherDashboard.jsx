import { useState, useEffect } from 'react'

function TeacherDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    // TODO: Fetch statistics from API
    setStats({
      totalStudents: 120,
      totalProjects: 25,
      assignedStudents: 95,
      avgSatisfaction: 8.5
    })
  }, [])

  if (!stats) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card bg-gradient-to-r from-primary-50 to-purple-50 border-l-4 border-primary-600">
        <h1 className="text-3xl font-bold text-primary-600 mb-2">Tableau de Bord Enseignant</h1>
        <p className="text-gray-600">Gérez les étudiants, les projets et les affectations</p>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card bg-blue-50 border-2 border-blue-200 hover:shadow-lg transition-shadow">
          <div className="text-blue-600 text-3xl font-bold">{stats.totalStudents}</div>
          <div className="text-gray-700 font-medium">Total Étudiants</div>
        </div>
        <div className="card bg-green-50 border-2 border-green-200 hover:shadow-lg transition-shadow">
          <div className="text-green-600 text-3xl font-bold">{stats.totalProjects}</div>
          <div className="text-gray-700 font-medium">Projets Actifs</div>
        </div>
        <div className="card bg-purple-50 border-2 border-purple-200 hover:shadow-lg transition-shadow">
          <div className="text-purple-600 text-3xl font-bold">{stats.assignedStudents}</div>
          <div className="text-gray-700 font-medium">Étudiants Affectés</div>
        </div>
        <div className="card bg-yellow-50 border-2 border-yellow-200 hover:shadow-lg transition-shadow">
          <div className="text-yellow-600 text-3xl font-bold">{stats.avgSatisfaction}/10</div>
          <div className="text-gray-700 font-medium">Satisfaction Moyenne</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold text-primary-600 mb-4">Actions Rapides</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <button className="btn-primary">
            Créer un Projet
          </button>
          <button className="btn-secondary">
            Ajouter un Étudiant
          </button>
          <button className="btn-secondary">
            Lancer l'Algorithme
          </button>
          <button className="btn-secondary">
            Exporter les Résultats
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-bold text-primary-600 mb-4">Activité Récente</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <div className="font-medium">Algorithme d'affectation terminé</div>
              <div className="text-sm text-gray-600">95 étudiants affectés avec succès</div>
            </div>
            <span className="text-sm text-gray-500">Il y a 2 heures</span>
          </div>
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <div className="font-medium">Nouveau projet créé</div>
              <div className="text-sm text-gray-600">Système Domotique IoT</div>
            </div>
            <span className="text-sm text-gray-500">Il y a 5 heures</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Préférences étudiantes soumises</div>
              <div className="text-sm text-gray-600">15 nouvelles soumissions</div>
            </div>
            <span className="text-sm text-gray-500">Il y a 1 jour</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard
