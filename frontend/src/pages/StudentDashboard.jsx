import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardSimple } from '../components/Card';
import Button from '../components/Button';
import { Loading } from '../components/Loading';
import { useAuth } from '../context/AuthContext';
import { studentAPI, projectAPI, destinationAPI, destinationPreferenceAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [myProjects, setMyProjects] = useState([]);
  const [pendingPreferences, setPendingPreferences] = useState([]);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      
      // Get student profile
      const profileResponse = await studentAPI.getProfile();
      setStudent(profileResponse.data);
      
      // Get student's projects with pending preferences
      const projectsResponse = await projectAPI.getMyProjects();
      let projects = projectsResponse.data || [];
      
      // Check preferences status for each exchange program
      for (let project of projects) {
        if (project.project_type === 'exchange_program') {
          try {
            const prefResponse = await destinationPreferenceAPI.getMyPreferences(project.id);
            project.has_submitted_preferences = prefResponse.data && prefResponse.data.length > 0;
          } catch (err) {
            project.has_submitted_preferences = false;
          }
        }
      }
      
      setMyProjects(projects);
      
      // Find projects with pending preferences (exchange programs that are open and not submitted)
      const pending = projects.filter(project => 
        project.project_type === 'exchange_program' && 
        project.is_open_for_preferences &&
        !project.has_submitted_preferences
      );
      
      setPendingPreferences(pending);
      
    } catch (error) {
      console.error('Error loading student data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPreferences = (projectId) => {
    navigate(`/student/exchange-preferences/${projectId}`);
  };

  if (loading) {
    return <Loading text="Chargement de votre tableau de bord..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Tableau de Bord Étudiant
          </h1>
          <p className="text-gray-600">
            Bienvenue {student?.user?.first_name} {student?.user?.last_name}
          </p>
        </div>

        {/* Notifications - Pending Preferences */}
        {pendingPreferences.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Notifications ({pendingPreferences.length})
            </h2>
            {pendingPreferences.map(project => (
              <CardSimple 
                key={project.id} 
                className="mb-4 bg-orange-50 border-2 border-orange-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-semibold">
                        Action requise
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                        Programme d'échange
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {project.description}
                    </p>
                    {project.deadline && (
                      <p className="text-orange-600 text-sm font-medium">
                        Date limite: {new Date(project.deadline).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                  <Button 
                    variant="primary" 
                    onClick={() => handleSubmitPreferences(project.id)}
                  >
                    Noter les universités
                  </Button>
                </div>
              </CardSimple>
            ))}
          </div>
        )}

        {/* My Projects */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Mes Projets ({myProjects.length})
          </h2>
          
          {myProjects.length === 0 ? (
            <CardSimple className="text-center py-8">
              <p className="text-gray-600">
                Vous n'êtes inscrit à aucun projet pour le moment.
              </p>
            </CardSimple>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myProjects.map(project => (
                <CardSimple 
                  key={project.id}
                  className="hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800">{project.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      project.project_type === 'exchange_program' 
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {project.project_type === 'exchange_program' 
                        ? 'Échange'
                        : 'Groupe'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {project.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {project.project_type === 'exchange_program' && (
                        <span>
                          {project.destinations?.length || 0} universités
                        </span>
                      )}
                    </div>
                    
                    {project.is_open_for_preferences && !project.has_submitted_preferences && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        Préférences ouvertes
                      </span>
                    )}
                    {project.has_submitted_preferences && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        ✓ Préférences soumises
                      </span>
                    )}
                  </div>
                </CardSimple>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CardSimple 
            className="text-center cursor-pointer hover:shadow-md transition-all"
            onClick={() => navigate('/projects')}
          >
            <h3 className="font-bold text-gray-800 mb-2">Parcourir les Projets</h3>
            <p className="text-sm text-gray-600">
              Voir tous les projets disponibles
            </p>
          </CardSimple>

          <CardSimple 
            className="text-center cursor-pointer hover:shadow-md transition-all"
            onClick={() => navigate('/profile')}
          >
            <h3 className="font-bold text-gray-800 mb-2">Mon Profil</h3>
            <p className="text-sm text-gray-600">
              Modifier mes informations
            </p>
          </CardSimple>

          <CardSimple 
            className="text-center cursor-pointer hover:shadow-md transition-all"
            onClick={() => navigate('/my-preferences')}
          >
            <h3 className="font-bold text-gray-800 mb-2">Mes Préférences</h3>
            <p className="text-sm text-gray-600">
              Voir mes préférences actuelles
            </p>
          </CardSimple>
        </div>
      </div>
    </div>
  );
}
