import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { TextInput } from '../components/Input'
import Button from '../components/Button'
import { authAPI } from '../services/api'

function SignupPage() {
  const navigate = useNavigate()
  const { isLoggedIn, userRole } = useAuth()

  const [emailData, setEmailData] = useState({
    email: ''
  })

  const [loading, setLoading] = useState(false)

  // If already logged in, redirect to dashboard
  if (isLoggedIn) {
    return <Navigate to={`/${userRole}`} replace />
  }

  const handleEmailChange = (e) => {
    setEmailData({
      ...emailData,
      [e.target.name]: e.target.value
    })
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()

    if (!emailData.email) {
      toast.error('Veuillez entrer votre adresse email')
      return
    }

    if (!emailData.email.endsWith('@edu.esiee.fr')) {
      toast.error('Vous devez utiliser une adresse email ESIEE (@edu.esiee.fr)')
      return
    }

    setLoading(true)
    try {
      await authAPI.signupRequest({ email: emailData.email })
      toast.success('Email de confirmation envoyé! Vérifiez votre boîte de réception')
      setEmailData({ email: '' })
    } catch (error) {
      const message = error.response?.data?.detail || 'Erreur lors de la demande d\'inscription'
      toast.error(message)
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
          S'inscrire
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Créez un compte avec votre email ESIEE
        </p>

        {/* Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <TextInput
            label="Adresse Email ESIEE"
            type="email"
            name="email"
            value={emailData.email}
            onChange={handleEmailChange}
            placeholder="vous@edu.esiee.fr"
            required
            disabled={loading}
          />
          <p className="text-xs text-gray-500">
            ✓ Doit se terminer par @edu.esiee.fr
          </p>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Envoi en cours...' : 'Envoyer le lien d\'inscription'}
          </Button>
        </form>

        {/* Additional Links */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600">
            Vous avez un compte ?{' '}
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

export default SignupPage
