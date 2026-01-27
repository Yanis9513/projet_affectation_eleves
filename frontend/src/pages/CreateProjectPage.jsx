import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { CardSimple } from '../components/Card'
import { TextInput, TextArea, Select } from '../components/Input'
import { Alert } from '../components/Loading'
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
    students: []
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const projectTypes = [
    { value: 'group_project', label: 'Projet de Groupe' },
    { value: 'english_leveling', label: 'Répartition par Niveau d\'Anglais' },
    { value: 'exchange_program', label: 'Programme d\'Échange' }
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setProjectData({
      ...projectData,
      [name]: type === 'checkbox' ? checked : value
    })
    setError('')
  }

  const handleStudentsUploaded = (students) => {
    setProjectData({
      ...projectData,
      students: students
    })
    setSuccess(`${students.length} étudiants importés avec succès!`)
  }

  const validateStep = (step) => {
    switch(step) {
      case 1:
        if (!projectData.name.trim()) {
          setError('Le nom du projet est requis')
          return false
        }
        if (!projectData.description.trim()) {
          setError('La description est requise')
          return false
        }
        return true
      
      case 2:
        if (projectData.students.length === 0) {
          setError('Veuillez importer au moins un étudiant')
          return false
        }
        return true
      
      case 3:
        if (!projectData.groupSize || projectData.groupSize < 2) {
          setError('La taille du groupe doit être au moins 2')
          return false
        }
        return true
      
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
      setError('')
      setSuccess('')
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
    setError('')
    setSuccess('')
  }

  const handleSubmit = async () => {
    setError('')
    setSuccess('')

    try {
      // Prepare data for API
      const apiData = {
        title: projectData.name,
        description: projectData.description,
        project_type: projectData.type,
        group_size: parseInt(projectData.groupSize),
        partner_preference_enabled: projectData.partnerPreferenceEnabled,
        students: projectData.students.map(student => ({
          name: student.name,
          email: student.email,
          filiere: student.filiere || null,
          rank: student.rank ? parseInt(student.rank) : null,
          grade: student.grade ? parseFloat(student.grade) : null
        }))
      }

      console.log('Creating project:', apiData)
      
      // Call API to create project
      const response = await projectAPI.create(apiData)
      
      setSuccess('Projet créé avec succès!')
      
      // Redirect to teacher dashboard after 2 seconds
      setTimeout(() => {
        navigate('/teacher')
      }, 2000)
      
    } catch (err) {
      console.error('Error creating project:', err)
      setError(err.response?.data?.detail || err.message || 'Erreur lors de la création du projet')
    }
  }

  const renderStepIndicator = () => {
    const steps = [
      { num: 1, label: 'Informations' },
      { num: 2, label: 'Étudiants' },
      { num: 3, label: 'Configuration' },
      { num: 4, label: 'Révision' }
    ]

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step.num} className="flex items-center">
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full font-bold
              ${currentStep >= step.num 
                ? 'bg-esiee-blue text-white' 
                : 'bg-gray-300 text-gray-600'
              }
            `}>
              {step.num}
            </div>
            <div className={`
              ml-2 font-medium
              ${currentStep >= step.num ? 'text-esiee-blue' : 'text-gray-500'}
            `}>
              {step.label}
            </div>
            {index < steps.length - 1 && (
              <div className={`
                w-16 h-1 mx-4
                ${currentStep > step.num ? 'bg-esiee-blue' : 'bg-gray-300'}
              `} />
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderStep1 = () => (
    <CardSimple>
      <h2 className="text-2xl font-bold text-esiee-blue mb-6">
        Étape 1: Informations du Projet
      </h2>
      
      <TextInput
        label="Nom du Projet"
        name="name"
        value={projectData.name}
        onChange={handleInputChange}
        placeholder="Ex: Projet Java - Groupe A"
        required
      />

      <TextArea
        label="Description"
        name="description"
        value={projectData.description}
        onChange={handleInputChange}
        placeholder="Décrivez le projet et ses objectifs..."
        rows={4}
        required
      />

      <Select
        label="Type de Projet"
        name="type"
        value={projectData.type}
        onChange={handleInputChange}
        options={projectTypes}
        helperText="Le type de projet détermine la logique d'affectation"
      />

      {projectData.type !== 'group_project' && (
        <Alert
          type="info"
          message="Ce type de projet n'est pas encore complètement implémenté. Nous commençons avec 'Projet de Groupe'."
        />
      )}
    </CardSimple>
  )

  const renderStep2 = () => (
    <CardSimple>
      <h2 className="text-2xl font-bold text-esiee-blue mb-6">
        Étape 2: Importer les Étudiants
      </h2>
      
      <Alert
        type="info"
        title="Format CSV Requis"
        message="Le fichier doit contenir les colonnes: name, email, filiere, rank, grade"
        className="mb-4"
      />

      <CSVUploader 
        onUploadSuccess={handleStudentsUploaded}
        existingStudents={projectData.students}
      />
    </CardSimple>
  )

  const renderStep3 = () => (
    <CardSimple>
      <h2 className="text-2xl font-bold text-esiee-blue mb-6">
        Étape 3: Configuration des Groupes
      </h2>

      <div className="space-y-6">
        <TextInput
          label="Taille des Groupes"
          name="groupSize"
          type="number"
          min="2"
          max="10"
          value={projectData.groupSize}
          onChange={handleInputChange}
          helperText="Nombre d'étudiants par groupe"
          required
        />

        <div className="bg-blue-50 border-l-4 border-esiee-blue p-4 rounded">
          <p className="text-sm text-gray-700">
            <strong>Calcul:</strong> Avec {projectData.students.length} étudiants et des groupes de {projectData.groupSize}, 
            vous aurez environ <strong className="text-esiee-blue">
              {Math.ceil(projectData.students.length / projectData.groupSize)} groupes
            </strong>
          </p>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Préférences des Étudiants</h3>
          
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="partnerPreferenceEnabled"
              checked={projectData.partnerPreferenceEnabled}
              onChange={handleInputChange}
              className="w-5 h-5 text-esiee-blue bg-gray-100 border-gray-300 rounded focus:ring-esiee-blue focus:ring-2"
            />
            <div>
              <div className="font-semibold text-gray-800">
                Activer les préférences de partenaire
              </div>
              <div className="text-sm text-gray-600">
                Les étudiants pourront indiquer avec qui ils souhaitent travailler
              </div>
            </div>
          </label>
        </div>
      </div>
    </CardSimple>
  )

  const renderStep4 = () => (
    <CardSimple>
      <h2 className="text-2xl font-bold text-esiee-blue mb-6">
        Étape 4: Révision et Création
      </h2>

      <div className="space-y-6">
        {/* Project Info Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold text-gray-800 mb-3">Informations du Projet</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <dt className="text-gray-600">Nom:</dt>
            <dd className="font-semibold text-gray-800">{projectData.name}</dd>
            
            <dt className="text-gray-600">Type:</dt>
            <dd className="font-semibold text-gray-800">
              {projectTypes.find(t => t.value === projectData.type)?.label}
            </dd>
            
            <dt className="text-gray-600">Description:</dt>
            <dd className="font-semibold text-gray-800 col-span-2">{projectData.description}</dd>
          </dl>
        </div>

        {/* Students Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold text-gray-800 mb-3">Étudiants</h3>
          <p className="text-sm text-gray-700">
            <strong className="text-esiee-blue">{projectData.students.length}</strong> étudiants importés
          </p>
        </div>

        {/* Groups Configuration Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold text-gray-800 mb-3">Configuration</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <dt className="text-gray-600">Taille des groupes:</dt>
            <dd className="font-semibold text-gray-800">{projectData.groupSize} étudiants</dd>
            
            <dt className="text-gray-600">Nombre de groupes:</dt>
            <dd className="font-semibold text-gray-800">
              ~{Math.ceil(projectData.students.length / projectData.groupSize)} groupes
            </dd>
            
            <dt className="text-gray-600">Préférences partenaire:</dt>
            <dd className={`font-semibold ${projectData.partnerPreferenceEnabled ? 'text-green-600' : 'text-gray-500'}`}>
              {projectData.partnerPreferenceEnabled ? 'Activées' : 'Désactivées'}
            </dd>
          </dl>
        </div>

        {/* Next Steps Info */}
        <Alert
          type="info"
          title="Prochaines étapes"
          message={projectData.partnerPreferenceEnabled 
            ? "Après la création, un formulaire sera envoyé aux étudiants pour recueillir leurs préférences."
            : "L'algorithme créera automatiquement les groupes de manière équilibrée."
          }
        />
      </div>
    </CardSimple>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Créer un Nouveau Projet
          </h1>
          <p className="text-gray-600">
            Suivez les étapes pour configurer votre projet
          </p>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Error/Success Messages */}
        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError('')}
            className="mb-6"
          />
        )}

        {success && (
          <Alert 
            type="success" 
            message={success} 
            onClose={() => setSuccess('')}
            className="mb-6"
          />
        )}

        {/* Step Content */}
        <div className="mb-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <div>
            {currentStep > 1 && (
              <Button
                variant="secondary"
                onClick={prevStep}
              >
                ← Précédent
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

            {currentStep < 4 ? (
              <Button
                variant="primary"
                onClick={nextStep}
              >
                Suivant →
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSubmit}
              >
                Créer le Projet
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
