import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { Loading, Alert } from '../components/Loading'
import { projectAPI, assignmentAPI } from '../services/api'

// Icons
const PlayIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
)

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

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
      const assignmentsResponse = await assignmentAPI.getByProject(projectId)
      setAssignments(assignmentsResponse.data || [])

      // Load stats if assignments exist
      if (assignmentsResponse.data && assignmentsResponse.data.length > 0) {
        try {
          const statsResponse = await assignmentAPI.getStats(projectId)
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
      setError(err.response?.data?.detail || 'Impossible de charger les affectations.')
    } finally {
      setLoading(false)
    }
  }

  const runAlgorithm = async () => {
    setRunning(true)
    setError('')
    setSuccess('')

    try {
      const response = await assignmentAPI.runAlgorithm(parseInt(projectId))

      setSuccess(`Algorithme exécuté avec succès! ${response.data.groups_created} groupes créés.`)
      
      // Reload data
      await loadData()
    } catch (err) {
      console.error('Error running algorithm:', err)
      setError(err.response?.data?.detail || 'L\'algorithme a échoué. Vérifiez que tous les étudiants ont soumis leurs préférences.')
    } finally {
      setRunning(false)
    }
  }

  const clearAssignments = async () => {
    if (!confirm('Êtes-vous sûr de vouloir effacer toutes les affectations?')) {
      return
    }

    try {
      await assignmentAPI.deleteByProject(projectId)
      setSuccess('Affectations supprimées')
      setAssignments([])
      setStats(null)
    } catch (err) {
      setError('La suppression des affectations a échoué.')
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
    return <Loading text="Chargement des affectations..." />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Affectations de Groupes</h1>
          {project && (
            <p className="text-slate-600 mt-1">Projet : {project.title}</p>
          )}
        </div>
        <button
          onClick={() => navigate('/teacher')}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour
        </button>
      </div>

      {/* Messages */}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <Button 
          variant="primary" 
          onClick={runAlgorithm}
          disabled={running}
        >
          <span className="flex items-center gap-2">
            <PlayIcon />
            {running ? 'Exécution en cours...' : 'Exécuter l\'algorithme'}
          </span>
        </Button>
        
        {assignments.length > 0 && (
          <>
            <Button variant="secondary" onClick={downloadResults}>
              <span className="flex items-center gap-2">
                <DownloadIcon />
                Télécharger CSV
              </span>
            </Button>
            <Button variant="outline" onClick={clearAssignments}>
              <span className="flex items-center gap-2">
                <TrashIcon />
                Effacer
              </span>
            </Button>
          </>
        )}
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <UsersIcon />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{stats.total_groups}</div>
                <div className="text-sm text-slate-500">Groupes créés</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 rounded-xl">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{stats.total_assignments}</div>
                <div className="text-sm text-slate-500">Étudiants assignés</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">{stats.satisfaction_rate.toFixed(1)}%</div>
                <div className="text-sm text-slate-500">Satisfaction</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 rounded-xl">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{stats.average_group_size.toFixed(1)}</div>
                <div className="text-sm text-slate-500">Taille moyenne</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Groups Display */}
      {assignments.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Groupes formés
          </h2>
          
          {Object.keys(groupedAssignments)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(groupNum => (
              <div key={groupNum} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Groupe {groupNum}
                  </h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {groupedAssignments[groupNum].length} étudiant(s)
                  </span>
                </div>
                
                <div className="p-4 space-y-2">
                  {groupedAssignments[groupNum].map(assignment => (
                    <div 
                      key={assignment.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                          {assignment.student_id}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">
                            Étudiant #{assignment.student_id}
                          </div>
                          {assignment.preference_rank && (
                            <div className="text-sm text-emerald-600 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              A obtenu sa préférence
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-600">
                          Satisfaction: <span className="text-slate-900">{assignment.satisfaction_score ? `${assignment.satisfaction_score}/10` : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UsersIcon />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Aucune affectation
          </h3>
          <p className="text-slate-600">
            Cliquez sur "Exécuter l'algorithme" pour créer les groupes
          </p>
        </div>
      )}
    </div>
  )
}

export default AssignmentsPage
