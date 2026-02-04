import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Card, { CardGrid } from '../components/Card';
import Button from '../components/Button';
import { SkeletonCard } from '../components/Loading';
import { projectAPI } from '../services/api';

const translateProjectType = (type) => {
  const translations = {
    'group_project': 'Projet de groupe',
    'english_leveling': 'Niveau d\'anglais',
    'exchange_program': 'Programme d\'échange'
  };
  return translations[type] || type.replace('_', ' ');
};

const getProjectTypeStyle = (type) => {
  const styles = {
    'group_project': 'bg-blue-100 text-blue-700',
    'english_leveling': 'bg-emerald-100 text-emerald-700',
    'exchange_program': 'bg-purple-100 text-purple-700'
  };
  return styles[type] || 'bg-slate-100 text-slate-700';
};

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const userRole = localStorage.getItem('userRole');
  const isTeacher = userRole && userRole.toLowerCase() === 'teacher';

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const userRole = localStorage.getItem('userRole');
      let response;
      
      if (userRole && userRole.toLowerCase() === 'student') {
        response = await projectAPI.getMyProjects();
      } else {
        response = await projectAPI.getAll();
      }
      
      const filtered = response.data.filter(p => p.is_active && p.is_open_for_preferences);
      setProjects(filtered);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Impossible de charger la liste des projets.');
    } finally {
      setLoading(false);
    }
  };

  const openProjectDetails = (project) => {
    navigate(`/projects/${project.id}`);
  };

  const filteredProjects = projects.filter(project => {
    const studentCount = project.students?.length || 0;
    
    // Availability filter
    let passesAvailabilityFilter = true;
    if (filter === 'available') passesAvailabilityFilter = studentCount < project.max_students;
    if (filter === 'full') passesAvailabilityFilter = studentCount >= project.max_students;
    
    // Type filter
    let passesTypeFilter = true;
    if (typeFilter !== 'all') passesTypeFilter = project.project_type === typeFilter;
    
    // Search filter
    let passesSearchFilter = true;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      passesSearchFilter = 
        project.title?.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query) ||
        project.teacher?.first_name?.toLowerCase().includes(query) ||
        project.teacher?.last_name?.toLowerCase().includes(query);
    }
    
    return passesAvailabilityFilter && passesTypeFilter && passesSearchFilter;
  });
  
  // Sort by creation date (newest first)
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const dateA = new Date(a.created_at || 0);
    const dateB = new Date(b.created_at || 0);
    return dateB - dateA;
  });

  const availableCount = projects.filter(p => (p.students?.length || 0) < p.max_students).length;
  const fullCount = projects.filter(p => (p.students?.length || 0) >= p.max_students).length;
  const groupProjectCount = projects.filter(p => p.project_type === 'group_project').length;
  const englishLevelingCount = projects.filter(p => p.project_type === 'english_leveling').length;
  const exchangeCount = projects.filter(p => p.project_type === 'exchange_program').length;
  
  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Projets disponibles</h1>
          <p className="text-slate-600">Chargement des projets...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Projets Disponibles
          </h1>
          <p className="text-slate-600">
            Découvrez les projets ouverts aux préférences
          </p>
        </div>
        {isTeacher && (
          <Button
            onClick={() => navigate('/teacher/create-project')}
            className="flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau Projet
          </Button>
        )}
      </div>

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
              <p className="text-2xl font-bold text-slate-900">{projects.length}</p>
              <p className="text-sm text-slate-500">Total Projets</p>
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
              <p className="text-2xl font-bold text-slate-900">{availableCount}</p>
              <p className="text-sm text-slate-500">Disponibles</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-xl text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{fullCount}</p>
              <p className="text-sm text-slate-500">Complets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Rechercher un projet, enseignant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-700 mb-2">Disponibilité</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tous ({projects.length})
              </button>
              <button
                onClick={() => setFilter('available')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === 'available' 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Disponibles ({availableCount})
              </button>
              <button
                onClick={() => setFilter('full')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === 'full' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Complets ({fullCount})
              </button>
            </div>
          </div>
          
          <div className="w-px h-8 bg-slate-200 hidden sm:block" />
          
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-700 mb-2">Type de projet</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  typeFilter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tous
              </button>
              {groupProjectCount > 0 && (
                <button
                  onClick={() => setTypeFilter('group_project')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    typeFilter === 'group_project' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Groupe ({groupProjectCount})
                </button>
              )}
              {englishLevelingCount > 0 && (
                <button
                  onClick={() => setTypeFilter('english_leveling')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    typeFilter === 'english_leveling' 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Anglais ({englishLevelingCount})
                </button>
              )}
              {exchangeCount > 0 && (
                <button
                  onClick={() => setTypeFilter('exchange_program')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    typeFilter === 'exchange_program' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Échange ({exchangeCount})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedProjects.map((project) => {
          const studentCount = project.students?.length || 0;
          const isAvailable = studentCount < project.max_students;
          
          return (
            <div
              key={project.id}
              onClick={() => openProjectDetails(project)}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer group"
            >
              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {isAvailable ? 'Disponible' : 'Complet'}
                </span>
                {project.project_type && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getProjectTypeStyle(project.project_type)}`}>
                    {translateProjectType(project.project_type)}
                  </span>
                )}
              </div>

              {/* Project Title */}
              <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                {project.title}
              </h3>

              {/* Description */}
              <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                {project.description}
              </p>

              {/* Project Info */}
              {project.target_filiere && (
                <div className="mb-4">
                  <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg">
                    {project.target_filiere}
                  </span>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="flex items-center gap-1.5 text-sm text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {studentCount}/{project.max_students}
                </span>
                <span className="text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Voir détails
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun projet trouvé</h3>
          <p className="text-slate-500 mb-6">
            {searchQuery ? `Aucun résultat pour "${searchQuery}"` : 'Aucun projet ne correspond à vos critères'}
          </p>
          {(searchQuery || filter !== 'all' || typeFilter !== 'all') && (
            <Button
              variant="secondary"
              onClick={() => {
                setSearchQuery('');
                setFilter('all');
                setTypeFilter('all');
              }}
            >
              Réinitialiser les filtres
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
