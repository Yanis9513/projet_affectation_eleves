import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardGrid } from '../components/Card';
import Button from '../components/Button';
import { Loading } from '../components/Loading';
import { projectAPI } from '../services/api';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await projectAPI.getAll();
      setProjects(response.data.filter(p => p.is_active && p.is_open_for_preferences));
    } catch (error) {
      console.error('Error loading projects:', error);
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

  const availableCount = projects.filter(p => (p.students?.length || 0) < p.max_students).length;
  const fullCount = projects.filter(p => (p.students?.length || 0) >= p.max_students).length;
  const groupProjectCount = projects.filter(p => p.project_type === 'group_project').length;
  const englishLevelingCount = projects.filter(p => p.project_type === 'english_leveling').length;
  const exchangeCount = projects.filter(p => p.project_type === 'exchange_program').length;
  
  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Projets Disponibles
          </h1>
          <p className="text-gray-600">
            Découvrez les projets proposés par nos enseignants pour cette année
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-6 border-l-4 border-esiee-blue hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <p className="text-gray-700 text-sm font-medium mb-1">Total Projets</p>
            <p className="text-4xl font-bold text-gray-800">{projects.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <p className="text-gray-700 text-sm font-medium mb-1">Disponibles</p>
            <p className="text-4xl font-bold text-green-600">{availableCount}</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-white rounded-xl shadow-lg p-6 border-l-4 border-red-500 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <p className="text-gray-700 text-sm font-medium mb-1">Complets</p>
            <p className="text-4xl font-bold text-red-600">{fullCount}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Rechercher un projet, enseignant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3 pl-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-esiee-blue focus:border-esiee-blue outline-none transition-all shadow-sm hover:shadow-md"
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">🎯 Disponibilité</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Tous ({projects.length})
            </Button>
            <Button
              variant={filter === 'available' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('available')}
            >
              ✓ Disponibles ({availableCount})
            </Button>
            <Button
              variant={filter === 'full' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('full')}
            >
              ✕ Complets ({fullCount})
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">🏷️ Type de Projet</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={typeFilter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('all')}
            >
              Tous les types
            </Button>
            {groupProjectCount > 0 && (
              <Button
                variant={typeFilter === 'group_project' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter('group_project')}
              >
                👥 Projets de Groupe ({groupProjectCount})
              </Button>
            )}
            {englishLevelingCount > 0 && (
              <Button
                variant={typeFilter === 'english_leveling' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter('english_leveling')}
              >
                🇬🇧 Répartition Anglais ({englishLevelingCount})
              </Button>
            )}
            {exchangeCount > 0 && (
              <Button
                variant={typeFilter === 'exchange_program' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter('exchange_program')}
              >
                ✈️ Programme d'Échange ({exchangeCount})
              </Button>
            )}
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <Loading text="Chargement des projets..." />
        ) : (
          <CardGrid>
            {filteredProjects.map((project) => {
              const studentCount = project.students?.length || 0;
              const isAvailable = studentCount < project.max_students;
              
              return (
                <Card
                  key={project.id}
                  hover
                  onClick={() => openProjectDetails(project)}
                >
                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-3">
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-semibold
                      ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                    `}>
                      {isAvailable ? '✓ Disponible' : '✗ Complet'}
                    </span>
                    {project.project_type && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-esiee-blue text-white">
                        {project.project_type.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  {/* Project Title */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Project Info */}
                  <div className="mb-4">
                    {project.target_filiere && (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mr-2">
                        {project.target_filiere}
                      </span>
                    )}
                    {project.project_type && (
                      <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                        {project.project_type.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  {/* Student Count */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      👥 {project.students?.length || 0}/{project.max_students} étudiants
                    </span>
                    <span className="text-esiee-blue font-semibold hover:underline">
                      Voir détails →
                    </span>
                  </div>
                </Card>
              );
            })}
          </CardGrid>
        )}

        {filteredProjects.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Aucun projet trouvé</h3>
            <p className="text-gray-500">
              {searchQuery ? `Aucun résultat pour "${searchQuery}"` : 'Aucun projet ne correspond à vos critères'}
            </p>
            {(searchQuery || filter !== 'all' || typeFilter !== 'all') && (
              <Button
                variant="outline"
                className="mt-4"
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
    </div>
  );
}
