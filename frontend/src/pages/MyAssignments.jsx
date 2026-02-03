import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { Loading } from '../components/Loading';
import { studentAPI } from '../services/api';
import toast from 'react-hot-toast';

// SVG Icons
const ArrowLeftIcon = () => (
  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
)

const InboxIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
)

const GlobeIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const BookIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

export default function MyAssignments() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getMyAssignments();
      setAssignments(response.data.assignments || []);
      setStudentInfo({
        name: response.data.student_name,
        id: response.data.student_id,
        total: response.data.total_assignments
      });
    } catch (error) {
      console.error('Error loading assignments:', error);
      toast.error('Impossible de charger vos affectations.');
    } finally {
      setLoading(false);
    }
  };

  const getProjectTypeIcon = (type) => {
    switch(type) {
      case 'exchange_program':
        return <GlobeIcon />;
      case 'group_project':
        return <UsersIcon />;
      case 'english_leveling':
        return <BookIcon />;
      default:
        return <UsersIcon />;
    }
  };

  const getProjectTypeLabel = (type) => {
    switch(type) {
      case 'exchange_program':
        return 'Programme d\'échange';
      case 'group_project':
        return 'Projet de groupe';
      case 'english_leveling':
        return 'Niveau d\'anglais';
      default:
        return type;
    }
  };

  const getProjectTypeColor = (type) => {
    switch(type) {
      case 'exchange_program':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'group_project':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'english_leveling':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  if (loading) {
    return <Loading text="Chargement de vos affectations..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="secondary" 
            onClick={() => navigate('/student')}
            className="mb-4"
          >
            <ArrowLeftIcon />
            Retour au tableau de bord
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Mes Affectations
          </h1>
          <p className="text-slate-600">
            {studentInfo?.total > 0 
              ? `Vous avez ${studentInfo.total} affectation(s) en cours`
              : "Vous n'avez pas encore d'affectations"
            }
          </p>
        </div>

        {/* Assignments List */}
        {assignments.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
              <InboxIcon />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Aucune affectation
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Vous n'avez pas encore été affecté à un groupe ou une destination. Les affectations apparaîtront ici une fois que l'enseignant aura lancé l'algorithme.
            </p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/student')}
            >
              Voir mes projets
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {assignments.map((assignment) => (
              <div 
                key={assignment.id} 
                className={`bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow border-l-4 ${getProjectTypeColor(assignment.project_type)}`}
              >
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      assignment.project_type === 'exchange_program' ? 'bg-purple-100 text-purple-600' :
                      assignment.project_type === 'group_project' ? 'bg-blue-100 text-blue-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {getProjectTypeIcon(assignment.project_type)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        {assignment.project_title}
                      </h3>
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium mt-1 ${getProjectTypeColor(assignment.project_type)}`}>
                        {getProjectTypeLabel(assignment.project_type)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {assignment.satisfaction_score && (
                      <div className="text-sm">
                        <span className="text-slate-600">Satisfaction: </span>
                        <span className={`font-bold ${
                          assignment.satisfaction_score >= 8 ? 'text-emerald-600' :
                          assignment.satisfaction_score >= 5 ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                          {assignment.satisfaction_score}/10
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignment Details */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  {/* Exchange Program */}
                  {assignment.project_type === 'exchange_program' && assignment.destination && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-lg">
                        <span className="text-slate-600">🎓 Destination assignée:</span>
                        <span className="font-bold text-purple-700">
                          {assignment.destination.university_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <span>📍</span>
                        <span>{assignment.destination.city}, {assignment.destination.country}</span>
                      </div>
                      {assignment.grade && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Votre évaluation:</span>
                          <span className={`px-3 py-1 rounded font-bold ${
                            assignment.grade === 'A' ? 'bg-emerald-500 text-white' :
                            assignment.grade === 'B' ? 'bg-emerald-400 text-white' :
                            assignment.grade === 'C' ? 'bg-blue-400 text-white' :
                            assignment.grade === 'D' ? 'bg-amber-400 text-white' :
                            assignment.grade === 'E' ? 'bg-orange-400 text-white' :
                            'bg-red-400 text-white'
                          }`}>
                            {assignment.grade}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Group Project */}
                  {assignment.project_type === 'group_project' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-lg">
                        <span className="text-slate-600">👥 Groupe</span>
                        <span className="font-bold text-blue-700">#{assignment.group_number}</span>
                        <span className="text-sm text-slate-500">
                          ({assignment.group_size} membres)
                        </span>
                      </div>
                      
                      {assignment.group_members && assignment.group_members.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-slate-700 mb-2">Membres de votre groupe:</h4>
                          <div className="space-y-2">
                            {assignment.group_members.map((member) => (
                              <div key={member.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                  {member.name?.[0] || '?'}
                                </div>
                                <div>
                                  <div className="font-medium text-slate-800">{member.name}</div>
                                  <div className="text-xs text-slate-500">{member.email}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* English Leveling */}
                  {assignment.project_type === 'english_leveling' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-lg">
                        <span className="text-slate-600">📚 Groupe de niveau</span>
                        <span className="font-bold text-emerald-700">#{assignment.group_number}</span>
                        <span className="text-sm text-slate-500">
                          ({assignment.group_size} étudiants)
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-slate-600">Votre niveau:</span>
                        <span className={`px-4 py-2 rounded-lg font-bold text-lg ${
                          assignment.english_level?.startsWith('C') ? 'bg-purple-500 text-white' :
                          assignment.english_level?.startsWith('B') ? 'bg-blue-500 text-white' :
                          'bg-emerald-500 text-white'
                        }`}>
                          {assignment.english_level}
                        </span>
                      </div>
                      
                      {assignment.group_members && assignment.group_members.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-slate-700 mb-2">Camarades de groupe ({assignment.group_members.length}):</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {assignment.group_members.map((member) => (
                              <div key={member.id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200">
                                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                                  {member.name?.[0] || '?'}
                                </div>
                                <span className="text-sm text-slate-700">{member.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                  <div className="text-sm text-slate-500">
                    Affecté le: {assignment.assigned_at ? 
                      new Date(assignment.assigned_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : 'Date inconnue'
                    }
                  </div>
                  <Button 
                    variant="secondary"
                    onClick={() => navigate(`/projects/${assignment.project_id}`)}
                  >
                    Voir le projet
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
