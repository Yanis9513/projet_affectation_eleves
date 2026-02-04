import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { Loading, Alert } from '../components/Loading';
import ConfirmModal from '../components/ConfirmModal';
import { ProjectTypeBadge } from '../components/StatusBadge';
import { useProjects, useDeleteProject } from '../services/useQuery';

// Icones
const ProjectIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, projectId: null, projectTitle: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Utilisation du hook useProjects avec cache
  const { data: projects = [], isLoading: loading, refetch } = useProjects();
  const deleteProject = useDeleteProject();

  const handleDeleteClick = (project) => {
    setDeleteModal({
      isOpen: true,
      projectId: project.id,
      projectTitle: project.title
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProject.mutate(deleteModal.projectId);
      setSuccess(`Projet "${deleteModal.projectTitle}" supprime avec succes`);
      refetch(); // Rafraichir la liste
      setDeleteModal({ isOpen: false, projectId: null, projectTitle: '' });
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Erreur lors de la suppression du projet');
      setDeleteModal({ isOpen: false, projectId: null, projectTitle: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, projectId: null, projectTitle: '' });
  };

  if (loading) {
    return <Loading />;
  }

  const activeProjects = projects.filter(p => p.is_active);
  const totalStudents = projects.reduce((sum, p) => sum + (p.students?.length || 0), 0);
  const openForPreferences = projects.filter(p => p.is_open_for_preferences).length;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header - Plus sobre */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Tableau de bord
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Gérez vos projets et affectations</p>
        </div>
        
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/teacher/create-project')}
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau projet
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} className="mb-4" />}
      
      {/* Stats - Layout asymétrique avec tailles variables */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="text-slate-400">
              <ProjectIcon />
            </div>
            <div>
              <p className="text-xl font-semibold text-slate-900">{projects.length}</p>
              <p className="text-xs text-slate-500">Projets</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="text-emerald-500">
              <CheckIcon />
            </div>
            <div>
              <p className="text-xl font-semibold text-slate-900">{activeProjects.length}</p>
              <p className="text-xs text-slate-500">Actifs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="text-blue-500">
              <UsersIcon />
            </div>
            <div>
              <p className="text-xl font-semibold text-slate-900">{totalStudents}</p>
              <p className="text-xs text-slate-500">Étudiants</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="text-amber-500">
              <ClockIcon />
            </div>
            <div>
              <p className="text-xl font-semibold text-slate-900">{openForPreferences}</p>
              <p className="text-xs text-slate-500">En attente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List - Plus compact */}
      <div>
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">Mes projets</h2>
        
        {projects.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <p className="text-slate-500 mb-4">Aucun projet créé</p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/teacher/create-project')}
            >
              Créer un projet
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={() => navigate(`/projects/${project.id}`)}
                onEdit={() => navigate(`/teacher/edit-project/${project.id}`)}
                onDelete={() => handleDeleteClick(project)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Supprimer le Projet"
        message={`Etes-vous sur de vouloir supprimer le projet "${deleteModal.projectTitle}" ? Cette action est irreversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}

// Composant ProjectCard - Design plus épuré
function ProjectCard({ project, onView, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-slate-900 truncate">{project.title}</h3>
            {project.is_active && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
            )}
          </div>
          
          {project.description && (
            <p className="text-slate-500 text-sm line-clamp-1 mb-2">{project.description}</p>
          )}
          
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span>{project.students?.length || 0} étudiants</span>
            <span>•</span>
            <span>Groupe de {project.group_size || 'N/A'}</span>
            {project.project_type && (
              <>
                <span>•</span>
                <ProjectTypeBadge type={project.project_type} />
              </>
            )}
            {project.algorithm_ran && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Groupes formés
                </span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onView}
            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Voir"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button 
            onClick={onEdit}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Modifier"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button 
            onClick={onDelete}
            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Supprimer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
