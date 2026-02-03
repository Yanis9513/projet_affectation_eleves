import { useState } from 'react'
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { TextInput } from '../components/Input'
import Button from '../components/Button'
import { authAPI } from '../services/api'

function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isLoggedIn, userRole } = useAuth()

  const token = searchParams.get('token')

  // If no token, redirect to forgot password
  if (!token) {
    return <Navigate to="/forgot-password" replace />
  }

  // If already logged in, redirect to dashboard
  if (isLoggedIn) {
    return <Navigate to={`/${userRole}`} replace />
  }

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })

  const [loading, setLoading] = useState(false)

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
      const response = await authAPI.resetPassword({
        token,
        password: formData.password
      })

      toast.success('Mot de passe réinitialisé avec succès!')
      navigate('/login')
    } catch (error) {
      const detail = error.response?.data?.detail || ''
      if (detail.includes('Invalid or expired token')) {
        toast.error('Ce lien a expiré ou n\'est pas valide. Demandez un nouveau lien.')
      } else {
        toast.error(detail || 'Erreur lors de la réinitialisation')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-blue-500 animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img 
            src="/logo-esiee.svg" 
            alt="ESIEE Paris" 
            className="h-16 transition-transform hover:scale-110 duration-300" 
          />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-2">
          Réinitialiser le mot de passe
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Entrez votre nouveau mot de passe
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            label="Nouveau mot de passe"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            disabled={loading}
          />
          <p className="text-xs text-gray-500">
            Minimum 6 caractères
          </p>

          <TextInput
            label="Confirmer le mot de passe"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
            disabled={loading}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
          </Button>
        </form>

        {/* Additional Links */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600">
            Vous vous souvenez de votre mot de passe ?{' '}
            <a 
              href="/login" 
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              Se connecter
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
