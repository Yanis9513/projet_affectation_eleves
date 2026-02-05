import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { TextInput, TextArea, Select } from '../components/Input'
import { Alert, Loading } from '../components/Loading'
import { projectAPI } from '../services/api'

// SVG Icons
const ArrowLeftIcon = () => (
  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
)

const SaveIcon = () => (
  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
)

export default function EditProjectPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    project_type: 'group_project',
    min_students: 1,
    max_students: 5,
    is_active: true,
    is_open_for_preferences: true,
    partner_preference_enabled: true
  })

  const projectTypes = [
    { value: 'group_project', label: 'Projet de Groupe' },
    { value: 'english_leveling', label: 'Répartition par Niveau d\'Anglais' },
    { value: 'exchange_program', label: 'Programme d\'Échange' }
  ]

  useEffect(() => {
    loadProject()
  }, [projectId])

  const loadProject = async () => {
    try {
      const response = await projectAPI.getById(projectId)
      const project = response.data
      setProjectData({
        title: project.title || '',
        description: project.description || '',
        project_type: project.project_type || 'group_project',
        min_students: project.min_students || 1,
        max_students: project.max_students || 5,
        is_active: project.is_active ?? true,
        is_open_for_preferences: project.is_open_for_preferences ?? true,
        partner_preference_enabled: project.partner_preference_enabled ?? true
      })
    } catch (err) {
      console.error('Error loading project:', err)
      setError('Erreur lors du chargement du projet')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setProjectData({
      ...projectData,
      [name]: type === 'checkbox' ? checked : value
    })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    // Validation
    if (!projectData.title.trim()) {
      setError('Le titre du projet est requis')
      setSaving(false)
      return
    }
    if (!projectData.description.trim()) {
      setError('La description est requise')
      setSaving(false)
      return
    }
    if (projectData.min_students < 1) {
      setError('La taille minimale doit être au moins 1')
      setSaving(false)
      return
    }
    if (projectData.max_students < projectData.min_students) {
      setError('La taille maximale doit être supérieure ou égale à la taille minimale')
      setSaving(false)
      return
    }

    try {
      const updateData = {
        title: projectData.title,
        description: projectData.description,
        project_type: projectData.project_type,
        min_students: parseInt(projectData.min_students),
        max_students: parseInt(projectData.max_students),
        is_active: projectData.is_active,
        is_open_for_preferences: projectData.is_open_for_preferences,
        partner_preference_enabled: projectData.partner_preference_enabled
      }

      await projectAPI.update(projectId, updateData)
      setSuccess('Projet mis à jour avec succès!')
      
      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate(`/projects/${projectId}`)
      }, 1500)
    } catch (err) {
      console.error('Error updating project:', err)
      setError(err.response?.data?.detail || 'Erreur lors de la mise à jour du projet')
      setSaving(false)
    }
  }

  if (loading) {
    return <Loading text="Chargement du projet..." />
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <Button variant="secondary" onClick={() => navigate(`/projects/${projectId}`)}>
            <ArrowLeftIcon />
            Retour au projet
          </Button>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm fade-in-delay-1">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Modifier le Projet
            </h1>
            <p className="text-slate-600">
              Mettez à jour les informations de votre projet
            </p>
          </div>

          {error && <Alert type="error" message={error} className="mb-6" />}
          {success && <Alert type="success" message={success} className="mb-6" />}

          <form onSubmit={handleSubmit} className="space-y-6 fade-in-delay-2">
            {/* Basic Information */}
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Informations de Base</h3>
              
              <TextInput
                label="Titre du Projet"
                name="title"
                value={projectData.title}
                onChange={handleInputChange}
                placeholder="Ex: Projet de Fin d'Études - Système IoT"
                required
              />

              <TextArea
                label="Description"
                name="description"
                value={projectData.description}
                onChange={handleInputChange}
                placeholder="Décrivez le projet, les objectifs, les technologies utilisées..."
                rows={6}
                required
              />

              <Select
                label="Type de Projet"
                name="project_type"
                value={projectData.project_type}
                onChange={handleInputChange}
                options={projectTypes}
              />
            </div>

            {/* Group Configuration */}
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Configuration des Groupes</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  label="Taille Minimale du Groupe"
                  name="min_students"
                  type="number"
                  min="1"
                  value={projectData.min_students}
                  onChange={handleInputChange}
                  required
                />

                <TextInput
                  label="Taille Maximale du Groupe"
                  name="max_students"
                  type="number"
                  min="1"
                  value={projectData.max_students}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Status Settings */}
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Paramètres de Statut</h3>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={projectData.is_active}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
                  />
                  <span className="text-slate-700 font-medium">Projet actif</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_open_for_preferences"
                    checked={projectData.is_open_for_preferences}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
                  />
                  <span className="text-slate-700 font-medium">Ouvert aux préférences étudiantes</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="partner_preference_enabled"
                    checked={projectData.partner_preference_enabled}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
                  />
                  <span className="text-slate-700 font-medium">Autoriser les préférences de partenaires</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-slate-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/projects/${projectId}`)}
                disabled={saving}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
              >
                <SaveIcon />
                {saving ? 'Enregistrement...' : 'Enregistrer les Modifications'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
