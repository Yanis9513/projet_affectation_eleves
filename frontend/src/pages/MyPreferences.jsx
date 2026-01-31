import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardSimple } from '../components/Card';
import Button from '../components/Button';
import { Loading } from '../components/Loading';
import { projectAPI, destinationPreferenceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function MyPreferences() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState([]);

  useEffect(() => {
    loadAllPreferences();
  }, []);

  const loadAllPreferences = async () => {
    try {
      setLoading(true);
      
      // Get all my projects
      const projectsResponse = await projectAPI.getMyProjects();
      const projects = projectsResponse.data || [];
      
      // For each exchange program project, get preferences
      const allPreferences = [];
      
      for (const project of projects) {
        if (project.project_type === 'exchange_program') {
          try {
            const prefResponse = await destinationPreferenceAPI.getMyPreferences(project.id);
            const projectPrefs = prefResponse.data || [];
            
            if (projectPrefs.length > 0) {
              allPreferences.push({
                project: project,
                preferences: projectPrefs,
                submittedAt: projectPrefs[0]?.created_at
              });
            }
          } catch (err) {
            // No preferences for this project yet
          }
        }
      }
      
      setPreferences(allPreferences);
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Erreur lors du chargement des préférences');
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
            Consultez les préférences que vous avez soumises pour vos programmes d'échange
          </p>
        </div>

        {preferences.length === 0 ? (
          <CardSimple className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Aucune préference soumise
            </h3>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas encore soumis de préférences pour vos programmes d'échange.
            </p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/student')}
            >
              Voir mes projets
            </Button>
          </CardSimple>
        ) : (
          <div className="space-y-6">
            {preferences.map((item) => (
              <CardSimple key={item.project.id} className="bg-white">
                {/* Project Header */}
                <div className="border-b pb-4 mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-gray-800">
                      {item.project.title}
                    </h2>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      Préférences soumises
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    {item.project.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    Soumis le: {new Date(item.submittedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {/* Preferences List */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Vos choix ({item.preferences.length} universités)
                  </h3>
                  
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
        )}
      </div>
    </div>
  );
}
