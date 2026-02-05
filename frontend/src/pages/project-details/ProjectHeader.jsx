import Button from '../../components/Button';
import { ProjectTypeBadge, ActiveBadge, PreferencesBadge } from '../../components/StatusBadge';

/**
 * Header du projet avec titre, badges et actions
 */
export default function ProjectHeader({ 
  project, 
  isTeacher, 
  onBack, 
  onEdit, 
  onDelete,
  onToggleUpload,
  showUpload 
}) {
  return (
    <div className="mb-6 animate-fade-in">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" onClick={onBack}>
          ← Retour aux projets
        </Button>
        
        {isTeacher && (
          <div className="flex gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={onToggleUpload}
            >
              {showUpload ? 'Fermer' : 'Ajouter des Etudiants'}
            </Button>
            <Button
              variant="secondary"
              onClick={onEdit}
            >
              Modifier
            </Button>
            <Button
              variant="danger"
              onClick={onDelete}
            >
              Supprimer
            </Button>
          </div>
        )}
      </div>

      {/* Project Info Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <h1 className="text-2xl font-bold text-slate-900">{project.title}</h1>
              <ActiveBadge isActive={project.is_active} />
              {project.is_open_for_preferences && (
                <PreferencesBadge isOpen={true} />
              )}
              {project.project_type && (
                <ProjectTypeBadge type={project.project_type} />
              )}
            </div>
            
            <p className="text-slate-600 mb-4">{project.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-500">Max etudiants</p>
                <p className="text-xl font-bold text-slate-900">{project.max_students}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-500">Taille groupe</p>
                <p className="text-xl font-bold text-slate-900">{project.group_size || 'N/A'}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-500">Inscrits</p>
                <p className="text-xl font-bold text-blue-600">{project.students?.length || 0}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-500">Places restantes</p>
                <p className="text-xl font-bold text-emerald-600">
                  {project.max_students - (project.students?.length || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
