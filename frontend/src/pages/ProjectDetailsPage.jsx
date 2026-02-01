import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CardSimple } from '../components/Card'
import Button from '../components/Button'
import { Loading, Alert } from '../components/Loading'
import ConfirmModal from '../components/ConfirmModal'
import CSVUploader from '../components/CSVUploader'
import { projectAPI, assignmentAPI, destinationAPI, exchangeAPI, preferenceAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const translateProjectType = (type) => {
  const translations = {
    'group_project': 'Projet de groupe',
    'english_leveling': 'Niveau d\'anglais',
    'exchange_program': 'Programme d\'échange'
  }
  return translations[type] || type
}

const getProjectTypeColor = (type) => {
  switch(type) {
    case 'exchange_program':
      return 'bg-purple-100 text-purple-800'
    case 'english_leveling':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-blue-100 text-blue-800'
  }
}

export default function ProjectDetailsPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { userRole } = useAuth()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState(null)
  const [students, setStudents] = useState([])
  const [assignments, setAssignments] = useState([])
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteModal, setDeleteModal] = useState(false)
  const [showUploadStudents, setShowUploadStudents] = useState(false)
  const [removeStudentModal, setRemoveStudentModal] = useState({ isOpen: false, studentId: null, studentName: '' })
  
  // Exchange program states
  const [destinations, setDestinations] = useState([])
  const [showAddDestination, setShowAddDestination] = useState(false)
  const [exchangeStats, setExchangeStats] = useState(null)
  const [studentsStatus, setStudentsStatus] = useState(null)
  const [optimizationResult, setOptimizationResult] = useState(null)
  const [isLaunching, setIsLaunching] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)

  const isTeacher = userRole === 'teacher'
  const isExchangeProgram = project?.project_type === 'exchange_program'
  const isGroupProject = project?.project_type === 'group_project'
  const isEnglishLeveling = project?.project_type === 'english_leveling'
  
  // Group project states
  const [groupPreferences, setGroupPreferences] = useState(null)
  const [isLoadingGroupPrefs, setIsLoadingGroupPrefs] = useState(false)
  
  // English leveling states
  const [englishLevelStats, setEnglishLevelStats] = useState(null)
  const [isLoadingEnglishStats, setIsLoadingEnglishStats] = useState(false)

  useEffect(() => {
    loadProjectDetails()
  }, [projectId])

  const loadProjectDetails = async () => {
    try {
      setLoading(true)
      // Load project details
      const projectResponse = await projectAPI.getById(projectId)
      setProject(projectResponse.data)

      // Load students enrolled in this project
      const studentsResponse = await projectAPI.getStudents(projectId)
      setStudents(studentsResponse.data || [])

      // If exchange program, load destinations and stats
      if (projectResponse.data?.project_type === 'exchange_program') {
        await loadExchangeData()
        // Also load assignments for exchange programs
        try {
          console.log('[FRONTEND] Loading assignments for exchange project', projectId)
          const assignmentsResponse = await assignmentAPI.getByProject(projectId)
          console.log('[FRONTEND] Assignments response:', assignmentsResponse.data)
          if (assignmentsResponse.data && assignmentsResponse.data.length > 0) {
            console.log('[FRONTEND] Setting', assignmentsResponse.data.length, 'assignments')
            setAssignments(assignmentsResponse.data)
            const statsResponse = await assignmentAPI.getStats(projectId)
            setStats(statsResponse.data)
          } else {
            console.log('[FRONTEND] No assignments found')
          }
        } catch (err) {
          console.log('[FRONTEND] Error loading assignments:', err)
        }
      } else if (projectResponse.data?.project_type === 'group_project') {
        // Load group project preferences
        await loadGroupPreferences()
        // Load assignments for group projects
        try {
          const assignmentsResponse = await assignmentAPI.getByProject(projectId)
          if (assignmentsResponse.data && assignmentsResponse.data.length > 0) {
            setAssignments(assignmentsResponse.data)
            const statsResponse = await assignmentAPI.getStats(projectId)
            setStats(statsResponse.data)
          }
        } catch (err) {
          // No assignments yet, that's okay
        }
      } else if (projectResponse.data?.project_type === 'english_leveling') {
        // Load English leveling statistics
        await loadEnglishLevelingStats()
        // Also load assignments for English leveling
        try {
          const assignmentsResponse = await assignmentAPI.getByProject(projectId)
          if (assignmentsResponse.data && assignmentsResponse.data.length > 0) {
            setAssignments(assignmentsResponse.data)
            const statsResponse = await assignmentAPI.getStats(projectId)
            setStats(statsResponse.data)
          }
        } catch (err) {
          // No assignments yet, that's okay
        }
      } else {
        // Load assignments/groups for other non-exchange projects
        try {
          const assignmentsResponse = await assignmentAPI.getByProject(projectId)
          if (assignmentsResponse.data && assignmentsResponse.data.length > 0) {
            setAssignments(assignmentsResponse.data)
            const statsResponse = await assignmentAPI.getStats(projectId)
            setStats(statsResponse.data)
          }
        } catch (err) {
          // No assignments yet, that's okay
        }
      }
    } catch (err) {
      console.error('Error loading project details:', err)
      setError('Erreur lors du chargement des détails du projet')
    } finally {
      setLoading(false)
    }
  }

  const loadExchangeData = async () => {
    try {
      // Load destinations
      const destResponse = await destinationAPI.getByProject(projectId)
      setDestinations(destResponse.data || [])
      
      // Load exchange stats
      const statsResponse = await exchangeAPI.getStatistics(projectId)
      setExchangeStats(statsResponse.data)
      
      // Load students status
      const statusResponse = await exchangeAPI.getStudentsStatus(projectId)
      setStudentsStatus(statusResponse.data)
    } catch (err) {
      console.error('Error loading exchange data:', err)
    }
  }

  const loadGroupPreferences = async () => {
    try {
      setIsLoadingGroupPrefs(true)
      const response = await preferenceAPI.getProjectPreferencesDetailed(projectId)
      setGroupPreferences(response.data)
    } catch (err) {
      console.error('Error loading group preferences:', err)
      toast.error('Erreur lors du chargement des préférences de groupe')
    } finally {
      setIsLoadingGroupPrefs(false)
    }
  }

  const loadEnglishLevelingStats = async () => {
    try {
      setIsLoadingEnglishStats(true)
      // Calculate English level statistics from students
      const levelStats = {
        A1: 0,
        A2: 0,
        B1: 0,
        B2: 0,
        C1: 0,
        C2: 0,
        unknown: 0
      }
      
      students.forEach(student => {
        const level = student.english_level || 'unknown'
        if (levelStats.hasOwnProperty(level)) {
          levelStats[level]++
        } else {
          levelStats.unknown++
        }
      })
      
      setEnglishLevelStats(levelStats)
    } catch (err) {
      console.error('Error loading English leveling stats:', err)
    } finally {
      setIsLoadingEnglishStats(false)
    }
  }

  const handleLaunchExchange = async () => {
    try {
      setIsLaunching(true)
      const response = await exchangeAPI.launch(projectId)
      toast.success(response.data.message)
      await loadProjectDetails()
    } catch (err) {
      console.error('Error launching exchange:', err)
      toast.error(err.response?.data?.detail || 'Erreur lors du lancement')
    } finally {
      setIsLaunching(false)
    }
  }

  const handleClosePreferences = async () => {
    try {
      setIsClosing(true)
      const response = await exchangeAPI.closePreferences(projectId, true)
      toast.success(response.data.message)
      await loadProjectDetails()  // Reload full project to update is_open_for_preferences
    } catch (err) {
      console.error('Error closing preferences:', err)
      toast.error(err.response?.data?.detail || 'Erreur lors de la clôture')
    } finally {
      setIsClosing(false)
    }
  }

  const handleRunOptimization = async (algorithm = 'greedy') => {
    console.log('[FRONTEND] Running optimization algorithm:', algorithm)
    try {
      setIsOptimizing(true)
      const response = await exchangeAPI.runOptimization(projectId, algorithm)
      console.log('[FRONTEND] Algorithm response:', response.data)
      setOptimizationResult(response.data)
      toast.success('Optimisation terminée!')
      // Reload assignments after running algorithm
      console.log('[FRONTEND] Reloading project details...')
      await loadProjectDetails()
      console.log('[FRONTEND] Reload complete, assignments count:', assignments.length)
    } catch (err) {
      console.error('[FRONTEND] Error running optimization:', err)
      toast.error(err.response?.data?.detail || 'Erreur lors de l\'optimisation')
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleRunAlgorithm = async () => {
    try {
      setIsOptimizing(true)
      const response = await assignmentAPI.runAlgorithm(projectId)
      toast.success(response.data?.message || 'Algorithme exécuté avec succès!')
      // Reload project details to show new assignments
      await loadProjectDetails()
    } catch (err) {
      console.error('Error running algorithm:', err)
      toast.error(err.response?.data?.detail || 'Erreur lors de l\'exécution de l\'algorithme')
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleAddDestination = async (destinationData) => {
    try {
      await destinationAPI.create(projectId, destinationData)
      toast.success('Destination ajoutée avec succès!')
      await loadExchangeData()
      setShowAddDestination(false)
    } catch (err) {
      console.error('Error adding destination:', err)
      toast.error(err.response?.data?.detail || 'Erreur lors de l\'ajout')
    }
  }

  const handleDeleteProject = async () => {
    try {
      await projectAPI.delete(projectId)
      setSuccess('Projet supprimé avec succès')
      setTimeout(() => {
        navigate('/teacher')
      }, 1500)
    } catch (err) {
      console.error('Error deleting project:', err)
      setError('Erreur lors de la suppression du projet')
      setDeleteModal(false)
    }
  }

  const handleUploadMoreStudents = async (newStudents) => {
    try {
      if (newStudents && newStudents.length > 0) {
        await projectAPI.uploadStudents(projectId, newStudents);
        setSuccess(`${newStudents.length} étudiant(s) ajouté(s) avec succès`);
        
        const studentsResponse = await projectAPI.getStudents(projectId);
        setStudents(studentsResponse.data || []);
        
        setShowUploadStudents(false);
      }
    } catch (err) {
      console.error('Error updating students:', err)
      setError('Erreur lors de la mise à jour des étudiants')
    }
  }

  const handleRemoveStudentClick = (student) => {
    setRemoveStudentModal({
      isOpen: true,
      studentId: student.id,
      studentName: student.name
    })
  }

  const handleRemoveStudentConfirm = async () => {
    try {
      await projectAPI.removeStudent(projectId, removeStudentModal.studentId)
      setSuccess(`Étudiant "${removeStudentModal.studentName}" retiré avec succès`)
      setStudents(students.filter(s => s.id !== removeStudentModal.studentId))
      setRemoveStudentModal({ isOpen: false, studentId: null, studentName: '' })
    } catch (err) {
      console.error('Error removing student:', err)
      setError('Erreur lors du retrait de l\'étudiant')
      setRemoveStudentModal({ isOpen: false, studentId: null, studentName: '' })
    }
  }

  const handleRemoveStudentCancel = () => {
    setRemoveStudentModal({ isOpen: false, studentId: null, studentName: '' })
  }

  // Group assignments by group_number (for non-exchange projects)
  const groupedAssignments = {}
  assignments.forEach(assignment => {
    const groupNum = assignment.group_number || 0
    if (!groupedAssignments[groupNum]) {
      groupedAssignments[groupNum] = []
    }
    groupedAssignments[groupNum].push(assignment)
  })

  if (loading) {
    return <Loading text="Chargement des détails du projet..." />
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <CardSimple>
            <div className="text-center py-12">
              <h3 className="text-xl font-bold text-gray-700 mb-2">Erreur</h3>
              <p className="text-gray-600 mb-6">{error || 'Projet introuvable'}</p>
              <Button onClick={() => navigate('/projects')}>
                ← Retour aux projets
              </Button>
            </div>
          </CardSimple>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center fade-in">
          <Button variant="outline" onClick={() => navigate('/projects')}>
            ← Retour aux projets
          </Button>
          
          {isTeacher && (
            <div className="flex gap-3 flex-wrap">
              <Button
                variant="outline"
                onClick={() => setShowUploadStudents(!showUploadStudents)}
              >
                Ajouter des Étudiants
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/teacher/edit-project/${projectId}`)}
              >
                Modifier
              </Button>
              <Button
                variant="danger"
                onClick={() => setDeleteModal(true)}
              >
                Supprimer
              </Button>
            </div>
          )}
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} className="mb-4" />}

        {/* CSV Upload Section */}
        {isTeacher && showUploadStudents && (
          <CardSimple className="mb-6 bg-blue-50 border-2 border-blue-200 fade-in-delay-2">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Ajouter des Étudiants au Projet
            </h3>
            <CSVUploader
              projectId={projectId}
              onUploadSuccess={handleUploadMoreStudents}
            />
          </CardSimple>
        )}

        {/* Project Information */}
        <CardSimple className="mb-6 fade-in-delay-1">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {project.title}
              </h1>
              <p className="text-blue-600 font-semibold">
                Enseignant: {project.teacher?.first_name} {project.teacher?.last_name}
              </p>
              {project.deadline && (
                <p className="text-orange-600 font-medium mt-1">
                  Date limite: {new Date(project.deadline).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {project.is_active ? (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  Actif
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                  Inactif
                </span>
              )}
              {project.project_type && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getProjectTypeColor(project.project_type)}`}>
                  {translateProjectType(project.project_type)}
                </span>
              )}
              {isExchangeProgram && project.is_open_for_preferences !== undefined && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${project.is_open_for_preferences ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                  {project.is_open_for_preferences ? 'Préférences ouvertes' : 'Préférences fermées'}
                </span>
              )}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600">{project.description}</p>
          </div>

          {/* Exchange Program Info Box */}
          {isExchangeProgram && (
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded mb-4">
              <h3 className="font-bold text-purple-800 mb-2">Programme d'Échange</h3>
              <p className="text-sm text-purple-700">
                Les étudiants seront affectés individuellement aux universités partenaires selon leurs préférences (grades A-F).
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <p className="text-sm text-gray-600">Étudiants inscrits</p>
              <p className="text-2xl font-bold text-blue-600">
                {students.length}
              </p>
            </div>
            {!isExchangeProgram && (
              <>
                <div>
                  <p className="text-sm text-gray-600">Taille min. groupe</p>
                  <p className="text-2xl font-bold text-gray-800">{project.min_students}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Taille max. groupe</p>
                  <p className="text-2xl font-bold text-gray-800">{project.max_students}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Groupes formés</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {Object.keys(groupedAssignments).length || 0}
                  </p>
                </div>
              </>
            )}
            {isExchangeProgram && (
              <>
                <div>
                  <p className="text-sm text-gray-600">Universités</p>
                  <p className="text-2xl font-bold text-purple-600">{destinations.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Places totales</p>
                  <p className="text-2xl font-bold text-green-600">
                    {destinations.reduce((sum, d) => sum + (d.total_places || 0), 0)}
                  </p>
                </div>
              </>
            )}
          </div>
        </CardSimple>

        {/* EXCHANGE PROGRAM CONTROLS */}
        {isExchangeProgram && isTeacher && (
          <div className="mb-6 fade-in-delay-2">
            {/* Control Panel */}
            <CardSimple className="mb-4 bg-gradient-to-r from-purple-50 to-blue-50">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Panneau de Contrôle du Programme d'Échange
              </h2>
              
              <div className="flex flex-wrap gap-3">
                {/* Launch Button */}
                {!project.is_open_for_preferences && destinations.length > 0 && (
                  <Button
                    variant="primary"
                    onClick={handleLaunchExchange}
                    disabled={isLaunching}
                  >
                    {isLaunching ? 'Lancement...' : 'Lancer le Programme'}
                  </Button>
                )}
                
                {/* Close Preferences Button */}
                {project.is_open_for_preferences && (
                  <Button
                    variant="warning"
                    onClick={handleClosePreferences}
                    disabled={isClosing}
                  >
                    {isClosing ? 'Clôture...' : 'Clôturer les Préférences'}
                  </Button>
                )}
                
                {/* Optimization Buttons - only show if no assignments yet */}
                {console.log('[FRONTEND] Button check:', {is_open: project.is_open_for_preferences, students: students.length, assignments: assignments.length})}
                {!project.is_open_for_preferences && students.length > 0 && assignments.length === 0 && (
                  <>
                    <Button
                      variant="success"
                      onClick={() => handleRunOptimization('greedy')}
                      disabled={isOptimizing}
                    >
                      {isOptimizing ? 'Optimisation...' : 'Algorithme Rapide'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRunOptimization('genetic')}
                      disabled={isOptimizing}
                    >
                      Algorithme Avancé
                    </Button>
                  </>
                )}
                
                {/* Show message if assignments already exist */}
                {assignments.length > 0 && (
                  <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                    ✓ Affectations créées ({assignments.length} étudiants)
                  </div>
                )}
              </div>
            </CardSimple>

            {/* Exchange Statistics */}
            {exchangeStats?.statistics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <CardSimple className="text-center bg-white">
                  <div className="text-3xl font-bold text-purple-600">
                    {exchangeStats.statistics.students_completed_preferences}
                  </div>
                  <div className="text-sm text-gray-600">Préférences complétées</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {exchangeStats.statistics.completion_rate.toFixed(1)}% des étudiants
                  </div>
                </CardSimple>
                
                <CardSimple className="text-center bg-white">
                  <div className="text-3xl font-bold text-blue-600">
                    {exchangeStats.statistics.total_destinations}
                  </div>
                  <div className="text-sm text-gray-600">Universités partenaires</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {exchangeStats.statistics.total_available_places} places disponibles
                  </div>
                </CardSimple>
                
                <CardSimple className="text-center bg-white">
                  <div className="text-3xl font-bold text-green-600">
                    A: {exchangeStats.statistics.grade_distribution?.A || 0}
                  </div>
                  <div className="text-sm text-gray-600">Préférences "A" (meilleures)</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Distribution: A:{exchangeStats.statistics.grade_distribution?.A || 0} 
                    B:{exchangeStats.statistics.grade_distribution?.B || 0}
                    C:{exchangeStats.statistics.grade_distribution?.C || 0}...
                  </div>
                </CardSimple>
              </div>
            )}

            {/* Students Preferences Status */}
            {studentsStatus?.students && (
              <CardSimple className="mb-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Statut des Préférences des Étudiants
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">Étudiant</th>
                        <th className="px-4 py-2 text-left">Filière</th>
                        <th className="px-4 py-2 text-center">Préférences</th>
                        <th className="px-4 py-2 text-center">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsStatus.students.map((student) => (
                        <tr key={student.student_id} className="border-b">
                          <td className="px-4 py-2">
                            <div className="font-medium">{student.student_name}</div>
                            <div className="text-xs text-gray-500">{student.email}</div>
                          </td>
                          <td className="px-4 py-2">{student.filiere || '-'}</td>
                          <td className="px-4 py-2 text-center">
                            {student.filled_preferences}/{student.total_destinations}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {student.is_complete ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                Complet
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                Incomplet
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardSimple>
            )}

            {/* Optimization Results */}
            {optimizationResult && optimizationResult.success && (
              <CardSimple className="mb-4 bg-green-50 border-2 border-green-200">
                <h3 className="text-lg font-bold text-green-800 mb-4">
                  Résultats de l'Optimisation
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {optimizationResult.statistics.assignment_rate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">Taux d'affectation</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {optimizationResult.statistics.satisfaction_rate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">Taux de satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {optimizationResult.statistics.average_preference_score.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-600">Score moyen</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {optimizationResult.statistics.efficiency}%
                    </div>
                    <div className="text-xs text-gray-600">Efficacité</div>
                  </div>
                </div>
                
                <h4 className="font-bold text-gray-800 mb-2">Répartition des Grades:</h4>
                <div className="flex gap-2 mb-4">
                  {Object.entries(optimizationResult.statistics.grade_distribution).map(([grade, count]) => (
                    <div key={grade} className="flex-1 text-center p-2 bg-white rounded">
                      <div className="text-xl font-bold">{grade}</div>
                      <div className="text-sm text-gray-600">{count}</div>
                    </div>
                  ))}
                </div>

                {/* Assignments List */}
                <h4 className="font-bold text-gray-800 mb-2">Affectations:</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {optimizationResult.assignments.map((assignment, idx) => (
                    <div key={idx} className="p-3 bg-white rounded flex justify-between items-center">
                      <div>
                        <span className="font-medium">{assignment.student_name}</span>
                        <span className="text-gray-500 text-sm ml-2">→</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-purple-700">{assignment.destination_name}</span>
                        {assignment.grade && (
                          <span className="ml-2 px-2 py-0.5 bg-gray-200 rounded text-xs">
                            Grade {assignment.grade}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardSimple>
            )}
          </div>
        )}

        {/* EXCHANGE PROGRAM ASSIGNMENTS FROM DATABASE (persist after refresh) */}
        {isExchangeProgram && isTeacher && assignments.length > 0 && (
          <div className="mb-6 fade-in-delay-3">
            <CardSimple className="bg-white">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Affectations des Étudiants ({assignments.length})
              </h2>
              {console.log('[FRONTEND] Rendering exchange assignments:', assignments)}
              <div className="space-y-2">
                {assignments.map((assignment, idx) => {
                  console.log('[FRONTEND] Assignment', idx, ':', assignment)
                  const student = students.find(s => s.id === assignment.student_id)
                  return (
                    <div 
                      key={assignment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                          {student?.name?.[0] || '?'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">
                            {student?.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student?.email}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold text-purple-700">
                          {assignment.destination?.university_name || 'Non assigné'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {assignment.destination?.city}, {assignment.destination?.country}
                        </div>
                        {assignment.grade && (
                          <span className="mt-1 inline-block px-2 py-0.5 bg-gray-200 rounded text-xs">
                            Grade {assignment.grade}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardSimple>
          </div>
        )}

        {/* GROUP PROJECT CONTROLS */}
        {isGroupProject && isTeacher && (
          <div className="mb-6 fade-in-delay-2">
            {/* Control Panel */}
            <CardSimple className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Panneau de Contrôle du Projet de Groupe
              </h2>
              
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  onClick={handleRunAlgorithm}
                  disabled={isOptimizing || students.length === 0}
                  title={students.length === 0 ? "Aucun étudiant inscrit" : "Lancer l'algorithme de formation des groupes"}
                >
                  {isOptimizing ? 'Optimisation en cours...' : `Lancer l\'Algorithme de Groupes (${students.length} étudiants)`}
                </Button>
                {assignments.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes les affectations ?')) {
                        assignmentAPI.deleteByProject(projectId)
                          .then(() => {
                            toast.success('Affectations supprimées')
                            loadProjectDetails()
                          })
                          .catch(err => toast.error('Erreur lors de la suppression'))
                      }
                    }}
                  >
                    🗑️ Supprimer les affectations
                  </Button>
                )}
              </div>
            </CardSimple>

            {/* Group Preferences Statistics */}
            {groupPreferences && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <CardSimple className="text-center bg-white">
                  <div className="text-3xl font-bold text-blue-600">
                    {groupPreferences.total_preferences || 0}
                  </div>
                  <div className="text-sm text-gray-600">Préférences soumises</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {((groupPreferences.total_preferences / students.length) * 100).toFixed(1)}% des étudiants
                  </div>
                </CardSimple>
                
                <CardSimple className="text-center bg-white">
                  <div className="text-3xl font-bold text-green-600">
                    {groupPreferences.mutual_matches_count || 0}
                  </div>
                  <div className="text-sm text-gray-600">Matches mutuels</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Paires d\'étudiants s\'étant choisis
                  </div>
                </CardSimple>
                
                <CardSimple className="text-center bg-white">
                  <div className="text-3xl font-bold text-orange-600">
                    {students.length - (groupPreferences.students_with_preferences || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Sans préférences</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Étudiants à assigner
                  </div>
                </CardSimple>
              </div>
            )}

            {/* Partner Preferences Table */}
            {groupPreferences?.preferences && groupPreferences.preferences.length > 0 && (
              <CardSimple className="mb-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Préférences des Partenaires
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">Étudiant</th>
                        <th className="px-4 py-2 text-left">Partenaire choisi</th>
                        <th className="px-4 py-2 text-center">Réciproque?</th>
                        <th className="px-4 py-2 text-center">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupPreferences.preferences.map((pref, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="px-4 py-2">
                            <div className="font-medium">{pref.student_name}</div>
                            <div className="text-xs text-gray-500">{pref.student_email}</div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="font-medium">{pref.partner_name}</div>
                            <div className="text-xs text-gray-500">{pref.partner_email}</div>
                          </td>
                          <td className="px-4 py-2 text-center">
                            {pref.is_mutual ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                ✓ Match mutuel
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                En attente
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {pref.is_assigned ? (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                Assigné
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                En attente
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardSimple>
            )}

            {/* Students without preferences */}
            {groupPreferences?.students_without_preferences && groupPreferences.students_without_preferences.length > 0 && (
              <CardSimple className="mb-4 bg-orange-50 border-2 border-orange-200">
                <h3 className="text-lg font-bold text-orange-800 mb-4">
                  Étudiants sans Préférences ({groupPreferences.students_without_preferences.length})
                </h3>
                <div className="max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {groupPreferences.students_without_preferences.map((student, idx) => (
                      <div key={idx} className="p-2 bg-white rounded flex justify-between items-center">
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-xs text-gray-500">{student.email}</div>
                        </div>
                        {student.filiere && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {student.filiere}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardSimple>
            )}
          </div>
        )}

        {/* ENGLISH LEVELING CONTROLS */}
        {isEnglishLeveling && isTeacher && (
          <div className="mb-6 fade-in-delay-2">
            {/* Control Panel */}
            <CardSimple className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Panneau de Contrôle du Niveau d'Anglais
              </h2>
              
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  onClick={handleRunAlgorithm}
                  disabled={isOptimizing || students.length === 0}
                >
                  {isOptimizing ? 'Optimisation en cours...' : 'Lancer l\'Algorithme de Niveau'}
                </Button>
                {assignments.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes les affectations ?')) {
                        assignmentAPI.deleteByProject(projectId)
                          .then(() => {
                            toast.success('Affectations supprimées')
                            loadProjectDetails()
                          })
                          .catch(err => toast.error('Erreur lors de la suppression'))
                      }
                    }}
                  >
                    🗑️ Supprimer les affectations
                  </Button>
                )}
              </div>
            </CardSimple>

            {/* English Level Distribution */}
            {englishLevelStats && (
              <CardSimple className="mb-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Distribution des Niveaux d'Anglais
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-7 gap-3 mb-4">
                  {['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'unknown'].map((level) => (
                    <div key={level} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${
                        level === 'unknown' ? 'text-gray-500' :
                        level.startsWith('A') ? 'text-red-600' :
                        level.startsWith('B') ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {englishLevelStats[level]}
                      </div>
                      <div className="text-xs text-gray-600">{level === 'unknown' ? 'Inconnu' : level}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {((englishLevelStats[level] / students.length) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Visual bar chart */}
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Répartition visuelle:</h4>
                  <div className="space-y-2">
                    {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => {
                      const count = englishLevelStats[level]
                      const percentage = students.length > 0 ? (count / students.length) * 100 : 0
                      return (
                        <div key={level} className="flex items-center gap-2">
                          <div className="w-12 text-sm font-medium text-gray-700">{level}</div>
                          <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                level.startsWith('A') ? 'bg-red-500' :
                                level.startsWith('B') ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="w-16 text-sm text-gray-600 text-right">{count} élèves</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardSimple>
            )}

            {/* Students by English Level */}
            <CardSimple className="mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Étudiants par Niveau d'Anglais
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Étudiant</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-center">Filière</th>
                      <th className="px-4 py-2 text-center">Niveau d'anglais</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-b">
                        <td className="px-4 py-2">
                          <div className="font-medium">{student.name}</div>
                        </td>
                        <td className="px-4 py-2 text-gray-600">{student.email}</td>
                        <td className="px-4 py-2 text-center">{student.filiere || '-'}</td>
                        <td className="px-4 py-2 text-center">
                          {student.english_level ? (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              student.english_level.startsWith('A') ? 'bg-red-100 text-red-800' :
                              student.english_level.startsWith('B') ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {student.english_level}
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              Non défini
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardSimple>
          </div>
        )}

        {/* DESTINATIONS SECTION - Always visible for exchange programs */}
        {isExchangeProgram && (
          <CardSimple className="mb-6 fade-in-delay-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Universités Partenaires ({destinations.length})
              </h2>
              {isTeacher && !showAddDestination && (
                <Button
                  variant="primary"
                  onClick={() => setShowAddDestination(true)}
                >
                  Ajouter une Destination
                </Button>
              )}
            </div>

            {destinations.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-4">
                  Aucune université n'a été ajoutée à ce programme d'échange.
                </p>
                {isTeacher && !showAddDestination && (
                  <p className="text-sm text-gray-500">
                    Cliquez sur "Ajouter une Destination" pour commencer.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {destinations.map((dest) => (
                  <div key={dest.id} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-800">{dest.university_name}</h3>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
                        {dest.mobility_type}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      {dest.city}, {dest.country}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-blue-50 p-2 rounded">
                        <span className="text-gray-600">Places:</span>
                        <span className="font-bold text-blue-700 ml-1">
                          {dest.available_places}/{dest.total_places}
                        </span>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <span className="text-gray-600">Filères:</span>
                        <span className="font-bold text-green-700 ml-1 truncate">
                          {dest.accepted_filieres}
                        </span>
                      </div>
                    </div>
                    {dest.min_english_level && (
                      <p className="text-xs text-gray-500 mt-2">
                        Anglais minimum: {dest.min_english_level}
                      </p>
                    )}
                    {dest.min_gpa && (
                      <p className="text-xs text-gray-500">
                        GPA minimum: {dest.min_gpa}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* CSV Upload for Destinations */}
            {isTeacher && showAddDestination && (
              <div className="mt-6 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Ajouter des Destinations
                </h3>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Format CSV:</strong> university_name, country, city, total_places, mobility_type, accepted_filieres, min_english_level, min_gpa
                  </p>
                </div>
                <CSVUploader
                  type="destinations"
                  projectId={projectId}
                  onUploadSuccess={async (destinations) => {
                    toast.success(`${destinations.length} destination(s) ajoutée(s)`)
                    await loadExchangeData()
                    setShowAddDestination(false)
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => setShowAddDestination(false)}
                  className="mt-4"
                >
                  Annuler
                </Button>
              </div>
            )}
          </CardSimple>
        )}

        {/* Statistics (for non-exchange projects) */}
        {!isExchangeProgram && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 fade-in-delay-2">
            <CardSimple className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.total_groups}</div>
              <div className="text-sm text-gray-600">Groupes créés</div>
            </CardSimple>
            
            <CardSimple className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.total_assignments}</div>
              <div className="text-sm text-gray-600">Étudiants assignés</div>
            </CardSimple>
            
            <CardSimple className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.satisfaction_rate?.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Taux de satisfaction</div>
            </CardSimple>
            
            <CardSimple className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.average_group_size?.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Taille moyenne</div>
            </CardSimple>
          </div>
        )}

        {/* SINGLE Students List - Only one now */}
        {students.length > 0 && (
          <CardSimple className="mb-6 fade-in-delay-3">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Étudiants Inscrits ({students.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {students.map((student, idx) => (
                <div
                  key={student.id || idx}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 truncate">{student.name}</p>
                      <p className="text-sm text-gray-600 truncate">{student.email}</p>
                      {student.filiere && (
                        <span className="inline-block mt-2 px-2 py-1 bg-blue-600 text-white rounded text-xs">
                          {student.filiere}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {student.rank && (
                        <span className="text-xs font-semibold text-purple-600">
                          #{student.rank}
                        </span>
                      )}
                      {isTeacher && (
                        <button
                          onClick={() => handleRemoveStudentClick(student)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded p-1 transition-colors"
                          title="Retirer l'étudiant"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardSimple>
        )}

        {/* Groups Display (for non-exchange projects) */}
        {!isExchangeProgram && assignments.length > 0 && (
          <div className="space-y-4 fade-in-delay-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Groupes formés ({Object.keys(groupedAssignments).length})
            </h2>
            
            {Object.keys(groupedAssignments)
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map(groupNum => (
                <CardSimple key={groupNum} className="bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-blue-600">
                      Groupe {groupNum}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {groupedAssignments[groupNum].length} étudiant(s)
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {groupedAssignments[groupNum].map(assignment => {
                      const student = students.find(s => s.id === assignment.student_id)
                      
                      return (
                        <div 
                          key={assignment.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                              {student?.name?.[0]}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">
                                {student?.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {student?.email}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            {assignment.satisfaction_score && (
                              <div className="text-sm font-medium text-gray-700">
                                Satisfaction: {assignment.satisfaction_score}/10
                              </div>
                            )}
                            {assignment.preference_rank && (
                              <div className="text-sm text-green-600">
                                Préférence #{assignment.preference_rank}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardSimple>
              ))}
          </div>
        )}

        {/* Empty State */}
        {students.length === 0 && (
          <CardSimple className="text-center py-12 fade-in-delay-3">
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Aucun étudiant inscrit
            </h3>
            <p className="text-gray-600">
              Aucun étudiant n'est encore inscrit à ce projet.
            </p>
          </CardSimple>
        )}

        {/* Delete Project Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal}
          title="Supprimer le Projet"
          message={`Êtes-vous sûr de vouloir supprimer le projet "${project?.title}" ? Cette action est irréversible et supprimera tous les étudiants et affectations associés.`}
          confirmText="Supprimer"
          cancelText="Annuler"
          variant="danger"
          onConfirm={handleDeleteProject}
          onCancel={() => setDeleteModal(false)}
        />

        {/* Remove Student Confirmation Modal */}
        <ConfirmModal
          isOpen={removeStudentModal.isOpen}
          title="Retirer l'Étudiant"
          message={`Êtes-vous sûr de vouloir retirer "${removeStudentModal.studentName}" de ce projet ?`}
          confirmText="Retirer"
          cancelText="Annuler"
          variant="warning"
          onConfirm={handleRemoveStudentConfirm}
          onCancel={handleRemoveStudentCancel}
        />
      </div>
    </div>
  )
}
