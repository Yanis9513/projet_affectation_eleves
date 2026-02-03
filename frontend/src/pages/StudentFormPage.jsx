import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { Select } from '../components/Input'
import { Alert, Loading } from '../components/Loading'
import { projectAPI, preferenceAPI, studentAPI } from '../services/api'

// SVG Icons
const CheckCircleIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const InfoIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
)

const SendIcon = () => (
  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
)

export default function StudentFormPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [project, setProject] = useState(null)
  const [students, setStudents] = useState([])
  const [preference, setPreference] = useState({
    partnerId: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadProjectData()
  }, [projectId])

  const loadProjectData = async () => {
    setLoading(true)
    try {
      // Load project details
      const projectResponse = await projectAPI.getById(projectId)
      setProject({
        id: projectResponse.data.id,
        name: projectResponse.data.title,
        description: projectResponse.data.description,
        type: projectResponse.data.project_type,
        groupSize: projectResponse.data.group_size,
        partnerPreferenceEnabled: projectResponse.data.partner_preference_enabled,
        teacher: `Teacher #${projectResponse.data.teacher_id}` // Simplified - teacher relationship not loaded
      })

      // Load students for this project
      const studentsResponse = await projectAPI.getStudents(projectId)
      setStudents(studentsResponse.data)

    } catch (err) {
      console.error('Error loading project:', err)
      setError('Impossible de charger les détails du projet.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      let currentUser = {}
      try {
        currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      } catch (e) {
        console.error('Error parsing user from localStorage:', e)
      }
      let studentId = currentUser?.student_id
      
      // If student_id not in localStorage, fetch from API
      if (!studentId) {
        try {
          const profileResponse = await studentAPI.getProfile()
          studentId = profileResponse.data?.id
          
          // Update localStorage with student_id for future requests
          if (studentId) {
            currentUser.student_id = studentId
            localStorage.setItem('user', JSON.stringify(currentUser))
          }
        } catch (profileErr) {
          console.error('Error fetching student profile:', profileErr)
        }
      }
      
      if (!studentId) {
        throw new Error('Étudiant non identifié. Veuillez vous reconnecter.')
      }
      
      const preferenceData = {
        project_id: parseInt(projectId),
        preferred_partner_id: preference.partnerId ? parseInt(preference.partnerId) : null,
        rank: 1
      }
      
      await preferenceAPI.submitPartnerPreference(studentId, preferenceData)
      
      setSuccess(true)

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/student')
      }, 2000)

    } catch (err) {
      console.error('Error submitting preference:', err)
      setError(err.response?.data?.detail || err.message || 'Erreur lors de l\'envoi des préférences')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Loading text="Chargement du formulaire..." />
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center animate-fade-in shadow-sm">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4">
              <CheckCircleIcon />
            </div>
            <h2 className="text-2xl font-bold text-emerald-600 mb-4">
              Préférences Envoyées !
            </h2>
            <p className="text-slate-600 mb-6">
              Vos préférences ont été enregistrées avec succès.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/student')}
            >
              Retour au Tableau de Bord
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Alert
            type="error"
            title="Projet introuvable"
            message="Le projet demandé n'existe pas ou vous n'y avez pas accès."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Formulaire de Préférences
          </h1>
          <p className="text-slate-600">
            {project.name}
          </p>
        </div>

        {/* Project Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mb-6 fade-in-delay-1">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <InfoIcon />
            </div>
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Informations du Projet</h3>
              <p className="text-sm text-slate-700 mb-2">
                <strong>Description:</strong> {project.description}
              </p>
              <p className="text-sm text-slate-700 mb-2">
                <strong>Enseignant:</strong> {project.teacher}
              </p>
              <p className="text-sm text-slate-700">
                <strong>Taille des groupes:</strong> {project.groupSize} étudiants par groupe
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError('')}
            className="mb-6"
          />
        )}

        {/* Preference Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm fade-in-delay-2">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Vos Préférences
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {project.partnerPreferenceEnabled && (
              <>
                <Alert
                  type="info"
                  title="Préférence de Partenaire (Optionnel)"
                  message="Vous pouvez indiquer avec qui vous souhaitez travailler. Cette préférence sera prise en compte dans la mesure du possible, mais n'est pas garantie."
                />

                <Select
                  label="Souhaitez-vous travailler avec quelqu'un en particulier ?"
                  name="partnerId"
                  value={preference.partnerId}
                  onChange={(e) => setPreference({ ...preference, partnerId: e.target.value })}
                  options={[
                    { value: '', label: 'Aucune préférence' },
                    ...students.map(student => ({
                      value: student.id.toString(),
                      label: `${student.name} (${student.email})`
                    }))
                  ]}
                  helperText="Si vous ne choisissez personne, l'algorithme vous assignera automatiquement à un groupe"
                />

                {preference.partnerId && (
                  <Alert
                    type="warning"
                    message="Important: L'algorithme tentera de vous grouper avec cette personne, mais cela dépend aussi de sa préférence et des contraintes du projet."
                  />
                )}
              </>
            )}

            {!project.partnerPreferenceEnabled && (
              <Alert
                type="info"
                message="Les préférences de partenaire ne sont pas activées pour ce projet. Les groupes seront formés automatiquement."
              />
            )}

            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-bold text-slate-800 mb-2">📌 Rappel Important</h3>
              <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                <li>Les groupes de {project.groupSize} étudiants seront formés automatiquement</li>
                <li>Vos préférences sont prises en compte mais non garanties</li>
                <li>L'équilibre des groupes est prioritaire</li>
                <li>Vous recevrez la composition finale de votre groupe par email</li>
              </ul>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/student')}
              >
                Annuler
              </Button>
              
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
              >
                <SendIcon />
                {submitting ? 'Envoi en cours...' : 'Envoyer mes Préférences'}
              </Button>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mt-6 fade-in-delay-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Besoin d'aide ?</h3>
              <p className="text-sm text-slate-600">
                Si vous avez des questions sur ce projet ou si vous rencontrez un problème, 
                contactez votre enseignant: <strong className="text-slate-900">{project.teacher}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
