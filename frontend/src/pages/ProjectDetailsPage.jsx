import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CardSimple } from '../components/Card'
import Button from '../components/Button'
import { Loading, Alert } from '../components/Loading'
import ConfirmModal from '../components/ConfirmModal'
import CSVUploader from '../components/CSVUploader'
import { projectAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

// Fonction de traduction pour les types de projet
const translateProjectType = (type) => {
  const translations = {
    'group_project': 'Projet de groupe',
    'english_leveling': 'Niveau d\'anglais',
    'exchange_program': 'Programme d\'échange'
  }
  return translations[type] || type
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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

  useEffect(() => {
    loadProjectDetails()
  }, [projectId])

  const loadProjectDetails = async () => {
    try {
      // Load project details
      const projectResponse = await projectAPI.getById(projectId)
      setProject(projectResponse.data)

      // Load students enrolled in this project
      const studentsResponse = await axios.get(`${API_BASE_URL}/api/projects/${projectId}/students`)
      setStudents(studentsResponse.data || [])

      // Try to load assignments/groups if they exist
      try {
        const assignmentsResponse = await axios.get(`${API_BASE_URL}/api/assignments/?project_id=${projectId}`)
        if (assignmentsResponse.data && assignmentsResponse.data.length > 0) {
          setAssignments(assignmentsResponse.data)

          // Load stats
          const statsResponse = await axios.get(`${API_BASE_URL}/api/assignments/stats?project_id=${projectId}`)
          setStats(statsResponse.data)
        }
      } catch (err) {
        // No assignments yet, that's okay
        console.log('No assignments yet for this project')
      }
    } catch (err) {
      console.error('Error loading project details:', err)
      setError('Erreur lors du chargement des détails du projet')
    } finally {
      setLoading(false)
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
      await projectAPI.uploadStudents(projectId, newStudents)
      setSuccess(`${newStudents.length} étudiant(s) ajouté(s) avec succès`)
      setShowUploadStudents(false)
      // Reload students
      const studentsResponse = await axios.get(`${API_BASE_URL}/api/projects/${projectId}/students`)
      setStudents(studentsResponse.data || [])
    } catch (err) {
      console.error('Error uploading students:', err)
      setError('Erreur lors de l\'ajout des étudiants')
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
      // Remove from local state
      setStudents(students.filter(s => s.id !== removeStudentModal.studentId))
      setRemoveStudentModal({ isOpen: false, studentId: null, studentName: '' })
    } catch (err) {
      console.error('Error removing student:', err)
      setError('Erreur lors du retrait de l\'\u00e9tudiant')
      setRemoveStudentModal({ isOpen: false, studentId: null, studentName: '' })
    }
  }

  const handleRemoveStudentCancel = () => {
    setRemoveStudentModal({ isOpen: false, studentId: null, studentName: '' })
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

  const isTeacher = userRole === 'teacher'

  if (loading) {
    return <Loading text="Chargement des détails du projet..." />
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <CardSimple>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">❌</div>
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
        <div className="mb-6 flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate('/projects')}>
            ← Retour aux projets
          </Button>
          
          {isTeacher && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowUploadStudents(!showUploadStudents)}
              >
                ➕ Ajouter des Étudiants
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/teacher/edit-project/${projectId}`)}
              >
                ✏️ Modifier
              </Button>
              <Button
                variant="danger"
                onClick={() => setDeleteModal(true)}
              >
                🗑️ Supprimer
              </Button>
            </div>
          )}
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} className="mb-4" />}

        {/* CSV Upload Section */}
        {isTeacher && showUploadStudents && (
          <CardSimple className="mb-6 bg-blue-50 border-2 border-blue-200">
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
        <CardSimple className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {project.title}
              </h1>
              <p className="text-esiee-blue font-semibold">
                👨‍🏫 Enseignant: {project.teacher?.first_name} {project.teacher?.last_name}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {project.is_active ? (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  ✓ Actif
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                  ✗ Inactif
                </span>
              )}
              {project.project_type && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-esiee-blue text-white">
                  {translateProjectType(project.project_type)}
                </span>
              )}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600">{project.description}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <p className="text-sm text-gray-600">Étudiants inscrits</p>
              <p className="text-2xl font-bold text-esiee-blue">
                {students.length} / {project.max_students}
              </p>
            </div>
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
          </div>
        </CardSimple>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

        {/* Students List */}
        {students.length > 0 && (
          <CardSimple className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🎓 Étudiants Inscrits ({students.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {students.map((student, idx) => (
                <div
                  key={student.id || idx}
                  className="bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-lg p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 truncate">{student.name}</p>
                      <p className="text-sm text-gray-600 truncate">{student.email}</p>
                      {student.filiere && (
                        <span className="inline-block mt-2 px-2 py-1 bg-esiee-blue text-white rounded text-xs">
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

        {/* Groups Display */}
        {assignments.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              👥 Groupes formés ({Object.keys(groupedAssignments).length})
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
                    {groupedAssignments[groupNum].map(assignment => {
                      // Find student info
                      const student = students.find(s => s.id === assignment.student_id)
                      
                      return (
                        <div 
                          key={assignment.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-esiee-blue text-white flex items-center justify-center font-bold">
                              {student?.user?.first_name?.[0]}{student?.user?.last_name?.[0]}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">
                                {student?.user?.first_name} {student?.user?.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {student?.user?.email}
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
                                ✓ Préférence #{assignment.preference_rank}
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
        ) : students.length > 0 ? (
          <CardSimple>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Étudiants inscrits ({students.length})
            </h2>
            <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
              {students.map(student => {
                // Get initials from name
                const nameParts = (student.name || '').split(' ')
                const initials = nameParts.length >= 2 
                  ? `${nameParts[0][0]}${nameParts[nameParts.length-1][0]}`
                  : (student.name?.[0] || '?')
                
                return (
                  <div 
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-esiee-blue text-white flex items-center justify-center font-bold text-sm">
                        {initials.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">
                          {student.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.email}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      {student.filiere && (
                        <div className="text-gray-600">
                          {student.filiere}
                        </div>
                      )}
                      {student.rank && (
                        <div className="text-esiee-blue font-semibold">
                          Rang: {student.rank}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-6 text-center text-gray-600 pt-4 border-t">
              <p>Les groupes n'ont pas encore été formés pour ce projet.</p>
            </div>
          </CardSimple>
        ) : (
          <CardSimple className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
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
