import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { TextInput } from '../components/Input'
import Button from '../components/Button'
import { authAPI } from '../services/api'

function SignupCompletePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isLoggedIn, userRole } = useAuth()
  
  const token = searchParams.get('token')
  const [loading, setLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState(!!token)
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })

  // If already logged in, redirect to dashboard
  if (isLoggedIn) {
    return <Navigate to={`/${userRole}`} replace />
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-esiee-blue to-blue-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Lien invalide ou expiré</h1>
          <p className="text-gray-600 mb-6">
            Ce lien d'inscription n'est plus valide. Veuillez demander une nouvelle invitation.
          </p>
          <a href="/signup">
            <Button variant="primary" className="w-full">
              Retour à l'inscription
            </Button>
          </a>
        </div>
      </div>
    )
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate inputs
    if (!formData.password || !formData.confirmPassword) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)
    try {
      const response = await authAPI.signupCompleteSimple({
        token: token,
        password: formData.password
      })

      // Store token and user info
      localStorage.setItem('token', response.access_token)
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('userRole', response.user.role)

      toast.success('Compte créé avec succès!')
      navigate(`/${response.user.role}`)
    } catch (error) {
      const message = error.response?.data?.detail || 'Erreur lors de la création du compte'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-esiee-blue to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-esiee-blue mb-2">Créer votre mot de passe</h1>
          <p className="text-gray-600">
            Sécurisez votre compte avec un mot de passe
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <TextInput
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2">
              Minimum 6 caractères
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <TextInput
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••"
              required
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Création du compte...' : 'Créer mon compte'}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Vous avez un compte ?{' '}
              <a href="/login" className="text-esiee-blue hover:underline font-medium">
                Se connecter
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SignupCompletePage
