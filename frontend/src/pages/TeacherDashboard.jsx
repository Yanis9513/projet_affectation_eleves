import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardSimple } from '../components/Card';
import Button from '../components/Button';
import { Loading, Alert } from '../components/Loading';
import ConfirmModal from '../components/ConfirmModal';
import { projectAPI } from '../services/api';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, projectId: null, projectTitle: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await projectAPI.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (project) => {
    setDeleteModal({
      isOpen: true,
      projectId: project.id,
      projectTitle: project.title
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await projectAPI.delete(deleteModal.projectId);
      setSuccess(`Projet "${deleteModal.projectTitle}" supprimé avec succès`);
      setProjects(projects.filter(p => p.id !== deleteModal.projectId));
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Tableau de Bord Enseignant
            </h1>
            <p className="text-gray-600">Gérez vos projets et affectations</p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/profile')}
            >
              Mon Profil
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/teacher/create-project')}
            >
              Créer un Nouveau Projet
            </Button>
          </div>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} className="mb-4" />}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <CardSimple className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <p className="text-gray-700 text-sm font-medium mb-1">Mes Projets</p>
            <p className="text-4xl font-bold text-esiee-blue">{projects.length}</p>
          </CardSimple>
          
          <CardSimple className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <p className="text-gray-700 text-sm font-medium mb-1">Projets Actifs</p>
            <p className="text-4xl font-bold text-green-600">{activeProjects.length}</p>
          </CardSimple>
          
          <CardSimple className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <p className="text-gray-700 text-sm font-medium mb-1">Total Étudiants</p>
            <p className="text-4xl font-bold text-purple-600">{totalStudents}</p>
          </CardSimple>
          
          <CardSimple className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <p className="text-gray-700 text-sm font-medium mb-1">En Attente</p>
            <p className="text-4xl font-bold text-yellow-600">
              {projects.filter(p => p.is_open_for_preferences).length}
            </p>
          </CardSimple>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Mes Projets</h2>
          
          {projects.length === 0 ? (
            <CardSimple className="text-center py-12">
              <div className="text-6xl mb-4">📁</div>
              <p className="text-gray-600 mb-4">Aucun projet créé</p>
              <Button
                variant="primary"
                onClick={() => navigate('/teacher/create-project')}
              >
                Créer votre premier projet
              </Button>
            </CardSimple>
          ) : (
            projects.map(project => (
              <CardSimple key={project.id} className="hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{project.title}</h3>
                      {project.is_active ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          Actif
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                          Inactif
                        </span>
                      )}
                      {project.is_open_for_preferences && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          Ouvert aux préférences
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{project.description}</p>
                    
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>📊 {project.students?.length || 0}/{project.max_students} étudiants</span>
                      <span>👥 Taille de groupe: {project.group_size || 'N/A'}</span>
                      {project.project_type && (
                        <span>🎯 Type: {project.project_type}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      👁️ Voir Détails
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/teacher/edit-project/${project.id}`)}
                    >
                      ✏️ Modifier
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteClick(project)}
                    >
                      🗑️ Supprimer
                    </Button>
                  </div>
                </div>
              </CardSimple>
            ))
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          title="Supprimer le Projet"
          message={`Êtes-vous sûr de vouloir supprimer le projet "${deleteModal.projectTitle}" ? Cette action est irréversible.`}
          confirmText="Supprimer"
          cancelText="Annuler"
          variant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      </div>
    </div>
  );
}
