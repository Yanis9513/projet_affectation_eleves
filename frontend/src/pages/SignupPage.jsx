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
              Créer un compte
            </h1>
            <p className="text-slate-500">
              Inscrivez-vous avec votre email ESIEE
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <TextInput
              label="Adresse Email ESIEE"
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
            
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Doit se terminer par @edu.esiee.fr</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              Envoyer le lien d'inscription
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
              Déjà inscrit ?{' '}
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

export default SignupPage
