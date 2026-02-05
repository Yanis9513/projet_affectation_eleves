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
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 animate-fade-in-up">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl">
              <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Mot de passe oublié
            </h1>
            <p className="text-slate-500">
              Entrez votre email pour réinitialiser votre mot de passe
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <TextInput
              label="Adresse Email"
              type="email"
              name="email"
              value={emailData.email}
              onChange={handleEmailChange}
              placeholder="prenom.nom@edu.esiee.fr"
              required
              disabled={loading}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              Envoyer le lien de réinitialisation
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

          {/* Login link */}
          <div className="text-center">
            <p className="text-slate-600">
              Vous vous souvenez de votre mot de passe ?{' '}
              <a 
                href="/login" 
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Se connecter
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

export default ForgotPasswordPage
