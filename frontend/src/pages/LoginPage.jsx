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
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 animate-fade-in-up">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl">
              <img 
                src="/logo-esiee.svg" 
                alt="ESIEE Paris" 
                className="h-12" 
              />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Bienvenue
            </h1>
            <p className="text-slate-500">
              Connectez-vous à votre espace étudiant
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
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
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                Se souvenir de moi
              </label>
              <a 
                href="/forgot-password" 
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Mot de passe oublié ?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={!isFormValid}
            >
              Se connecter
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-slate-500">ou</span>
            </div>
          </div>

          {/* Sign up link */}
          <div className="text-center">
            <p className="text-slate-600">
              Pas encore de compte ?{' '}
              <a 
                href="/signup" 
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Créer un compte
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          © 2026 ESIEE Paris - Système d'Affectation
        </p>
      </div>
    </div>
  )
}

export default LoginPage
