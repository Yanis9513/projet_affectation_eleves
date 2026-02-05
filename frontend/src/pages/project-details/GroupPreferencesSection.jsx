import { useState } from 'react';
import Button from '../../components/Button';

/**
 * Section affichant les preferences de groupe des etudiants
 */
export default function GroupPreferencesSection({
  preferences,
  isLoading,
  students,
  onRefresh
}) {
  const [expandedStudent, setExpandedStudent] = useState(null);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Preferences des etudiants
        </h2>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!preferences || preferences.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Preferences des etudiants
        </h2>
        <div className="text-center py-8 text-slate-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>Aucune preference soumise pour le moment</p>
        </div>
      </div>
    );
  }

  // Calculer les stats
  const totalStudents = students?.length || 0;
  const submittedCount = preferences.length;
  const submissionRate = totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Preferences des etudiants
        </h2>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          Actualiser
        </Button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-slate-900">{submittedCount}</p>
          <p className="text-sm text-slate-500">Soumis</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-slate-900">{totalStudents - submittedCount}</p>
          <p className="text-sm text-slate-500">En attente</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{submissionRate}%</p>
          <p className="text-sm text-slate-500">Taux</p>
        </div>
      </div>

      {/* Preferences list */}
      <div className="space-y-2">
        {preferences.map((pref, index) => (
          <PreferenceRow
            key={pref.student_id || index}
            preference={pref}
            isExpanded={expandedStudent === pref.student_id}
            onToggle={() => setExpandedStudent(
              expandedStudent === pref.student_id ? null : pref.student_id
            )}
          />
        ))}
      </div>
    </div>
  );
}

function PreferenceRow({ preference, isExpanded, onToggle }) {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
            {preference.student_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <span className="font-medium text-slate-900">{preference.student_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">
            {preference.preferred_partners?.length || 0} preferences
          </span>
          <svg 
            className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {isExpanded && (
        <div className="border-t border-slate-200 p-3 bg-slate-50">
          <p className="text-sm font-medium text-slate-700 mb-2">Partenaires preferes:</p>
          {preference.preferred_partners?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {preference.preferred_partners.map((partner, idx) => (
                <span 
                  key={idx}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-700"
                >
                  {idx + 1}. {partner.name || partner}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">Aucune preference specifiee</p>
          )}
          
          {preference.excluded_partners?.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-red-700 mb-2">Exclusions:</p>
              <div className="flex flex-wrap gap-2">
                {preference.excluded_partners.map((partner, idx) => (
                  <span 
                    key={idx}
                    className="px-2.5 py-1 bg-red-50 border border-red-200 rounded-full text-sm text-red-700"
                  >
                    {partner.name || partner}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
