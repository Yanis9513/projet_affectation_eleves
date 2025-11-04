import { useState, useEffect } from 'react'

function PreferencesPage() {
  const [projects, setProjects] = useState([])
  const [preferences, setPreferences] = useState([])

  useEffect(() => {
    // TODO: Fetch available projects from API
    setProjects([
      { id: 1, title: 'Application Mobile IA' },
      { id: 2, title: 'Système Domotique IoT' },
      { id: 3, title: 'Plateforme E-commerce' },
      { id: 4, title: 'Application Blockchain' },
      { id: 5, title: 'Tableau de Bord de Visualisation de Données' }
    ])

    // TODO: Fetch existing preferences from API
    setPreferences([])
  }, [])

  const handleAddPreference = (projectId) => {
    const project = projects.find(p => p.id === projectId)
    if (project && !preferences.find(p => p.id === projectId)) {
      setPreferences([...preferences, { ...project, order: preferences.length + 1 }])
    }
  }

  const handleRemovePreference = (projectId) => {
    const newPrefs = preferences
      .filter(p => p.id !== projectId)
      .map((p, index) => ({ ...p, order: index + 1 }))
    setPreferences(newPrefs)
  }

  const handleMoveUp = (index) => {
    if (index > 0) {
      const newPrefs = [...preferences]
      ;[newPrefs[index - 1], newPrefs[index]] = [newPrefs[index], newPrefs[index - 1]]
      setPreferences(newPrefs.map((p, i) => ({ ...p, order: i + 1 })))
    }
  }

  const handleMoveDown = (index) => {
    if (index < preferences.length - 1) {
      const newPrefs = [...preferences]
      ;[newPrefs[index], newPrefs[index + 1]] = [newPrefs[index + 1], newPrefs[index]]
      setPreferences(newPrefs.map((p, i) => ({ ...p, order: i + 1 })))
    }
  }

  const handleSubmit = () => {
    // TODO: Send preferences to API
    console.log('Submitting preferences:', preferences)
    alert('Préférences soumises avec succès !')
  }

  return (
    <div className="space-y-6">
      <div className="card bg-gradient-to-r from-primary-50 to-purple-50 border-l-4 border-primary-600">
        <h1 className="text-3xl font-bold text-primary-600 mb-2">Mes Préférences de Projets</h1>
        <p className="text-gray-600">
          Sélectionnez et classez vos projets préférés. Votre premier choix a la priorité la plus élevée.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Available Projects */}
        <div className="card">
          <h2 className="text-xl font-bold text-primary-600 mb-4">Projets Disponibles</h2>
          <div className="space-y-2">
            {projects
              .filter(p => !preferences.find(pref => pref.id === p.id))
              .map(project => (
                <div
                  key={project.id}
                  className="flex justify-between items-center p-3 border rounded-lg hover:bg-primary-50 hover:border-primary-300 transition-colors"
                >
                  <span>{project.title}</span>
                  <button
                    onClick={() => handleAddPreference(project.id)}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    + Ajouter
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Selected Preferences */}
        <div className="card">
          <h2 className="text-xl font-bold text-primary-600 mb-4">Vos Préférences (Classées)</h2>
          {preferences.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              Aucune préférence sélectionnée. Ajoutez des projets à gauche.
            </div>
          ) : (
            <div className="space-y-2">
              {preferences.map((pref, index) => (
                <div
                  key={pref.id}
                  className="flex items-center justify-between p-3 border-2 rounded-lg bg-primary-50 border-primary-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <span className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      {pref.order}
                    </span>
                    <span className="font-medium">{pref.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="text-gray-600 hover:text-gray-800 disabled:opacity-30 text-xl"
                      title="Monter"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === preferences.length - 1}
                      className="text-gray-600 hover:text-gray-800 disabled:opacity-30 text-xl"
                      title="Descendre"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => handleRemovePreference(pref.id)}
                      className="text-red-600 hover:text-red-700 ml-2 text-xl"
                      title="Supprimer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {preferences.length > 0 && (
            <button
              onClick={handleSubmit}
              className="btn-primary w-full mt-4"
            >
              Soumettre mes Préférences
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PreferencesPage
