import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { TextInput, Select } from '../components/Input'
import { Loading, Alert } from '../components/Loading'
import { studentAPI, teacherAPI, authAPI } from '../services/api'

// Icons
const UserIcon = () => (
  <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const EditIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const SaveIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const CancelIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

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
    bio: '',
    // Student fields
    student_number: '',
    filiere: '',
    english_level: '',
    promotion: ''
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const storedRole = localStorage.getItem('userRole')
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      
      if (storedRole === 'teacher') {
        // Fetch teacher profile from API
        try {
          const response = await teacherAPI.getProfile()
          const profileData = response.data
          
          setUser({
            id: storedUser.id,
            email: profileData.user.email,
            username: profileData.user.username,
            first_name: profileData.user.first_name,
            last_name: profileData.user.last_name,
            role: 'TEACHER'
          })
          
          setProfile(profileData)
          setFormData({
            first_name: profileData.user.first_name,
            last_name: profileData.user.last_name,
            email: profileData.user.email,
            department: profileData.department || '',
            office: profileData.office || '',
            phone: profileData.phone || '',
            bio: profileData.bio || ''
          })
        } catch (apiErr) {
          // Fallback to localStorage
          const actualUser = storedUser.email ? storedUser : JSON.parse(localStorage.getItem('user') || '{}')
          const emailName = actualUser.email?.split('@')[0] || 'teacher'
          const nameParts = emailName.split('.')
          
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
            bio: actualUser.bio || 'Enseignant à ESIEE Paris.'
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
        }
      } else {
        // Fetch student profile from API
        try {
          const response = await studentAPI.getProfile()
          const profileData = response.data
          
          setUser({
            id: storedUser.id,
            email: profileData.email,
            username: storedUser.username,
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            role: 'STUDENT'
          })
          
          setProfile({
            id: profileData.id,
            student_number: profileData.student_number,
            filiere: profileData.filiere,
            english_level: profileData.language_level,
            general_rank: profileData.ranking,
            promotion: profileData.promotion
          })
          
          setFormData({
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            email: profileData.email,
            student_number: profileData.student_number,
            filiere: profileData.filiere,
            english_level: profileData.language_level,
            promotion: profileData.promotion
          })
        } catch (apiErr) {
          // Fallback to localStorage
          const actualUser = storedUser.email ? storedUser : JSON.parse(localStorage.getItem('user') || '{}')
          const emailName = actualUser.email?.split('@')[0] || 'student'
          
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
            promotion: actualUser.promotion || '2025'
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
      }
    } catch (err) {
      console.error('Error loading profile:', err)
      setError('Impossible de charger votre profil.')
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
      const storedRole = localStorage.getItem('userRole')
      
      // Helper function to remove undefined and empty values
      const cleanData = (obj) => {
        const cleaned = {}
        for (const [key, value] of Object.entries(obj)) {
          if (value !== undefined && value !== null && value !== '') {
            cleaned[key] = value
          }
        }
        return cleaned
      }
      
      if (storedRole === 'teacher') {
        // Update teacher profile
        const teacherData = cleanData({
          department: formData.department,
          office: formData.office,
          phone: formData.phone,
          bio: formData.bio
        })
        if (Object.keys(teacherData).length > 0) {
          await teacherAPI.updateProfile(teacherData)
        }
        
        // Update user info (first_name, last_name)
        const userData = cleanData({
          first_name: formData.first_name,
          last_name: formData.last_name
        })
        if (Object.keys(userData).length > 0) {
          await authAPI.updateProfile(userData)
        }
      } else {
        // Update student profile
        // Note: API expects 'language_level' not 'english_level'
        const studentData = cleanData({
          student_number: formData.student_number,
          filiere: formData.filiere,
          language_level: formData.english_level,
          promotion: formData.promotion
        })
        if (Object.keys(studentData).length > 0) {
          await studentAPI.updateProfile(studentData)
        }
        
        // Update user info (first_name, last_name)
        const userData = cleanData({
          first_name: formData.first_name,
          last_name: formData.last_name
        })
        if (Object.keys(userData).length > 0) {
          await authAPI.updateProfile(userData)
        }
      }
      
      setSuccess('Profil mis à jour avec succès')
      setEditing(false)
      
      // Reload profile to ensure data is in sync
      await loadProfile()
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('La mise à jour de votre profil a échoué.')
    }
  }

  if (loading) {
    return <Loading text="Chargement du profil..." />
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mon Profil</h1>
          <p className="text-slate-600 mt-1">Gérez vos informations personnelles</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour
        </button>
      </div>

      {/* Alerts */}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
            {user?.first_name && user?.last_name ? (
              <span className="text-3xl font-bold">
                {user.first_name[0]}{user.last_name[0]}
              </span>
            ) : (
              <UserIcon />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">
              {user?.first_name} {user?.last_name}
            </h2>
            <p className="text-blue-100 mt-1">
              {user?.role === 'TEACHER' ? 'Enseignant' : 'Étudiant'}
            </p>
            <p className="text-blue-200 text-sm mt-1">{user?.email}</p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm"
            >
              <EditIcon />
              <span>Modifier</span>
            </button>
          )}
        </div>
      </div>

      {/* Profile Details Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-900">
            {editing ? 'Modifier les informations' : 'Informations personnelles'}
          </h3>
        </div>
        
        <div className="p-6">
          {!editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileField label="Prénom" value={user?.first_name} />
              <ProfileField label="Nom" value={user?.last_name} />

              <ProfileField label="Email" value={user?.email} />
              <ProfileField label="Nom d'utilisateur" value={user?.username} />

              {user?.role === 'STUDENT' && (
                <>
                  <ProfileField label="Numéro d'étudiant" value={profile?.student_number} />
                  <ProfileField label="Filière" value={profile?.filiere} />
                  <ProfileField label="Niveau d'anglais" value={profile?.english_level} />
                  <ProfileField label="Rang général" value={profile?.general_rank} />
                  <ProfileField label="Moyenne (GPA)" value={profile?.gpa?.toFixed(2)} />
                  <ProfileField label="Promotion" value={profile?.promotion} />
                </>
              )}

              {user?.role === 'TEACHER' && (
                <>
                  <ProfileField label="Département" value={profile?.department} />
                  <ProfileField label="Bureau" value={profile?.office} />
                  <ProfileField label="Téléphone" value={profile?.phone} />
                </>
              )}

              {user?.role === 'TEACHER' && profile?.bio && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-500 mb-1">
                    Biographie
                  </label>
                  <p className="text-slate-900">{profile.bio}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                {user?.role === 'STUDENT' && (
                  <>
                    <TextInput
                      label="Numéro d'étudiant"
                      name="student_number"
                      value={formData.student_number}
                      onChange={handleChange}
                      disabled
                      helperText="Ce champ ne peut pas être modifié"
                    />

                    <TextInput
                      label="Filière"
                      name="filiere"
                      value={formData.filiere}
                      onChange={handleChange}
                    />

                    <Select
                      label="Niveau d'anglais"
                      name="english_level"
                      value={formData.english_level || ''}
                      onChange={handleChange}
                      options={[
                        { value: '', label: 'Sélectionnez votre niveau' },
                        { value: 'A1', label: 'A1 - Débutant' },
                        { value: 'A2', label: 'A2 - Élémentaire' },
                        { value: 'B1', label: 'B1 - Intermédiaire' },
                        { value: 'B2', label: 'B2 - Avancé' },
                        { value: 'C1', label: 'C1 - Autonome' },
                        { value: 'C2', label: 'C2 - Maîtrise' }
                      ]}
                    />

                    <TextInput
                      label="Promotion"
                      name="promotion"
                      value={formData.promotion}
                      onChange={handleChange}
                      placeholder="Ex: 2025"
                    />
                  </>
                )}

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
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Biographie
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
                    placeholder="Parlez-nous de vous, vos domaines d'expertise..."
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <Button variant="primary" onClick={handleSave}>
                  <span className="flex items-center gap-2">
                    <SaveIcon />
                    Enregistrer
                  </span>
                </Button>
                <Button variant="outline" onClick={() => {
                  setEditing(false)
                  setError('')
                  loadProfile()
                }}>
                  <span className="flex items-center gap-2">
                    <CancelIcon />
                    Annuler
                  </span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-900">Statistiques</h3>
        </div>
        
        <div className="p-6">
          {user?.role === 'TEACHER' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatItem 
                value={profile?.projects_count || 0} 
                label="Projets créés" 
                color="blue" 
              />
              <StatItem 
                value={profile?.students_count || 0} 
                label="Étudiants supervisés" 
                color="emerald" 
              />
              <StatItem 
                value={profile?.active_projects_count || 0} 
                label="Projets actifs" 
                color="purple" 
              />
              <StatItem 
                value={0} 
                label="Groupes formés" 
                color="amber" 
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatItem 
                value={profile?.projects_count || 0} 
                label="Projets inscrits" 
                color="blue" 
              />
              <StatItem 
                value={profile?.assignments_count || 0} 
                label="Affectations" 
                color="purple" 
              />
              <StatItem 
                value={profile?.gpa ? profile.gpa.toFixed(2) : 'N/A'} 
                label="Moyenne" 
                color="emerald" 
              />
              <StatItem 
                value={profile?.language_level || 'N/A'} 
                label="Anglais" 
                color="amber" 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper components
function ProfileField({ label, value }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-500 mb-1">
        {label}
      </label>
      <p className="text-slate-900 font-medium">{value || 'Non renseigné'}</p>
    </div>
  )
}

function StatItem({ value, label, color }) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    purple: 'text-purple-600 bg-purple-50',
    amber: 'text-amber-600 bg-amber-50'
  }
  
  return (
    <div className={`p-4 rounded-xl ${colorClasses[color].split(' ')[1]}`}>
      <p className={`text-3xl font-bold ${colorClasses[color].split(' ')[0]}`}>{value}</p>
      <p className="text-sm text-slate-600 mt-1">{label}</p>
    </div>
  )
}
