import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { TextInput } from '../components/Input'
import Button from '../components/Button'
import { authAPI } from '../services/api'

function ForgotPasswordPage() {
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

    setLoading(true)
    try {
      await authAPI.forgotPassword({ email: emailData.email })
      toast.success('Email de réinitialisation envoyé! Vérifiez votre boîte de réception')
      setEmailData({ email: '' })
    } catch (error) {
      const detail = error.response?.data?.detail || 'Erreur lors de la demande'
      if (detail.includes('not found') || detail.includes('does not exist')) {
        toast.error('Aucun compte trouvé avec cet email.')
      } else {
        toast.error(detail)
      }
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
          Mot de passe oublié
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Entrez votre email pour réinitialiser votre mot de passe
        </p>

        {/* Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <TextInput
            label="Adresse Email"
            type="email"
            name="email"
            value={emailData.email}
            onChange={handleEmailChange}
            placeholder="vous@edu.esiee.fr"
            required
            disabled={loading}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
          </Button>
        </form>

        {/* Additional Links */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600">
            Vous vous souvenez de votre mot de passe ?{' '}
            <a 
              href="/login" 
              className="text-esiee-blue hover:text-blue-700 font-medium transition-colors duration-200"
            >
              Se connecter
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
