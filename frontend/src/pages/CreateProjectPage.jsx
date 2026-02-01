import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../components/Button'
import { CardSimple } from '../components/Card'
import { TextInput, TextArea } from '../components/Input'
import CSVUploader from '../components/CSVUploader'
import { projectAPI } from '../services/api'

export default function CreateProjectPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    type: 'group_project',
    groupSize: 3,
    partnerPreferenceEnabled: true,
    deadline: '',
    students: [],
    destinations: []
  })

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)

  const isExchangeProgram = projectData.type === 'exchange_program'

  const projectTypes = [
    { 
      value: 'group_project', 
      label: 'Projet de Groupe', 
      description: 'Création automatique de groupes',
      icon: '👥'
    },
    { 
      value: 'english_leveling', 
      label: 'Répartition par Niveau d\'Anglais', 
      description: 'Groupes homogènes selon le niveau',
      icon: '🌍'
    },
    { 
      value: 'exchange_program', 
      label: 'Programme d\'Échange', 
      description: 'Affectation aux universités partenaires',
      icon: '✈️'
    }
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    setProjectData(prev => ({ ...prev, [name]: newValue }))
    if (touched[name]) validateField(name, newValue)
  }

  const validateField = (name, value) => {
    let error = ''
    switch(name) {
      case 'name':
        if (!value.trim()) error = 'Le nom du projet est requis'
        else if (value.trim().length < 3) error = 'Minimum 3 caractères'
        break
      case 'description':
        if (!value.trim()) error = 'La description est requise'
        else if (value.trim().length < 10) error = 'Minimum 10 caractères'
        break
      case 'groupSize':
        if (!value || value < 2) error = 'La taille minimale est 2'
        break
      case 'deadline':
        if (!value) error = 'La date limite est requise'
        else if (new Date(value) < new Date()) error = 'La date doit être dans le futur'
        break
    }
    setErrors(prev => ({ ...prev, [name]: error }))
    return !error
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    validateField(name, value)
  }

  const handleStudentsUploaded = (students) => {
    setProjectData(prev => ({ ...prev, students }))
    toast.success(`${students.length} étudiants importés`)
  }

  const handleDestinationsUploaded = (destinations) => {
    setProjectData(prev => ({ ...prev, destinations }))
    toast.success(`${destinations.length} universités ajoutées`)
  }

  const isStepValid = (step) => {
    switch(step) {
      case 1:
        return projectData.name.trim().length >= 3 && 
               projectData.description.trim().length >= 10 &&
               !errors.name && !errors.description
      case 2:
        return projectData.students.length > 0
      case 3:
        return isExchangeProgram ? projectData.destinations.length > 0 : true
      default:
        return true
    }
  }

  const validateStep = (step) => {
    const newErrors = {}
    switch(step) {
      case 1:
        if (!projectData.name.trim()) {
          newErrors.name = 'Veuillez saisir un nom de projet'
        } else if (projectData.name.trim().length < 3) {
          newErrors.name = 'Minimum 3 caractères'
        }
        if (!projectData.description.trim()) {
          newErrors.description = 'Veuillez saisir une description'
        } else if (projectData.description.trim().length < 10) {
          newErrors.description = 'Minimum 10 caractères'
        }
        setErrors(newErrors)
        setTouched({ name: true, description: true })
        return Object.keys(newErrors).length === 0
      
      case 2:
        if (projectData.students.length === 0) {
          toast.error('Veuillez importer au moins un étudiant')
          return false
        }
        return true
      
      case 3:
        if (isExchangeProgram) {
          if (projectData.destinations.length === 0) {
            toast.error('Veuillez ajouter au moins une université partenaire')
            return false
          }
          // Validate total places >= students
          const totalPlaces = projectData.destinations.reduce((sum, d) => sum + (d.total_places || 0), 0)
          if (totalPlaces < projectData.students.length) {
            toast.error(`Places insuffisantes : ${totalPlaces} places pour ${projectData.students.length} étudiants`)
            return false
          }
        } else {
          if (!projectData.groupSize || projectData.groupSize < 2) {
            newErrors.groupSize = 'La taille du groupe doit être au moins 2'
            setErrors(newErrors)
            setTouched({ groupSize: true })
            return false
          }
        }
        return true
      
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const apiData = {
        title: projectData.name,
        description: projectData.description,
        project_type: projectData.type,
        group_size: isExchangeProgram ? null : parseInt(projectData.groupSize),
        partner_preference_enabled: isExchangeProgram ? false : projectData.partnerPreferenceEnabled,
        deadline: projectData.deadline || null,
        students: projectData.students.map(student => ({
          name: student.name,
          email: student.email,
          filiere: student.filiere || null,
          rank: student.rank ? parseInt(student.rank) : null,
          grade: student.grade ? parseFloat(student.grade) : null
        })),
        destinations: isExchangeProgram ? projectData.destinations : []
      }

      const response = await projectAPI.create(apiData)
      
      toast.success('Projet créé avec succès!')
      
      setTimeout(() => {
        navigate('/teacher')
      }, 1500)
      
    } catch (err) {
      console.error('Error creating project:', err)
      toast.error(err.response?.data?.detail || err.message || 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  const getSteps = () => {
    if (isExchangeProgram) {
      return [
        { num: 1, label: 'Informations' },
        { num: 2, label: 'Étudiants' },
        { num: 3, label: 'Universités' },
        { num: 4, label: 'Confirmation' }
      ]
    }
    return [
      { num: 1, label: 'Informations' },
      { num: 2, label: 'Étudiants' },
      { num: 3, label: 'Configuration' },
      { num: 4, label: 'Confirmation' }
    ]
  }

  const renderStepIndicator = () => {
    const steps = getSteps()
    
    return (
      <div className="mb-10">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.num} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    currentStep > step.num 
                      ? 'bg-green-500 text-white shadow-md' 
                      : currentStep === step.num
                        ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-100'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step.num ? '✓' : step.num}
                </div>
                <span 
                  className={`mt-2 text-xs font-medium ${
                    currentStep >= step.num ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div 
                  className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${
                    currentStep > step.num ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderStep1 = () => (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Informations du projet
      </h2>
      
      <div className="space-y-6">
        <TextInput
          label="Nom du projet"
          name="name"
          value={projectData.name}
          onChange={handleInputChange}
          onBlur={handleBlur}
          error={touched.name ? errors.name : ''}
          placeholder="Ex: Programme d'échange MIT 2025"
          required
        />

        <TextArea
          label="Description"
          name="description"
          value={projectData.description}
          onChange={handleInputChange}
          onBlur={handleBlur}
          error={touched.description ? errors.description : ''}
          placeholder="Décrivez les objectifs et détails du projet..."
          rows={4}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Type de projet
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projectTypes.map((type) => (
              <label
                key={type.value}
                className={`relative flex flex-col items-center p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                  projectData.type === type.value 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={type.value}
                  checked={projectData.type === type.value}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <span className="text-3xl mb-2">{type.icon}</span>
                <span className="font-semibold text-gray-800 text-center">
                  {type.label}
                </span>
                <span className="text-xs text-gray-500 text-center mt-1">
                  {type.description}
                </span>
                {projectData.type === type.value && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        <TextInput
          label="Date limite de soumission (optionnel)"
          name="deadline"
          type="date"
          value={projectData.deadline}
          onChange={handleInputChange}
        />
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Import des étudiants
      </h2>
      <p className="text-gray-600 mb-6">
        Importez la liste des étudiants participants au format CSV
      </p>
      
      <CSVUploader 
        onUploadSuccess={handleStudentsUploaded}
        existingStudents={projectData.students}
      />
      
      {projectData.students.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            <span className="font-semibold">{projectData.students.length} étudiants</span> importés avec succès
          </p>
        </div>
      )}
    </div>
  )

  const renderStep3 = () => {
    if (isExchangeProgram) {
      const totalPlaces = projectData.destinations.reduce((sum, d) => sum + (d.total_places || 0), 0)
      const placesNeeded = projectData.students.length
      
      return (
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Universités partenaires
          </h2>
          <p className="text-gray-600 mb-6">
            Ajoutez les universités de destination pour les étudiants
          </p>
          
          {/* Capacity indicator */}
          <div className={`mb-6 p-4 rounded-lg border ${
            totalPlaces >= placesNeeded 
              ? 'bg-green-50 border-green-200' 
              : 'bg-orange-50 border-orange-200'
          }`}>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                Capacité : {totalPlaces} places / {placesNeeded} étudiants
              </span>
              <span className={`text-sm font-bold ${
                totalPlaces >= placesNeeded ? 'text-green-700' : 'text-orange-700'
              }`}>
                {totalPlaces >= placesNeeded ? '✓ Suffisant' : '⚠️ Insuffisant'}
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  totalPlaces >= placesNeeded ? 'bg-green-500' : 'bg-orange-500'
                }`}
                style={{ width: `${Math.min((totalPlaces / placesNeeded) * 100, 100)}%` }}
              />
            </div>
          </div>
          
          <CSVUploader 
            type="destinations"
            onUploadSuccess={handleDestinationsUploaded}
            existingStudents={projectData.destinations}
          />
          
          {projectData.destinations.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-700 mb-3">
                {projectData.destinations.length} universités configurées
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projectData.destinations.map((dest, idx) => (
                  <div key={idx} className="p-3 bg-white border rounded-lg shadow-sm">
                    <div className="font-semibold text-gray-800">{dest.university_name}</div>
                    <div className="text-sm text-gray-600">{dest.city}, {dest.country}</div>
                    <div className="text-sm text-blue-600 mt-1">
                      {dest.total_places} places disponibles
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }

    // Non-exchange program config
    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Configuration des groupes
        </h2>

        <div className="space-y-6">
          <TextInput
            label="Taille des groupes"
            name="groupSize"
            type="number"
            min="2"
            max="10"
            value={projectData.groupSize}
            onChange={handleInputChange}
            onBlur={handleBlur}
            error={touched.groupSize ? errors.groupSize : ''}
            helperText={`${projectData.students.length} étudiants = environ ${Math.ceil(projectData.students.length / projectData.groupSize)} groupes`}
            required
          />

          <div className="p-4 bg-gray-50 rounded-lg border">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="partnerPreferenceEnabled"
                checked={projectData.partnerPreferenceEnabled}
                onChange={handleInputChange}
                className="mt-1 w-4 h-4 text-blue-600 rounded"
              />
              <div>
                <div className="font-medium text-gray-800">
                  Activer les préférences de partenaire
                </div>
                <div className="text-sm text-gray-600">
                  Les étudiants pourront indiquer avec qui ils souhaitent travailler
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    )
  }

  const renderStep4 = () => {
    const totalPlaces = isExchangeProgram 
      ? projectData.destinations.reduce((sum, d) => sum + (d.total_places || 0), 0)
      : 0
    
    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Confirmation
        </h2>

        <div className="space-y-4">
          {/* Project Info */}
          <div className="bg-gray-50 p-5 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3">Informations</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nom :</span>
                <span className="font-medium">{projectData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type :</span>
                <span className="font-medium">
                  {projectTypes.find(t => t.value === projectData.type)?.label}
                </span>
              </div>
              {projectData.deadline && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Date limite :</span>
                  <span className="font-medium">
                    {new Date(projectData.deadline).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Students */}
          <div className="bg-blue-50 p-5 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3">Étudiants</h3>
            <p className="text-2xl font-bold text-blue-600">
              {projectData.students.length}
            </p>
            <p className="text-sm text-gray-600">étudiants inscrits</p>
          </div>

          {/* Destinations or Config */}
          {isExchangeProgram ? (
            <div className="bg-purple-50 p-5 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-3">Universités</h3>
              <p className="text-2xl font-bold text-purple-600">
                {projectData.destinations.length}
              </p>
              <p className="text-sm text-gray-600">
                {totalPlaces} places disponibles au total
              </p>
            </div>
          ) : (
            <div className="bg-green-50 p-5 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-3">Configuration</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Taille des groupes :</span>
                  <span className="font-medium">{projectData.groupSize} étudiants</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre de groupes :</span>
                  <span className="font-medium">
                    ~{Math.ceil(projectData.students.length / projectData.groupSize)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Préférences :</span>
                  <span className="font-medium">
                    {projectData.partnerPreferenceEnabled ? 'Activées' : 'Désactivées'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action */}
          <div className="pt-4">
            <Button
              variant="primary"
              fullWidth
              onClick={handleSubmit}
              disabled={!isStepValid(currentStep) || loading}
              className="py-4 text-lg"
            >
              {loading ? 'Création...' : 'Créer le projet'}
            </Button>
            <p className="text-center text-sm text-gray-500 mt-3">
              Le projet sera créé et les étudiants recevront une notification
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-10">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Nouveau projet
          </h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Créez un nouveau projet en quelques étapes
          </p>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-8 mb-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div>
            {currentStep > 1 && (
              <Button variant="secondary" onClick={prevStep}>
                ← Retour
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/teacher')}
            >
              Annuler
            </Button>

            {currentStep < 4 && (
              <Button variant="primary" onClick={nextStep} disabled={!isStepValid(currentStep)}>
                Continuer →
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
