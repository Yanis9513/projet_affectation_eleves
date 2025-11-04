import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'

function LoginPage() {
  const navigate = useNavigate()
  const { setIsLoggedIn, setUserRole } = useOutletContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // TODO: Implement actual login API call
    // For now, just simulate login
    console.log('Login attempt:', { email, password, role })
    
    // Simulate successful login
    setIsLoggedIn(true)
    setUserRole(role)
    navigate(`/${role}`)
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <div className="flex justify-center mb-4">
          <img src="/logo-esiee.svg" alt="ESIEE Paris" className="h-16" />
        </div>
        <h2 className="text-3xl font-bold text-center text-primary-600 mb-6">Connexion</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="vous@exemple.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Role Selection */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Je suis
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-field"
            >
              <option value="student">Étudiant</option>
              <option value="teacher">Enseignant/Admin</option>
            </select>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-primary w-full">
            Se connecter
          </button>
        </form>

        <div className="mt-4 text-center">
          <a href="#" className="text-primary-600 hover:text-primary-700 text-sm">
            Mot de passe oublié ?
          </a>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          Pas encore de compte ?{' '}
          <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
            S'inscrire ici
          </a>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
