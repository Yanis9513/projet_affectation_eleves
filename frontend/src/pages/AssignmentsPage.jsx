import { useState, useEffect } from 'react'

function AssignmentsPage() {
  const [assignments, setAssignments] = useState([])
  const [stats, setStats] = useState(null)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    // TODO: Fetch assignments from API
    fetchAssignments()
  }, [])

  const fetchAssignments = () => {
    // Simulated data
    setAssignments([
      {
        id: 1,
        projectName: 'AI Mobile Application',
        students: ['John Doe', 'Jane Smith', 'Bob Johnson'],
        satisfactionScore: 8.5
      },
      {
        id: 2,
        projectName: 'IoT Smart Home System',
        students: ['Alice Brown', 'Charlie Davis'],
        satisfactionScore: 9.2
      }
    ])

    setStats({
      totalAssignments: 95,
      avgSatisfaction: 8.5,
      firstChoiceCount: 60,
      unassignedCount: 5
    })
  }

  const handleRunAlgorithm = async () => {
    setIsRunning(true)
    // TODO: Call API to run algorithm
    setTimeout(() => {
      setIsRunning(false)
      fetchAssignments()
      alert('Algorithm completed successfully!')
    }, 3000)
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    alert('Exporting assignments...')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary-600">Gestion des Affectations</h1>
        <div className="space-x-2">
          <button
            onClick={handleRunAlgorithm}
            disabled={isRunning}
            className="btn-primary"
          >
            {isRunning ? 'En cours...' : '🧬 Lancer l\'Algorithme'}
          </button>
          <button onClick={handleExport} className="btn-secondary">
            📊 Exporter les Résultats
          </button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="card bg-blue-50 border-2 border-blue-200 hover:shadow-lg transition-shadow">
            <div className="text-blue-600 text-3xl font-bold">{stats.totalAssignments}</div>
            <div className="text-gray-700 font-medium">Total Affectations</div>
          </div>
          <div className="card bg-green-50 border-2 border-green-200 hover:shadow-lg transition-shadow">
            <div className="text-green-600 text-3xl font-bold">{stats.avgSatisfaction}/10</div>
            <div className="text-gray-700 font-medium">Satisfaction Moyenne</div>
          </div>
          <div className="card bg-purple-50 border-2 border-purple-200 hover:shadow-lg transition-shadow">
            <div className="text-purple-600 text-3xl font-bold">{stats.firstChoiceCount}</div>
            <div className="text-gray-700 font-medium">Premier Choix Obtenu</div>
          </div>
          <div className="card bg-yellow-50 border-2 border-yellow-200 hover:shadow-lg transition-shadow">
            <div className="text-yellow-600 text-3xl font-bold">{stats.unassignedCount}</div>
            <div className="text-gray-700 font-medium">Non Affectés</div>
          </div>
        </div>
      )}

      {/* Assignments List */}
      <div className="card">
        <h2 className="text-xl font-bold text-primary-600 mb-4">Affectations Actuelles</h2>
        {assignments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucune affectation pour le moment. Lancez l'algorithme pour générer les affectations.
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="border-2 border-primary-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-primary-600">{assignment.projectName}</h3>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Score : {assignment.satisfactionScore}/10
                  </span>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2 font-medium">
                    Membres de l'équipe ({assignment.students.length}) :
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {assignment.students.map((student, idx) => (
                      <span
                        key={idx}
                        className="bg-primary-50 border border-primary-200 px-3 py-1 rounded-full text-sm"
                      >
                        {student}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AssignmentsPage
