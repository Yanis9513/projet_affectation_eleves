import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { TextInput, Select } from '../components/Input'
import Button from '../components/Button'
import { Alert } from '../components/Loading'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoggedIn, userRole, login } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // If already logged in, redirect to dashboard
  if (isLoggedIn) {
    return <Navigate to={`/${userRole}`} replace />
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('') // Clear error when user types
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // TODO: Replace with actual API call
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Simulate validation
      if (!formData.email || !formData.password) {
        throw new Error('Veuillez remplir tous les champs')
      }

      // For demo: accept any email/password
      const userData = {
        email: formData.email,
        name: formData.email.split('@')[0],
        role: formData.role
      }

      // Login with AuthContext
      login(userData, formData.role)

      // Redirect to where they were trying to go, or dashboard
      const from = location.state?.from?.pathname || `/${formData.role}`
      navigate(from, { replace: true })

    } catch (err) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto animate-fadeIn">
      <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-esiee-blue">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img 
            src="/logo-esiee.svg" 
            alt="ESIEE Paris" 
            className="h-16 transition-transform hover:scale-110 duration-300" 
          />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-esiee-blue mb-2">
          Connexion
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Connectez-vous pour accéder à votre espace
        </p>

        {/* Error Alert */}
        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError('')}
            className="mb-4"
          />
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            label="Adresse Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="prenom.nom@edu.esiee.fr"
            required
            disabled={loading}
          />

          <TextInput
            label="Mot de passe"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            disabled={loading}
          />

          <Select
            label="Je suis"
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={[
              { value: 'student', label: '👨‍🎓 Étudiant' },
              { value: 'teacher', label: '👨‍🏫 Enseignant / Admin' },
            ]}
            disabled={loading}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </Button>
        </form>

        {/* Additional Links */}
        <div className="mt-6 space-y-3">
          <div className="text-center">
            <a 
              href="#" 
              className="text-esiee-blue hover:text-blue-700 text-sm transition-colors duration-200"
            >
              Mot de passe oublié ?
            </a>
          </div>
          <div className="text-center text-sm text-gray-600">
            Pas encore de compte ?{' '}
            <a 
              href="#" 
              className="text-esiee-blue hover:text-blue-700 font-medium transition-colors duration-200"
            >
              S'inscrire ici
            </a>
          </div>
        </div>

        {/* Demo Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-gray-600 text-center">
            💡 <strong>Mode Démo:</strong> Utilisez n'importe quel email/mot de passe pour vous connecter
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
