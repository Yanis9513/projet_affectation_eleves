import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { CardSimple } from '../components/Card'
import { Loading, Alert } from '../components/Loading'
import { projectAPI } from '../services/api'
import axios from 'axios'

// Use the base API URL from environment or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function AssignmentsPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [project, setProject] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (projectId) {
      loadData()
    }
  }, [projectId])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      // Load project details
      const projectResponse = await projectAPI.getById(projectId)
      setProject(projectResponse.data)

      // Load existing assignments
      const assignmentsResponse = await axios.get(`${API_BASE_URL}/api/assignments/?project_id=${projectId}`)
      setAssignments(assignmentsResponse.data || [])

      // Load stats if assignments exist
      if (assignmentsResponse.data && assignmentsResponse.data.length > 0) {
        try {
          const statsResponse = await axios.get(`${API_BASE_URL}/api/assignments/stats?project_id=${projectId}`)
          setStats(statsResponse.data)
        } catch (statsErr) {
          console.error('Error loading stats:', statsErr)
          // Don't fail the whole load if stats fail
          setStats(null)
        }
      } else {
        setStats(null)
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err.response?.data?.detail || 'Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const runAlgorithm = async () => {
    setRunning(true)
    setError('')
    setSuccess('')

    try {
      const response = await axios.post(`${API_BASE_URL}/api/assignments/run-algorithm`, {
        project_id: parseInt(projectId)
      })

      setSuccess(`Algorithme exécuté avec succès! ${response.data.groups_created} groupes créés.`)
      
      // Reload data
      await loadData()
    } catch (err) {
      console.error('Error running algorithm:', err)
      setError(err.response?.data?.detail || 'Erreur lors de l\'exécution de l\'algorithme')
    } finally {
      setRunning(false)
    }
  }

  const clearAssignments = async () => {
    if (!confirm('Êtes-vous sûr de vouloir effacer toutes les affectations?')) {
      return
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/assignments/?project_id=${projectId}`)
      setSuccess('Affectations supprimées')
      setAssignments([])
      setStats(null)
    } catch (err) {
      setError('Erreur lors de la suppression')
    }
  }

  const downloadResults = () => {
    // Group assignments by group_number
    const groups = {}
    assignments.forEach(assignment => {
      const groupNum = assignment.group_number || 0
      if (!groups[groupNum]) {
        groups[groupNum] = []
      }
      groups[groupNum].push(assignment)
    })

    // Create CSV content
    let csv = 'Groupe,Étudiant ID,Satisfaction\n'
    Object.keys(groups).sort((a, b) => parseInt(a) - parseInt(b)).forEach(groupNum => {
      groups[groupNum].forEach(assignment => {
        csv += `${groupNum},${assignment.student_id},${assignment.satisfaction_score || 'N/A'}\n`
      })
    })

    // Download
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `assignments_project_${projectId}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Group assignments by group_number
  const groupedAssignments = {}
  assignments.forEach(assignment => {
    const groupNum = assignment.group_number || 0
    if (!groupedAssignments[groupNum]) {
      groupedAssignments[groupNum] = []
    }
    groupedAssignments[groupNum].push(assignment)
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <Loading text="Chargement..." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/teacher')}>
            ← Retour au tableau de bord
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Affectations de Groupes
          </h1>
          {project && (
            <p className="text-gray-600">Projet: {project.title}</p>
          )}
        </div>

        {/* Messages */}
        {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} className="mb-4" />}

        {/* Actions */}
        <div className="mb-6 flex gap-3 flex-wrap">
          <Button 
            variant="primary" 
            onClick={runAlgorithm}
            disabled={running}
          >
            {running ? 'Exécution en cours...' : 'Exécuter l\'algorithme'}
          </Button>
          
          {assignments.length > 0 && (
            <>
              <Button variant="secondary" onClick={downloadResults}>
                ⬇️ Télécharger CSV
              </Button>
              <Button variant="outline" onClick={clearAssignments}>
                🗑️ Effacer les affectations
              </Button>
            </>
          )}
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <CardSimple className="text-center">
              <div className="text-3xl font-bold text-esiee-blue">{stats.total_groups}</div>
              <div className="text-sm text-gray-600">Groupes créés</div>
            </CardSimple>
            
            <CardSimple className="text-center">
              <div className="text-3xl font-bold text-esiee-blue">{stats.total_assignments}</div>
              <div className="text-sm text-gray-600">Étudiants assignés</div>
            </CardSimple>
            
            <CardSimple className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.satisfaction_rate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Taux de satisfaction</div>
            </CardSimple>
            
            <CardSimple className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.average_group_size.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Taille moyenne</div>
            </CardSimple>
          </div>
        )}

        {/* Groups Display */}
        {assignments.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Groupes formés
            </h2>
            
            {Object.keys(groupedAssignments)
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map(groupNum => (
                <CardSimple key={groupNum} className="bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-esiee-blue">
                      Groupe {groupNum}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {groupedAssignments[groupNum].length} étudiant(s)
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {groupedAssignments[groupNum].map(assignment => (
                      <div 
                        key={assignment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-esiee-blue text-white flex items-center justify-center font-bold">
                            {assignment.student_id}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">
                              Étudiant #{assignment.student_id}
                            </div>
                            {assignment.preference_rank && (
                              <div className="text-sm text-green-600">
                                ✓ A obtenu son préférence
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-700">
                            Satisfaction: {assignment.satisfaction_score ? `${assignment.satisfaction_score}/10` : 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardSimple>
              ))}
          </div>
        ) : (
          <CardSimple className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Aucune affectation
            </h3>
            <p className="text-gray-600 mb-6">
              Cliquez sur "Exécuter l'algorithme" pour créer les groupes
            </p>
          </CardSimple>
        )}
      </div>
    </div>
  )
}

export default AssignmentsPage
