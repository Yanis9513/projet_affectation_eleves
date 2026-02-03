import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { CardSimple } from '../components/Card'
import { Select } from '../components/Input'
import { Alert, Loading } from '../components/Loading'
import { projectAPI, preferenceAPI, studentAPI } from '../services/api'

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
      let currentUser = JSON.parse(localStorage.getItem('user'))
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Loading text="Chargement du formulaire..." />
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <CardSimple className="text-center fade-in">
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Préférences Envoyées !
            </h2>
            <p className="text-gray-600 mb-6">
              Vos préférences ont été enregistrées avec succès.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/student')}
            >
              Retour au Tableau de Bord
            </Button>
          </CardSimple>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-8 fade-in">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Formulaire de Préférences
          </h1>
          <p className="text-gray-600">
            {project.name}
          </p>
        </div>

        {/* Project Info */}
        <CardSimple className="mb-6 bg-blue-50 border-l-4 border-esiee-blue fade-in-delay-1">
          <h3 className="font-bold text-esiee-blue mb-2">Informations du Projet</h3>
          <p className="text-sm text-gray-700 mb-2">
            <strong>Description:</strong> {project.description}
          </p>
          <p className="text-sm text-gray-700 mb-2">
            <strong>Enseignant:</strong> {project.teacher}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Taille des groupes:</strong> {project.groupSize} étudiants par groupe
          </p>
        </CardSimple>

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
        <CardSimple className="fade-in-delay-2">
          <h2 className="text-2xl font-bold text-esiee-blue mb-6">
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

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-2">📌 Rappel Important</h3>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
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
                {submitting ? 'Envoi en cours...' : 'Envoyer mes Préférences'}
              </Button>
            </div>
          </form>
        </CardSimple>

        {/* Help Section */}
        <CardSimple className="mt-6 fade-in-delay-3">
          <h3 className="font-bold text-gray-800 mb-3">❓ Besoin d'aide ?</h3>
          <p className="text-sm text-gray-600 mb-2">
            Si vous avez des questions sur ce projet ou si vous rencontrez un problème, 
            contactez votre enseignant: <strong>{project.teacher}</strong>
          </p>
        </CardSimple>
      </div>
    </div>
  )
}
