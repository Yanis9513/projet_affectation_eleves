import { useState, useEffect } from 'react'

function ProjectsPage() {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    // TODO: Fetch projects from API
    setProjects([
      {
        id: 1,
        title: 'Application Mobile IA',
        description: 'Développer une application mobile utilisant des technologies IA/ML',
        minStudents: 3,
        maxStudents: 5,
        requiredLanguageLevel: 'B1',
        currentStudents: 4
      },
      {
        id: 2,
        title: 'Système Domotique IoT',
        description: 'Construire un système domotique connecté',
        minStudents: 2,
        maxStudents: 4,
        requiredLanguageLevel: 'B2',
        currentStudents: 3
      },
      {
        id: 3,
        title: 'Plateforme E-commerce',
        description: 'Créer une solution e-commerce full-stack',
        minStudents: 4,
        maxStudents: 6,
        requiredLanguageLevel: 'B1',
        currentStudents: 0
      }
    ])
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary-600">Projets Disponibles</h1>
        <button className="btn-primary">
          + Créer un Nouveau Projet
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="card hover:shadow-lg transition-all hover:scale-105 duration-200 border-l-4 border-primary-600">
            <h3 className="text-xl font-bold text-primary-600 mb-2">{project.title}</h3>
            <p className="text-gray-600 mb-4">{project.description}</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Taille de l'équipe :</span>
                <span className="font-medium">{project.minStudents} - {project.maxStudents} étudiants</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Niveau de langue :</span>
                <span className="font-medium">{project.requiredLanguageLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Membres actuels :</span>
                <span className="font-medium">{project.currentStudents} étudiants</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <button className="btn-primary w-full">
                Voir les Détails
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProjectsPage
