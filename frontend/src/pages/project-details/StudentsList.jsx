import Button from '../../components/Button';

/**
 * Liste des etudiants inscrits au projet
 */
export default function StudentsList({ 
  students, 
  isTeacher, 
  onRemoveStudent,
  projectType 
}) {
  if (!students || students.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Etudiants inscrits
        </h2>
        <div className="text-center py-8 text-slate-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p>Aucun etudiant inscrit pour le moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Etudiants inscrits ({students.length})
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Nom</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Email</th>
              {projectType === 'english_leveling' && (
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Niveau</th>
              )}
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Statut</th>
              {isTeacher && (
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                      {student.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span className="font-medium text-slate-900">{student.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-600">{student.email}</td>
                {projectType === 'english_leveling' && (
                  <td className="py-3 px-4">
                    <EnglishLevelBadge level={student.english_level} />
                  </td>
                )}
                <td className="py-3 px-4">
                  <PreferenceStatusBadge 
                    hasSubmitted={student.has_submitted_preferences} 
                  />
                </td>
                {isTeacher && (
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onRemoveStudent(student)}
                    >
                      Retirer
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EnglishLevelBadge({ level }) {
  const colors = {
    A1: 'bg-red-100 text-red-700',
    A2: 'bg-orange-100 text-orange-700',
    B1: 'bg-yellow-100 text-yellow-700',
    B2: 'bg-emerald-100 text-emerald-700',
    C1: 'bg-blue-100 text-blue-700',
    C2: 'bg-purple-100 text-purple-700',
  };
  
  const colorClass = colors[level] || 'bg-slate-100 text-slate-700';
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {level || 'Non defini'}
    </span>
  );
}

function PreferenceStatusBadge({ hasSubmitted }) {
  if (hasSubmitted) {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
        Preferences soumises
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
      En attente
    </span>
  );
}
