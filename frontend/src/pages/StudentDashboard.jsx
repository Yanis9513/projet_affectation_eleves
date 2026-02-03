import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      
      // Ensure student_id is in localStorage (with safe parsing)
      let currentUser = {};
      try {
        currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
      
      if (!currentUser?.student_id) {
        try {
          const profileResponse = await studentAPI.getProfile();
          const studentId = profileResponse.data?.id;
          
          if (studentId) {
            currentUser.student_id = studentId;
            localStorage.setItem('user', JSON.stringify(currentUser));
          }
        } catch (err) {
          console.error('Error fetching student profile for ID:', err);
        }
      }
      
      // Get student profile
      const profileResponse = await studentAPI.getProfile();
      setStudent(profileResponse.data);
      
      // Get student's projects
      const projectsResponse = await projectAPI.getMyProjects();
      let projects = projectsResponse.data || [];
      
      // Check status for each project type in parallel
      const studentId = currentUser?.student_id || profileResponse.data?.id;
      
      await Promise.all(projects.map(async (project) => {
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
            if (studentId) {
              const prefResponse = await preferenceAPI.getStudentPreferences(studentId);
              // Check if student has preferences for this specific project
              const projectPrefs = prefResponse.data?.filter(p => p.project_id === project.id);
              project.has_submitted_preferences = projectPrefs && projectPrefs.length > 0;
            } else {
              project.has_submitted_preferences = false;
            }
          } catch (err) {
            project.has_submitted_preferences = false;
          }
        } else if (project.project_type === 'english_leveling') {
          // English leveling - no action needed from student (level comes from profile)
          project.has_submitted_preferences = true; // Auto-confirmed from profile
        }
      }));
      
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
      toast.error('Impossible de charger vos projets. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (project) => {
    if (project.actionType === 'exchange_preferences') {
      navigate(`/student/exchange-preferences/${project.id}`);
    } else if (project.actionType === 'partner_preferences') {
      navigate(`/form/${project.id}`);
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
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Tableau de Bord
            </h1>
            <p className="text-slate-600 mt-1">
              Bienvenue, {student?.user?.first_name || 'Étudiant'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => navigate('/profile')}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Mon Profil
            </Button>
          </div>
        </div>
      </div>

      {/* Pending Actions Alert */}
      {pendingActions.length > 0 && (
        <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600 flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-900 mb-1">
                Actions requises ({pendingActions.length})
              </h3>
              <p className="text-amber-700 text-sm mb-4">
                Vous avez des préférences à soumettre pour les projets suivants.
              </p>
              <div className="space-y-3">
                {pendingActions.map(project => (
                  <div 
                    key={project.id}
                    className="flex items-center justify-between bg-white rounded-lg p-4 border border-amber-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${project.badgeColor}`}>
                        {project.badgeLabel}
                      </span>
                      <div>
                        <p className="font-medium text-slate-900">{project.title}</p>
                        {project.deadline && (
                          <p className="text-sm text-amber-600">
                            Date limite : {new Date(project.deadline).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="primary"
                      size="sm"
                      onClick={() => handleAction(project)}
                    >
                      {project.actionLabel}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{myProjects.length}</p>
              <p className="text-sm text-slate-500">Projets inscrits</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{pendingActions.length}</p>
              <p className="text-sm text-slate-500">Actions en attente</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {myProjects.filter(p => p.has_submitted_preferences).length}
              </p>
              <p className="text-sm text-slate-500">Préférences soumises</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Projects */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Mes Projets
          </h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
            Voir tous les projets
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
        
        {myProjects.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun projet</h3>
            <p className="text-slate-500 mb-6">Vous n'êtes inscrit à aucun projet pour le moment.</p>
            <Button variant="primary" onClick={() => navigate('/projects')}>
              Parcourir les projets
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myProjects.map(project => {
              const badge = getProjectTypeBadge(project.project_type);
              return (
                <div 
                  key={project.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer group"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                      {badge.label}
                    </span>
                    {project.has_submitted_preferences ? (
                      <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Soumis
                      </span>
                    ) : project.is_open_for_preferences ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        En attente
                      </span>
                    ) : null}
                  </div>
                  
                  <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {project.title}
                  </h3>
                  
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    {project.project_type === 'exchange_program' && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                        </svg>
                        {project.destinations?.length || 0} universités
                      </span>
                    )}
                    {project.project_type === 'group_project' && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {project.group_size || project.min_students || '?'} étudiants/groupe
                      </span>
                    )}
                    {project.project_type === 'english_leveling' && student?.english_level && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        Niveau : <strong className="text-slate-900">{student.english_level}</strong>
                      </span>
                    )}
                    
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Accès rapide
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/projects')}
            className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:shadow-md hover:border-blue-200 transition-all group"
          >
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600 inline-block mb-3 group-hover:bg-blue-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Parcourir les Projets</h3>
            <p className="text-sm text-slate-500">Voir tous les projets disponibles</p>
          </button>

          <button
            onClick={() => navigate('/my-preferences')}
            className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:shadow-md hover:border-purple-200 transition-all group"
          >
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600 inline-block mb-3 group-hover:bg-purple-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Mes Préférences</h3>
            <p className="text-sm text-slate-500">Voir mes préférences actuelles</p>
          </button>

          <button
            onClick={() => navigate('/my-assignments')}
            className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:shadow-md hover:border-emerald-200 transition-all group"
          >
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 inline-block mb-3 group-hover:bg-emerald-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Mes Affectations</h3>
            <p className="text-sm text-slate-500">Voir mes affectations finales</p>
          </button>
        </div>
      </div>
    </div>
  );
}
