import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Button from '../components/Button'
import { CardSimple } from '../components/Card'
import { TextInput } from '../components/Input'
import { SkeletonCard } from '../components/Skeleton'
import { projectAPI, preferenceAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

function PreferencesPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [preferences, setPreferences] = useState([])
  const [partnerEmail, setPartnerEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load available projects
      const projectsResponse = await projectAPI.getAll()
      const availableProjects = projectsResponse.data.filter(
        p => p.is_active && p.is_open_for_preferences
      )
      setProjects(availableProjects)

      // Load existing preferences if user is logged in
      const currentUser = JSON.parse(localStorage.getItem('user'))
      if (currentUser?.id) {
        try {
          const prefsResponse = await preferenceAPI.getStudentPreferences(currentUser.id)
          if (prefsResponse.data) {
            setPreferences(prefsResponse.data)
          }
        } catch (err) {
          // Preferences not yet set, ignore error
        }
      }
    } catch (err) {
      console.error('Error loading data:', err)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleAddPreference = (projectId) => {
    const project = projects.find(p => p.id === projectId)
    if (project && !preferences.find(p => p.id === projectId)) {
      setPreferences([...preferences, { ...project, order: preferences.length + 1 }])
    }
  }

  const handleRemovePreference = (projectId) => {
    const newPrefs = preferences
      .filter(p => p.id !== projectId)
      .map((p, index) => ({ ...p, order: index + 1 }))
    setPreferences(newPrefs)
  }

  const handleMoveUp = (index) => {
    if (index > 0) {
      const newPrefs = [...preferences]
      ;[newPrefs[index - 1], newPrefs[index]] = [newPrefs[index], newPrefs[index - 1]]
      setPreferences(newPrefs.map((p, i) => ({ ...p, order: i + 1 })))
    }
  }

  const handleMoveDown = (index) => {
    if (index < preferences.length - 1) {
      const newPrefs = [...preferences]
      ;[newPrefs[index], newPrefs[index + 1]] = [newPrefs[index + 1], newPrefs[index]]
      setPreferences(newPrefs.map((p, i) => ({ ...p, order: i + 1 })))
    }
  }

  const handleSubmit = async () => {
    if (preferences.length === 0) {
      toast.error('Veuillez sélectionner au moins un projet')
      return
    }

    setSubmitting(true)

    try {
      const currentUser = JSON.parse(localStorage.getItem('user'))
      if (!currentUser?.id) {
        throw new Error('Utilisateur non connecté')
      }
      
      // Submit preferences to API
      await preferenceAPI.submitPartnerPreference(currentUser.id, {
        project_preferences: preferences.map(p => ({ project_id: p.id, rank: p.order })),
        partner_email: partnerEmail || null
      })
      
      console.log('Submitting preferences:', {
        preferences: preferences.map(p => ({ project_id: p.id, rank: p.order })),
        partner_email: partnerEmail || null
      })
      
      toast.success('Préférences soumises avec succès !')
    } catch (err) {
      console.error('Error submitting preferences:', err)
      toast.error(err.response?.data?.detail || 'Erreur lors de la soumission')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-esiee-blue mb-2">Mes Préférences de Projets</h1>
            <p className="text-gray-600">Chargement des projets...</p>
          </div>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 space-y-6">
        
        <CardSimple className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-esiee-blue">
          <h1 className="text-3xl font-bold text-esiee-blue mb-2">Mes Préférences de Projets</h1>
          <p className="text-gray-600">
            Sélectionnez et classez vos projets préférés. Votre premier choix a la priorité la plus élevée.
          </p>
        </CardSimple>

        {/* Partner Preference Section */}
        <CardSimple className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500">
          <h2 className="text-xl font-bold text-purple-700 mb-3">Préférence de Partenaire (Optionnel)</h2>
          <p className="text-gray-600 mb-4 text-sm">
            Si vous souhaitez être dans le même groupe qu'un camarade, entrez son email. 
            L'algorithme tentera de vous grouper ensemble si possible.
          </p>
          <TextInput
            name="partnerEmail"
            type="email"
            value={partnerEmail}
            onChange={(e) => setPartnerEmail(e.target.value)}
            placeholder="email.partenaire@edu.esiee.fr"
            helperText="L'email doit être celui d'un étudiant inscrit dans le système"
          />
        </CardSimple>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Available Projects */}
          <CardSimple>
            <h2 className="text-xl font-bold text-esiee-blue mb-4">Projets Disponibles</h2>
            <div className="space-y-2">
              {projects
                .filter(p => !preferences.find(pref => pref.id === p.id))
                .map(project => (
                  <div
                    key={project.id}
                    className="flex justify-between items-center p-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-esiee-blue transition-colors"
                  >
                    <span className="text-gray-800">{project.title}</span>
                    <button
                      onClick={() => handleAddPreference(project.id)}
                      className="text-esiee-blue hover:text-blue-700 font-medium transition-colors"
                    >
                      + Ajouter
                    </button>
                  </div>
                ))}
            </div>
          </CardSimple>

          {/* Selected Preferences */}
          <CardSimple>
            <h2 className="text-xl font-bold text-esiee-blue mb-4">Vos Préférences (Classées)</h2>
            {preferences.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                Aucune préférence sélectionnée. Ajoutez des projets à gauche.
              </div>
            ) : (
              <div className="space-y-2">
                {preferences.map((pref, index) => (
                  <div
                    key={pref.id}
                    className="flex items-center justify-between p-3 border-2 rounded-lg bg-blue-50 border-blue-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="bg-esiee-blue text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        {pref.order}
                      </span>
                      <span className="font-medium text-gray-800">{pref.title}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="text-gray-600 hover:text-gray-800 disabled:opacity-30 text-xl transition-colors"
                        title="Monter"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === preferences.length - 1}
                        className="text-gray-600 hover:text-gray-800 disabled:opacity-30 text-xl transition-colors"
                        title="Descendre"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => handleRemovePreference(pref.id)}
                        className="text-red-600 hover:text-red-700 ml-2 text-xl transition-colors"
                        title="Supprimer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {preferences.length > 0 && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-gray-700 mb-3">
                  Vous avez sélectionné <strong>{preferences.length} projet(s)</strong>.
                  {partnerEmail && ` Partenaire: ${partnerEmail}`}
                </p>
                <Button
                  onClick={handleSubmit}
                  variant="primary"
                  fullWidth
                  disabled={submitting}
                >
                  {submitting ? '⏳ Envoi en cours...' : '📤 Soumettre mes Préférences'}
                </Button>
              </div>
            )}
          </CardSimple>
        </div>

        {/* Information Box */}
        <CardSimple className="bg-blue-50 border-l-4 border-blue-500">
          <h3 className="text-lg font-bold text-blue-800 mb-2">ℹ️ Comment ça marche ?</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
            <li>Classez vos projets préférés par ordre de priorité (1 = préférence maximale)</li>
            <li>Vous pouvez réorganiser vos choix avec les flèches ↑ ↓</li>
            <li>Optionnel : Indiquez un partenaire pour être dans le même groupe</li>
            <li>L'algorithme d'affectation tiendra compte de vos préférences</li>
            <li>Vous recevrez une notification une fois l'affectation effectuée</li>
          </ul>
        </CardSimple>
      </div>
    </div>
  )
}

export default PreferencesPage
