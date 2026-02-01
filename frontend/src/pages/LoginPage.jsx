import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { TextInput } from '../components/Input'
import Button from '../components/Button'
import { validateEmail, validatePassword } from '../utils/validation'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoggedIn, userRole, login } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // If already logged in, redirect to dashboard
  if (isLoggedIn && userRole) {
    return <Navigate to={`/${userRole}`} replace />
  }

  const validateField = (name, value) => {
    let error = ''
    if (name === 'email') {
      if (!value) error = 'L\'email est requis'
      else if (!validateEmail(value)) error = 'Adresse email invalide'
    }
    if (name === 'password') {
      if (!value) error = 'Le mot de passe est requis'
      else if (!validatePassword(value)) error = 'Minimum 6 caractères'
    }
    setErrors(prev => ({ ...prev, [name]: error }))
    return !error
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    validateField(name, value)
  }

  const isFormValid = formData.email && formData.password &&
                     !errors.email && !errors.password

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)

    try {
      // Login with real API (login returns user data)
      const userData = await login(formData)

      toast.success('Connexion réussie')

      // Redirect based on role
      const from = location.state?.from?.pathname || `/${userData.role}`
      navigate(from, { replace: true })

    } catch (err) {
      console.error('Login error:', err)
      
      const errorMessage = 
        err.response?.data?.detail || 
        (err.message === 'Network Error' ? 'Impossible de se connecter au serveur' : err.message) ||
        'Erreur de connexion'
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-esiee-blue fade-in">
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
            error={errors.email}
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
            error={errors.password}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading || !isFormValid}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </Button>
        </form>

        {/* Additional Links */}
        <div className="mt-6 space-y-3">
          <div className="text-center">
            <a 
              href="/forgot-password" 
              className="text-esiee-blue hover:text-blue-700 text-sm transition-colors duration-200"
            >
              Mot de passe oublié ?
            </a>
          </div>
          <div className="text-center text-sm text-gray-600">
            Pas encore de compte ?{' '}
            <a 
              href="/signup" 
              className="text-esiee-blue hover:text-blue-700 font-medium transition-colors duration-200"
            >
              S'inscrire ici
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
