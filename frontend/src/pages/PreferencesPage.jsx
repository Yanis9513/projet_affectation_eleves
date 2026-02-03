import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Button from '../components/Button'
import { TextInput } from '../components/Input'
import { SkeletonCard } from '../components/Loading'
import { projectAPI, preferenceAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

// Icons
const ArrowUpIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
)

const ArrowDownIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const InfoIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
)

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
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mes Préférences de Projets</h1>
          <p className="text-slate-600 mt-1">Chargement des projets...</p>
        </div>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Mes Préférences de Projets</h1>
        <p className="text-blue-100">
          Sélectionnez et classez vos projets préférés. Votre premier choix a la priorité la plus élevée.
        </p>
      </div>

      {/* Partner Preference Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-purple-50 rounded-xl">
            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Préférence de Partenaire</h2>
            <p className="text-sm text-slate-600">
              Optionnel : Si vous souhaitez être dans le même groupe qu'un camarade, entrez son email.
            </p>
          </div>
        </div>
        <TextInput
          name="partnerEmail"
          type="email"
          value={partnerEmail}
          onChange={(e) => setPartnerEmail(e.target.value)}
          placeholder="email.partenaire@edu.esiee.fr"
          helperText="L'email doit être celui d'un étudiant inscrit dans le système"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Available Projects */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-900">Projets Disponibles</h2>
          </div>
          <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
            {projects
              .filter(p => !preferences.find(pref => pref.id === p.id))
              .map(project => (
                <div
                  key={project.id}
                  className="flex justify-between items-center p-3 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all group"
                >
                  <span className="text-slate-700 font-medium">{project.title}</span>
                  <button
                    onClick={() => handleAddPreference(project.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-colors"
                  >
                    <PlusIcon />
                    <span>Ajouter</span>
                  </button>
                </div>
              ))}
            {projects.filter(p => !preferences.find(pref => pref.id === p.id)).length === 0 && (
              <p className="text-slate-500 text-center py-8">Tous les projets ont été ajoutés</p>
            )}
          </div>
        </div>

        {/* Selected Preferences */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-900">Vos Préférences (Classées)</h2>
          </div>
          <div className="p-4">
            {preferences.length === 0 ? (
              <div className="text-slate-500 text-center py-8">
                <p className="mb-2">Aucune préférence sélectionnée</p>
                <p className="text-sm">Ajoutez des projets depuis la liste à gauche</p>
              </div>
            ) : (
              <div className="space-y-2">
                {preferences.map((pref, index) => (
                  <div
                    key={pref.id}
                    className="flex items-center justify-between p-3 border-2 rounded-xl bg-blue-50 border-blue-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="bg-blue-600 text-white rounded-xl w-10 h-10 flex items-center justify-center font-bold text-lg shadow-sm">
                        {pref.order}
                      </span>
                      <span className="font-medium text-slate-800">{pref.title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 rounded-lg transition-colors"
                        title="Monter"
                      >
                        <ArrowUpIcon />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === preferences.length - 1}
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 rounded-lg transition-colors"
                        title="Descendre"
                      >
                        <ArrowDownIcon />
                      </button>
                      <button
                        onClick={() => handleRemovePreference(pref.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 ml-1 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {preferences.length > 0 && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-sm text-slate-700 mb-3">
                  Vous avez sélectionné <strong className="text-emerald-700">{preferences.length} projet(s)</strong>.
                  {partnerEmail && <span className="text-purple-600"> Partenaire: {partnerEmail}</span>}
                </p>
                <Button
                  onClick={handleSubmit}
                  variant="primary"
                  fullWidth
                  disabled={submitting}
                >
                  <span className="flex items-center justify-center gap-2">
                    {submitting ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <SendIcon />
                        Soumettre mes Préférences
                      </>
                    )}
                  </span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Information Box */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <InfoIcon />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Comment ça marche ?</h3>
            <ul className="space-y-2 text-slate-700 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">1.</span>
                Classez vos projets préférés par ordre de priorité (1 = préférence maximale)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">2.</span>
                Vous pouvez réorganiser vos choix avec les flèches ↑ ↓
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">3.</span>
                Optionnel : Indiquez un partenaire pour être dans le même groupe
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">4.</span>
                L'algorithme d'affectation tiendra compte de vos préférences
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">5.</span>
                Vous recevrez une notification une fois l'affectation effectuée
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreferencesPage
