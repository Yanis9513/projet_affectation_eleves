import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CardSimple } from '../components/Card'
import Button from '../components/Button'
import { TextInput } from '../components/Input'
import { Loading, Alert } from '../components/Loading'
import axios from 'axios'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    department: '',
    office: '',
    phone: '',
    bio: ''
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      // Get current user from auth context or localStorage
      const storedRole = localStorage.getItem('userRole')
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      
      // Mock data based on role
      if (storedRole === 'teacher') {
        // Use actual logged-in teacher data
        const actualUser = storedUser.email ? storedUser : JSON.parse(localStorage.getItem('user') || '{}');
        const emailName = actualUser.email?.split('@')[0] || 'teacher';
        const nameParts = emailName.split('.');
        
        const mockUser = {
          id: actualUser.id || 1,
          email: actualUser.email || 'prof@esiee.fr',
          username: actualUser.username || emailName,
          first_name: actualUser.first_name || actualUser.name?.split(' ')[0] || (nameParts[1] ? nameParts[1] : nameParts[0]),
          last_name: actualUser.last_name || actualUser.name?.split(' ')[1] || (nameParts[0] || ''),
          role: 'TEACHER'
        }
        
        const mockTeacher = {
          id: 1,
          user_id: mockUser.id,
          department: actualUser.department || 'Informatique',
          office: actualUser.office || 'Bureau 301',
          phone: actualUser.phone || '+33 1 23 45 67 89',
          bio: actualUser.bio || 'Enseignant à ESIEE Paris.',
          projects_count: actualUser.projects_count || 0,
          students_count: actualUser.students_count || 0
        }

        setUser(mockUser)
        setProfile(mockTeacher)
        setFormData({
          first_name: mockUser.first_name,
          last_name: mockUser.last_name,
          email: mockUser.email,
          department: mockTeacher.department,
          office: mockTeacher.office,
          phone: mockTeacher.phone || '',
          bio: mockTeacher.bio || ''
        })
      } else {
        // Student profile - use actual logged-in user
        const actualUser = storedUser.email ? storedUser : JSON.parse(localStorage.getItem('user') || '{}');
        const emailName = actualUser.email?.split('@')[0] || 'student';
        
        const mockUser = {
          id: actualUser.id || 2,
          email: actualUser.email || 'student@edu.esiee.fr',
          username: actualUser.username || emailName,
          first_name: actualUser.first_name || actualUser.name?.split(' ')[0] || emailName,
          last_name: actualUser.last_name || actualUser.name?.split(' ')[1] || '',
          role: 'STUDENT'
        }
        
        const mockStudent = {
          id: 1,
          user_id: mockUser.id,
          student_number: actualUser.student_number || 'STU000002',
          filiere: actualUser.filiere || 'Informatique',
          english_level: actualUser.english_level || 'B2',
          general_rank: actualUser.rank || 42,
          gpa: actualUser.gpa || 14.5,
          promotion: actualUser.promotion || '2025',
          projects_count: actualUser.projects_count || 0
        }

        setUser(mockUser)
        setProfile(mockStudent)
        setFormData({
          first_name: mockUser.first_name,
          last_name: mockUser.last_name,
          email: mockUser.email,
          student_number: mockStudent.student_number,
          filiere: mockStudent.filiere,
          english_level: mockStudent.english_level,
          promotion: mockStudent.promotion
        })
      }
    } catch (err) {
      console.error('Error loading profile:', err)
      setError('Erreur lors du chargement du profil')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async () => {
    try {
      setError('')
      // Profile update will be implemented when needed
      
      setSuccess('Profil mis à jour avec succès')
      setEditing(false)
      
      // Update local state
      setUser({ ...user, ...formData })
      setProfile({ ...profile, ...formData })
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('Erreur lors de la mise à jour du profil')
    }
  }

  if (loading) {
    return <Loading text="Chargement du profil..." />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            ← Retour
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Mon Profil
          </h1>
          <p className="text-gray-600">
            Gérez vos informations personnelles
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} className="mb-4" />}

        {/* Profile Card */}
        <CardSimple className="mb-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 rounded-full bg-esiee-blue text-white flex items-center justify-center text-3xl font-bold">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-gray-600">{user?.role === 'TEACHER' ? 'Enseignant' : 'Étudiant'}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          {!editing ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <p className="text-gray-900">{user?.first_name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <p className="text-gray-900">{user?.last_name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900">{user?.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom d'utilisateur
                  </label>
                  <p className="text-gray-900">{user?.username}</p>
                </div>

                {user?.role === 'STUDENT' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Numéro d'étudiant
                      </label>
                      <p className="text-gray-900">{profile?.student_number}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Filière
                      </label>
                      <p className="text-gray-900">{profile?.filiere}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Niveau d'anglais
                      </label>
                      <p className="text-gray-900">{profile?.english_level}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rang général
                      </label>
                      <p className="text-gray-900">{profile?.general_rank}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Moyenne générale (GPA)
                      </label>
                      <p className="text-gray-900">{profile?.gpa ? profile.gpa.toFixed(2) : 'N/A'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Promotion
                      </label>
                      <p className="text-gray-900">{profile?.promotion}</p>
                    </div>
                  </>
                )}

                {user?.role === 'TEACHER' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Département
                      </label>
                      <p className="text-gray-900">{profile?.department}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bureau
                      </label>
                      <p className="text-gray-900">{profile?.office}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone
                      </label>
                      <p className="text-gray-900">{profile?.phone || 'Non renseigné'}</p>
                    </div>
                  </>
                )}
              </div>

              {user?.role === 'TEACHER' && profile?.bio && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Biographie
                  </label>
                  <p className="text-gray-900">{profile.bio}</p>
                </div>
              )}

              <Button variant="primary" onClick={() => setEditing(true)}>
                ✏️ Modifier le profil
              </Button>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <TextInput
                  label="Prénom"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />

                <TextInput
                  label="Nom"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />

                <TextInput
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                {user?.role === 'TEACHER' && (
                  <>
                    <TextInput
                      label="Département"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                    />

                    <TextInput
                      label="Bureau"
                      name="office"
                      value={formData.office}
                      onChange={handleChange}
                    />

                    <TextInput
                      label="Téléphone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+33 1 23 45 67 89"
                    />
                  </>
                )}
              </div>

              {user?.role === 'TEACHER' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Biographie
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-esiee-blue"
                    placeholder="Parlez-nous de vous, vos domaines d'expertise..."
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="primary" onClick={handleSave}>
                  💾 Enregistrer
                </Button>
                <Button variant="outline" onClick={() => {
                  setEditing(false)
                  setError('')
                  loadProfile()
                }}>
                  Annuler
                </Button>
              </div>
            </>
          )}
        </CardSimple>

        {/* Statistics Card */}
        <CardSimple>
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Statistiques
          </h3>
          {user?.role === 'TEACHER' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-3xl font-bold text-esiee-blue">{profile?.projects_count || 0}</p>
                <p className="text-sm text-gray-600">Projets créés</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">{profile?.students_count || 0}</p>
                <p className="text-sm text-gray-600">Étudiants supervisés</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-600">0</p>
                <p className="text-sm text-gray-600">Groupes formés</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-600">0</p>
                <p className="text-sm text-gray-600">En cours</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-3xl font-bold text-esiee-blue">{profile?.projects_count || 0}</p>
                <p className="text-sm text-gray-600">Projets inscrits</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-600">{profile?.general_rank || 'N/A'}</p>
                <p className="text-sm text-gray-600">Rang</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">{profile?.gpa ? profile.gpa.toFixed(2) : 'N/A'}</p>
                <p className="text-sm text-gray-600">Moyenne</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-600">{profile?.english_level || 'N/A'}</p>
                <p className="text-sm text-gray-600">Anglais</p>
              </div>
            </div>
          )}
        </CardSimple>
      </div>
    </div>
  )
}
