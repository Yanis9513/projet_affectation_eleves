import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { Loading } from '../components/Loading';
import { projectAPI, destinationPreferenceAPI, preferenceAPI, studentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import CountryFlag from 'react-country-flag';
import { getCountryCode } from '../utils/countryFlags';

// SVG Icons
const ArrowLeftIcon = () => (
  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
)

const ClipboardIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
)

// PreferenceCard component for rendering different preference types
const PreferenceCard = ({ item, navigate, getGradeColor, getGradeDescription, getEnglishLevelColor }) => {
  const { type, project, preferences, submittedAt, englishLevel } = item;
  
  // Determine the status badge based on algorithm_ran only
  // algorithm_ran = true means groups have been formed by the teacher
  const isFormed = project?.algorithm_ran || false;
  
  const statusBadge = isFormed 
    ? { text: 'Groupes formés', className: 'bg-blue-100 text-blue-700' }
    : { text: 'Préférences soumises', className: 'bg-emerald-100 text-emerald-700' };
  
  // Type indicator colors
  const typeColors = {
    exchange: { dot: 'bg-purple-500', label: 'Programme d\'Échange' },
    group: { dot: 'bg-blue-500', label: 'Projet de Groupe' },
    english: { dot: 'bg-emerald-500', label: 'Niveau d\'Anglais' }
  };
  
  const projectTitle = typeof project?.title === 'string' ? project.title : 'Projet sans titre';
  const projectDescription = typeof project?.description === 'string' ? project.description : '';
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      {/* Project Header */}
      <div className="border-b border-slate-200 pb-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`w-2.5 h-2.5 rounded-full ${typeColors[type].dot}`}></span>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {typeColors[type].label}
          </span>
        </div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-slate-900">
            {projectTitle}
          </h3>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.className}`}>
            {statusBadge.text}
          </span>
        </div>
        <p className="text-slate-600 text-sm mb-2">
          {projectDescription}
        </p>
        {submittedAt && (
          <p className="text-sm text-slate-500">
            Soumis le: {new Date(submittedAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        )}
      </div>

      {/* Content based on type */}
      {type === 'exchange' && preferences && (
        <div className="space-y-3">
          <h4 className="font-medium text-slate-700 mb-3">
            Vos choix ({preferences.length} universités)
          </h4>
          {[...preferences]
            .sort((a, b) => a.grade.localeCompare(b.grade))
            .map((pref) => (
            <div 
              key={pref.id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${getGradeColor(pref.grade)}`}>
                  {pref.grade}
                </div>
                <div>
                  <div className="font-medium text-slate-900">
                    {pref.destination?.university_name || 'Université'}
                  </div>
                  
                      {pref.destination && (
                        <span className="inline-flex items-center gap-2">
                          {pref.destination.city && <span>{pref.destination.city},</span>}
                          {pref.destination.country && getCountryCode(pref.destination.country) && (
                            <CountryFlag
                              countryCode={getCountryCode(pref.destination.country)}
                              svg
                              style={{
                                width: '1.5em',
                                height: '1.1em',
                                border: '1px solid rgba(0,0,0,0.1)',
                                borderRadius: '2px',
                                display: 'block',
                                objectFit: 'cover'
                              }}
                            />
                          )}
                          {pref.destination.country && (
                            <span title={pref.destination.country}>{pref.destination.country}</span>
                          )}
                        </span>
                      )}
                  <div className={`text-xs font-medium mt-1 ${getGradeColor(pref.grade).replace('bg-', 'text-').replace(' text-white', '')}`}>
                    {getGradeDescription(pref.grade)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {type === 'group' && preferences && (
        <div className="space-y-3">
          <h4 className="font-medium text-slate-700 mb-3">
            Vos préférences de partenaire
          </h4>
          {preferences.map((pref) => (
            <div key={pref.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              {pref.preferred_partner_id ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">
                      Partenaire préféré: {pref.preferred_partner_name || `Étudiant #${pref.preferred_partner_id}`}
                    </div>
                    <div className="text-sm text-blue-600">
                      Vous avez choisi de travailler avec ce partenaire
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-slate-600">
                  Aucune préférence de partenaire spécifiée
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {type === 'english' && (
        <>
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-xl ${getEnglishLevelColor(englishLevel)}`}>
                {englishLevel}
              </div>
              <div>
                <div className="font-medium text-slate-900">
                  Votre niveau d'anglais
                </div>
                <div className="text-sm text-slate-600">
                  Vous serez groupé avec des étudiants du même niveau
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
            <strong className="text-amber-800">Note:</strong> Votre niveau d'anglais est automatiquement déterminé à partir de votre profil. Pour le modifier, allez dans la section "Mon Profil".
          </div>
        </>
      )}

      {/* Actions */}
      <div className="mt-6 pt-4 border-t border-slate-200 flex gap-3">
        {type === 'exchange' && project?.is_open_for_preferences && (
          <Button 
            variant="secondary"
            onClick={() => navigate(`/student/exchange-preferences/${project.id}`)}
          >
            Modifier mes préférences
          </Button>
        )}
        {type === 'group' && project?.is_open_for_preferences && (
          <Button 
            variant="secondary"
            onClick={() => navigate(`/student/form/${project.id}`)}
          >
            Modifier mes préférences
          </Button>
        )}
        <Button 
          variant="secondary"
          onClick={() => navigate(`/projects/${project?.id}`)}
        >
          Voir le projet
        </Button>
      </div>
    </div>
  );
};

export default function MyPreferences() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    exchange: [],
    group: [],
    english: []
  });
  
  // Pagination and filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'formed', 'pending'
  const ITEMS_PER_PAGE = 5;

  const [studentProfile, setStudentProfile] = useState(null);

  useEffect(() => {
    loadAllPreferences();
  }, []);

  const loadAllPreferences = async () => {
    try {
      setLoading(true);
      
      // Load student profile to get English level and student_id
      let englishLevel = 'Non défini';
      let studentId = null;
      try {
        const profileResponse = await studentAPI.getProfile();
        setStudentProfile(profileResponse.data);
        englishLevel = profileResponse.data?.language_level || profileResponse.data?.english_level || 'Non défini';
        studentId = profileResponse.data?.id;
        
        // Cache student_id in localStorage if not present (with safe parsing)
        let currentUser = {};
        try {
          currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
        if (studentId && currentUser && !currentUser.student_id) {
          currentUser.student_id = studentId;
          localStorage.setItem('user', JSON.stringify(currentUser));
        }
      } catch (err) {
        console.error('Error loading student profile:', err);
      }
      
      // Get all my projects
      const projectsResponse = await projectAPI.getMyProjects();
      const projects = projectsResponse.data || [];
      
      const exchangePrefs = [];
      const groupPrefs = [];
      const englishPrefs = [];
      
      // Fetch preferences for all projects in parallel
      await Promise.all(projects.map(async (project) => {
        if (project.project_type === 'exchange_program') {
          try {
            const prefResponse = await destinationPreferenceAPI.getMyPreferences(project.id);
            const projectPrefs = prefResponse.data || [];
            
            if (projectPrefs.length > 0) {
              exchangePrefs.push({
                project: project,
                preferences: projectPrefs,
                submittedAt: projectPrefs[0]?.created_at
              });
            }
          } catch (err) {
            // No preferences for this project yet
          }
        } else if (project.project_type === 'group_project') {
          try {
            let currentUser = {};
            try {
              currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            } catch (e) {
              console.error('Error parsing user from localStorage:', e);
            }
            const prefResponse = await preferenceAPI.getStudentPreferences(currentUser.student_id);
            const projectPrefs = prefResponse.data?.filter(p => p.project_id === project.id) || [];
            
            if (projectPrefs.length > 0) {
              // Fetch students list to get partner names
              let studentsMap = {};
              try {
                const studentsResponse = await projectAPI.getStudents(project.id);
                const students = studentsResponse.data || [];
                students.forEach(s => {
                  studentsMap[s.id] = s.name || s.email || `Étudiant #${s.id}`;
                });
              } catch (e) {
                console.error('Error fetching students for partner names:', e);
              }
              
              // Enrich preferences with partner names
              const enrichedPrefs = projectPrefs.map(pref => ({
                ...pref,
                preferred_partner_name: pref.preferred_partner_id 
                  ? studentsMap[pref.preferred_partner_id] || `Étudiant #${pref.preferred_partner_id}`
                  : null
              }));
              
              groupPrefs.push({
                project: project,
                preferences: enrichedPrefs,
                submittedAt: projectPrefs[0]?.created_at
              });
            }
          } catch (err) {
            // No preferences for this project yet
          }
        } else if (project.project_type === 'english_leveling') {
          // English leveling - show confirmation that student is included
          englishPrefs.push({
            project: project,
            englishLevel: englishLevel,
            submittedAt: null // Auto-confirmed from profile
          });
        }
      }));
      
      setPreferences({
        exchange: exchangePrefs,
        group: groupPrefs,
        english: englishPrefs
      });
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Impossible de charger vos préférences.');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    switch(grade) {
      case 'A': return 'bg-emerald-500 text-white';
      case 'B': return 'bg-emerald-400 text-white';
      case 'C': return 'bg-blue-400 text-white';
      case 'D': return 'bg-amber-400 text-white';
      case 'E': return 'bg-orange-400 text-white';
      case 'F': return 'bg-red-400 text-white';
      default: return 'bg-slate-200 text-slate-700';
    }
  };

  const getGradeDescription = (grade) => {
    switch(grade) {
      case 'A': return 'Université préférée';
      case 'B': return 'Très intéressé';
      case 'C': return 'Intéressé';
      case 'D': return 'Acceptable';
      case 'E': return 'Peu intéressé';
      case 'F': return 'Dernier choix';
      default: return '';
    }
  };

  const getEnglishLevelColor = (level) => {
    switch(level) {
      case 'C2': return 'bg-purple-600 text-white';
      case 'C1': return 'bg-purple-500 text-white';
      case 'B2': return 'bg-blue-500 text-white';
      case 'B1': return 'bg-blue-400 text-white';
      case 'A2': return 'bg-emerald-500 text-white';
      case 'A1': return 'bg-emerald-400 text-white';
      default: return 'bg-slate-200 text-slate-700';
    }
  };

  const hasAnyPreferences = () => {
    return preferences.exchange.length > 0 || 
           preferences.group.length > 0 || 
           preferences.english.length > 0;
  };
  
  // Get all preferences as a flat array with type info
  const getAllPreferences = () => {
    const all = [];
    preferences.exchange.forEach(item => all.push({ ...item, type: 'exchange' }));
    preferences.group.forEach(item => all.push({ ...item, type: 'group' }));
    preferences.english.forEach(item => all.push({ ...item, type: 'english' }));
    
    // Sort by submission date (newest first), fallback to project creation date
    all.sort((a, b) => {
      const dateA = new Date(a.submittedAt || a.project?.created_at || 0);
      const dateB = new Date(b.submittedAt || b.project?.created_at || 0);
      return dateB - dateA;
    });
    
    return all;
  };
  
  // Filter preferences based on status
  const getFilteredPreferences = () => {
    const all = getAllPreferences();
    if (filterStatus === 'all') return all;
    
    return all.filter(item => {
      const isFormed = item.project?.algorithm_ran || false;
      return filterStatus === 'formed' ? isFormed : !isFormed;
    });
  };
  
  // Paginate preferences
  const getPaginatedPreferences = () => {
    const filtered = getFilteredPreferences();
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };
  
  const totalPages = Math.ceil(getFilteredPreferences().length / ITEMS_PER_PAGE);
  
  // Reset page when filter changes
  const handleFilterChange = (newFilter) => {
    setFilterStatus(newFilter);
    setCurrentPage(1);
  };

  if (loading) {
    return <Loading text="Chargement de vos préférences..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="secondary" 
            onClick={() => navigate('/student')}
            className="mb-4"
          >
            <ArrowLeftIcon />
            Retour au tableau de bord
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Mes Préférences
          </h1>
          <p className="text-slate-600">
            Consultez les préférences que vous avez soumises pour vos projets
          </p>
        </div>
        
        {/* Filter Buttons */}
        {hasAnyPreferences() && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-slate-600">Filtrer par:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFilterChange('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tous ({getAllPreferences().length})
                </button>
                <button
                  onClick={() => handleFilterChange('formed')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === 'formed' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Groupes formés ({getAllPreferences().filter(p => p.project?.algorithm_ran).length})
                </button>
                <button
                  onClick={() => handleFilterChange('pending')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === 'pending' 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Préférences soumises ({getAllPreferences().filter(p => !p.project?.algorithm_ran).length})
                </button>
              </div>
            </div>
          </div>
        )}

        {!hasAnyPreferences() ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
              <ClipboardIcon />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Aucune préférence soumise
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Vous n'avez pas encore soumis de préférences pour vos projets.
            </p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/student')}
            >
              Voir mes projets
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Render paginated items */}
            {getPaginatedPreferences().map((item) => (
              <PreferenceCard 
                key={`${item.type}-${item.project?.id}`} 
                item={item}
                navigate={navigate}
                getGradeColor={getGradeColor}
                getGradeDescription={getGradeDescription}
                getEnglishLevelColor={getEnglishLevelColor}
              />
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {hasAnyPreferences() && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 1 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Précédent
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === totalPages 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Suivant
            </button>
          </div>
        )}
        
        {/* Page info */}
        {hasAnyPreferences() && (
          <p className="text-center text-sm text-slate-500 mt-4">
            Affichage de {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, getFilteredPreferences().length)} à {Math.min(currentPage * ITEMS_PER_PAGE, getFilteredPreferences().length)} sur {getFilteredPreferences().length} préférences
          </p>
        )}
      </div>
    </div>
  );
}
