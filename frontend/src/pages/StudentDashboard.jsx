import { useState, useEffect } from 'react'

function StudentDashboard() {
  const [student, setStudent] = useState(null)
  const [assignment, setAssignment] = useState(null)

  useEffect(() => {
    // TODO: Fetch student data and assignment from API
    // Simulated data for now
    setStudent({
      name: 'John Doe',
      email: 'john.doe@example.com',
      studentNumber: 'E12345',
      languageLevel: 'B2'
    })

    setAssignment({
      project: 'AI Mobile Application',
      teamSize: 4,
      status: 'assigned'
    })
  }, [])

  if (!student) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card bg-gradient-to-r from-primary-50 to-purple-50 border-l-4 border-primary-600">
        <h1 className="text-3xl font-bold text-primary-600 mb-2">Bienvenue, {student.name} !</h1>
        <p className="text-gray-600">Voici votre tableau de bord étudiant</p>
      </div>

      {/* Student Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold text-primary-600 mb-4">Mes Informations</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Email :</span>
              <span className="font-medium">{student.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Numéro d'étudiant :</span>
              <span className="font-medium">{student.studentNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Niveau de langue :</span>
              <span className="font-medium">{student.languageLevel}</span>
            </div>
          </div>
        </div>

        {/* Assignment Status */}
        <div className="card">
          <h2 className="text-xl font-bold text-primary-600 mb-4">Statut d'Affectation</h2>
          {assignment ? (
            <div className="space-y-3">
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
                ✓ Vous avez été affecté à un projet
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Projet :</span>
                  <span className="font-medium">{assignment.project}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taille de l'équipe :</span>
                  <span className="font-medium">{assignment.teamSize} étudiants</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-medium">
              ⏳ Pas encore d'affectation. Veuillez soumettre vos préférences.
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold text-primary-600 mb-4">Actions Rapides</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <a href="/projects" className="btn-primary text-center">
            Voir Tous les Projets
          </a>
          <a href="/preferences" className="btn-secondary text-center">
            Soumettre mes Préférences
          </a>
          <button className="btn-secondary">
            Voir mon Équipe
          </button>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
