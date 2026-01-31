import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardSimple } from '../components/Card';
import Button from '../components/Button';
import { Loading } from '../components/Loading';
import { useAuth } from '../context/AuthContext';
import { studentAPI, projectAPI, destinationPreferenceAPI, preferenceAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [myProjects, setMyProjects] = useState([]);
  const [pendingActions, setPendingActions] = useState([]);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      
      // Get student profile
      const profileResponse = await studentAPI.getProfile();
      setStudent(profileResponse.data);
      
      // Get student's projects
      const projectsResponse = await projectAPI.getMyProjects();
      let projects = projectsResponse.data || [];
      
      // Check status for each project type
      for (let project of projects) {
        if (project.project_type === 'exchange_program') {
          // Check exchange program preferences (A-F grades)
          try {
            const prefResponse = await destinationPreferenceAPI.getMyPreferences(project.id);
            project.has_submitted_preferences = prefResponse.data && prefResponse.data.length > 0;
          } catch (err) {
            project.has_submitted_preferences = false;
          }
        } else if (project.project_type === 'group_project') {
          // Check group project partner preferences
          try {
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const prefResponse = await preferenceAPI.getStudentPreferences(currentUser.id);
            // Check if student has preferences for this specific project
            const projectPrefs = prefResponse.data?.filter(p => p.project_id === project.id);
            project.has_submitted_preferences = projectPrefs && projectPrefs.length > 0;
          } catch (err) {
            project.has_submitted_preferences = false;
          }
        } else if (project.project_type === 'english_leveling') {
          // English leveling - no action needed from student (level comes from profile)
          project.has_submitted_preferences = true; // Auto-confirmed from profile
        }
      }
      
      setMyProjects(projects);
      
      // Find projects with pending actions
      const pending = [];
      
      for (let project of projects) {
        if (!project.is_open_for_preferences) continue;
        
        if (project.project_type === 'exchange_program' && !project.has_submitted_preferences) {
          pending.push({
            ...project,
            actionType: 'exchange_preferences',
            actionLabel: 'Noter les universités',
            badgeColor: 'bg-purple-100 text-purple-800',
            badgeLabel: 'Programme d\'échange'
          });
        } else if (project.project_type === 'group_project' && !project.has_submitted_preferences) {
          pending.push({
            ...project,
            actionType: 'partner_preferences',
            actionLabel: 'Choisir un partenaire',
            badgeColor: 'bg-blue-100 text-blue-800',
            badgeLabel: 'Projet de groupe'
          });
        }
        // English leveling doesn't need student action
      }
      
      setPendingActions(pending);
      
    } catch (error) {
      console.error('Error loading student data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (project) => {
    if (project.actionType === 'exchange_preferences') {
      navigate(`/student/exchange-preferences/${project.id}`);
    } else if (project.actionType === 'partner_preferences') {
      navigate(`/student/form/${project.id}`);
    }
  };

  const getProjectTypeBadge = (type) => {
    switch(type) {
      case 'exchange_program':
        return { color: 'bg-purple-100 text-purple-800', label: 'Échange' };
      case 'english_leveling':
        return { color: 'bg-green-100 text-green-800', label: 'Niveau d\'anglais' };
      case 'group_project':
        return { color: 'bg-blue-100 text-blue-800', label: 'Groupe' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: type };
    }
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

        {/* Notifications - Pending Actions */}
        {pendingActions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Actions Requises ({pendingActions.length})
            </h2>
            {pendingActions.map(project => (
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
                      <span className={`px-2 py-1 rounded text-xs ${project.badgeColor}`}>
                        {project.badgeLabel}
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
                    onClick={() => handleAction(project)}
                  >
                    {project.actionLabel}
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
              {myProjects.map(project => {
                const badge = getProjectTypeBadge(project.project_type);
                return (
                  <CardSimple 
                    key={project.id}
                    className="hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-800">{project.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${badge.color}`}>
                        {badge.label}
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
                        {project.project_type === 'group_project' && (
                          <span>
                            {project.group_size || project.min_students || '?'} étudiants/groupe
                          </span>
                        )}
                        {project.project_type === 'english_leveling' && student?.english_level && (
                          <span>
                            Votre niveau: <strong>{student.english_level}</strong>
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
                );
              })}
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
