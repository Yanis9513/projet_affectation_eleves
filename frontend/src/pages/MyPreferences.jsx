import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardSimple } from '../components/Card';
import Button from '../components/Button';
import { Loading } from '../components/Loading';
import { projectAPI, destinationPreferenceAPI, preferenceAPI, studentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function MyPreferences() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    exchange: [],
    group: [],
    english: []
  });

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
        
        // Cache student_id in localStorage if not present
        let currentUser = JSON.parse(localStorage.getItem('user'));
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
      
      for (const project of projects) {
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
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const prefResponse = await preferenceAPI.getStudentPreferences(currentUser.student_id);
            const projectPrefs = prefResponse.data?.filter(p => p.project_id === project.id) || [];
            
            if (projectPrefs.length > 0) {
              groupPrefs.push({
                project: project,
                preferences: projectPrefs,
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
      }
      
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
      case 'A': return 'bg-green-500 text-white';
      case 'B': return 'bg-green-400 text-white';
      case 'C': return 'bg-blue-400 text-white';
      case 'D': return 'bg-yellow-400 text-white';
      case 'E': return 'bg-orange-400 text-white';
      case 'F': return 'bg-red-400 text-white';
      default: return 'bg-gray-200 text-gray-700';
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
      case 'A2': return 'bg-green-500 text-white';
      case 'A1': return 'bg-green-400 text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  const hasAnyPreferences = () => {
    return preferences.exchange.length > 0 || 
           preferences.group.length > 0 || 
           preferences.english.length > 0;
  };

  if (loading) {
    return <Loading text="Chargement de vos préférences..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/student')}
            className="mb-4"
          >
            ← Retour au tableau de bord
          </Button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Mes Préférences
          </h1>
          <p className="text-gray-600">
            Consultez les préférences que vous avez soumises pour vos projets
          </p>
        </div>

        {!hasAnyPreferences() ? (
          <CardSimple className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Aucune préférence soumise
            </h3>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas encore soumis de préférences pour vos projets.
            </p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/student')}
            >
              Voir mes projets
            </Button>
          </CardSimple>
        ) : (
          <div className="space-y-8">
            {/* Exchange Program Preferences */}
            {preferences.exchange.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                  Programmes d'Échange
                </h2>
                <div className="space-y-6">
                  {preferences.exchange.map((item) => (
                    <CardSimple key={item.project.id} className="bg-white">
                      {/* Project Header */}
                      <div className="border-b pb-4 mb-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-gray-800">
                            {item.project.title}
                          </h3>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                            Préférences soumises
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          {item.project.description}
                        </p>
                        {item.submittedAt && (
                          <p className="text-sm text-gray-500">
                            Soumis le: {new Date(item.submittedAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>

                      {/* Preferences List */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-700 mb-3">
                          Vos choix ({item.preferences.length} universités)
                        </h4>
                        
                        {/* Sort by grade (A first) */}
                        {[...item.preferences]
                          .sort((a, b) => a.grade.localeCompare(b.grade))
                          .map((pref) => (
                          <div 
                            key={pref.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${getGradeColor(pref.grade)}`}>
                                {pref.grade}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">
                                  {pref.destination?.university_name || 'Université'}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {pref.destination?.city}, {pref.destination?.country}
                                </div>
                                <div className={`text-xs font-medium mt-1 ${getGradeColor(pref.grade).replace('bg-', 'text-').replace(' text-white', '')}`}>
                                  {getGradeDescription(pref.grade)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="mt-6 pt-4 border-t flex gap-3">
                        {item.project.is_open_for_preferences && (
                          <Button 
                            variant="outline"
                            onClick={() => navigate(`/student/exchange-preferences/${item.project.id}`)}
                          >
                            Modifier mes préférences
                          </Button>
                        )}
                        <Button 
                          variant="outline"
                          onClick={() => navigate(`/projects/${item.project.id}`)}
                        >
                          Voir le projet
                        </Button>
                      </div>
                    </CardSimple>
                  ))}
                </div>
              </div>
            )}

            {/* Group Project Preferences */}
            {preferences.group.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  Projets de Groupe
                </h2>
                <div className="space-y-6">
                  {preferences.group.map((item) => (
                    <CardSimple key={item.project.id} className="bg-white">
                      {/* Project Header */}
                      <div className="border-b pb-4 mb-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-gray-800">
                            {item.project.title}
                          </h3>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                            Préférences soumises
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          {item.project.description}
                        </p>
                        {item.submittedAt && (
                          <p className="text-sm text-gray-500">
                            Soumis le: {new Date(item.submittedAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>

                      {/* Partner Preferences */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-700 mb-3">
                          Vos préférences de partenaire
                        </h4>
                        {item.preferences.map((pref) => (
                          <div key={pref.id} className="p-3 bg-gray-50 rounded-lg">
                            {pref.preferred_partner_id ? (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                  👤
                                </div>
                                <div>
                                  <div className="font-medium text-gray-800">
                                    Partenaire préféré ID: {pref.preferred_partner_id}
                                  </div>
                                  <div className="text-sm text-blue-600">
                                    Vous avez choisi de travailler avec ce partenaire
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-600">
                                Aucune préférence de partenaire spécifiée
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="mt-6 pt-4 border-t flex gap-3">
                        {item.project.is_open_for_preferences && (
                          <Button 
                            variant="outline"
                            onClick={() => navigate(`/student/form/${item.project.id}`)}
                          >
                            Modifier mes préférences
                          </Button>
                        )}
                        <Button 
                          variant="outline"
                          onClick={() => navigate(`/projects/${item.project.id}`)}
                        >
                          Voir le projet
                        </Button>
                      </div>
                    </CardSimple>
                  ))}
                </div>
              </div>
            )}

            {/* English Leveling Projects */}
            {preferences.english.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  Niveaux d'Anglais
                </h2>
                <div className="space-y-6">
                  {preferences.english.map((item, index) => {
                    const projectTitle = typeof item.project?.title === 'string' ? item.project.title : 'Projet sans titre';
                    const projectDescription = typeof item.project?.description === 'string' ? item.project.description : '';
                    
                    return (
                    <CardSimple key={item.project?.id || index} className="bg-white">
                      {/* Project Header */}
                      <div className="border-b pb-4 mb-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-gray-800">
                            {projectTitle}
                          </h3>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                            Confirmé
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          {projectDescription}
                        </p>
                      </div>

                      {/* English Level Info */}
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold text-xl ${getEnglishLevelColor(item.englishLevel)}`}>
                            {item.englishLevel}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">
                              Votre niveau d'anglais
                            </div>
                            <div className="text-sm text-gray-600">
                              Vous serez groupé avec des étudiants du même niveau
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Note */}
                      <div className="mt-4 text-sm text-gray-600 bg-yellow-50 p-3 rounded">
                        <strong>Note:</strong> Votre niveau d'anglais est automatiquement déterminé à partir de votre profil. Pour le modifier, allez dans la section "Mon Profil".
                      </div>

                      {/* Actions */}
                      <div className="mt-6 pt-4 border-t flex gap-3">
                        <Button 
                          variant="outline"
                          onClick={() => navigate(`/projects/${item.project?.id}`)}
                        >
                          Voir le projet
                        </Button>
                      </div>
                    </CardSimple>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
