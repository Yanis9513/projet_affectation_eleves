import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardSimple } from '../components/Card';
import Button from '../components/Button';
import { Loading } from '../components/Loading';
import { studentAPI } from '../services/api';
import toast from 'react-hot-toast';

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
      toast.error('Erreur lors du chargement des affectations');
    } finally {
      setLoading(false);
    }
  };

  const getProjectTypeIcon = (type) => {
    switch(type) {
      case 'exchange_program':
        return '🌍';
      case 'group_project':
        return '👥';
      case 'english_leveling':
        return '📚';
      default:
        return '📋';
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
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return <Loading text="Chargement de vos affectations..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/student')}
            className="mb-4"
          >
            ← Retour au tableau de bord
          </Button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Mes Affectations
          </h1>
          <p className="text-gray-600">
            {studentInfo?.total > 0 
              ? `Vous avez ${studentInfo.total} affectation(s) en cours`
              : "Vous n'avez pas encore d'affectations"
            }
          </p>
        </div>

        {/* Assignments List */}
        {assignments.length === 0 ? (
          <CardSimple className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Aucune affectation
            </h3>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas encore été affecté à un groupe ou une destination. Les affectations apparaîtront ici une fois que l'enseignant aura lancé l'algorithme.
            </p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/student')}
            >
              Voir mes projets
            </Button>
          </CardSimple>
        ) : (
          <div className="space-y-6">
            {assignments.map((assignment) => (
              <CardSimple 
                key={assignment.id} 
                className={`border-l-4 ${getProjectTypeColor(assignment.project_type)}`}
              >
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getProjectTypeIcon(assignment.project_type)}</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {assignment.project_title}
                      </h3>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-1 ${getProjectTypeColor(assignment.project_type)}`}>
                        {getProjectTypeLabel(assignment.project_type)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {assignment.satisfaction_score && (
                      <div className="text-sm">
                        <span className="text-gray-600">Satisfaction: </span>
                        <span className={`font-bold ${
                          assignment.satisfaction_score >= 8 ? 'text-green-600' :
                          assignment.satisfaction_score >= 5 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {assignment.satisfaction_score}/10
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignment Details */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {/* Exchange Program */}
                  {assignment.project_type === 'exchange_program' && assignment.destination && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-lg">
                        <span className="text-gray-600">🎓 Destination assignée:</span>
                        <span className="font-bold text-purple-700">
                          {assignment.destination.university_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span>📍</span>
                        <span>{assignment.destination.city}, {assignment.destination.country}</span>
                      </div>
                      {assignment.grade && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Votre évaluation:</span>
                          <span className={`px-3 py-1 rounded font-bold ${
                            assignment.grade === 'A' ? 'bg-green-500 text-white' :
                            assignment.grade === 'B' ? 'bg-green-400 text-white' :
                            assignment.grade === 'C' ? 'bg-blue-400 text-white' :
                            assignment.grade === 'D' ? 'bg-yellow-400 text-white' :
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
                        <span className="text-gray-600">👥 Groupe</span>
                        <span className="font-bold text-blue-700">#{assignment.group_number}</span>
                        <span className="text-sm text-gray-500">
                          ({assignment.group_size} membres)
                        </span>
                      </div>
                      
                      {assignment.group_members && assignment.group_members.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Membres de votre groupe:</h4>
                          <div className="space-y-2">
                            {assignment.group_members.map((member) => (
                              <div key={member.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                  {member.name?.[0] || '?'}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-800">{member.name}</div>
                                  <div className="text-xs text-gray-500">{member.email}</div>
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
                        <span className="text-gray-600">📚 Groupe de niveau</span>
                        <span className="font-bold text-green-700">#{assignment.group_number}</span>
                        <span className="text-sm text-gray-500">
                          ({assignment.group_size} étudiants)
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600">Votre niveau:</span>
                        <span className={`px-4 py-2 rounded-lg font-bold text-lg ${
                          assignment.english_level?.startsWith('C') ? 'bg-purple-500 text-white' :
                          assignment.english_level?.startsWith('B') ? 'bg-blue-500 text-white' :
                          'bg-green-500 text-white'
                        }`}>
                          {assignment.english_level}
                        </span>
                      </div>
                      
                      {assignment.group_members && assignment.group_members.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Camarades de groupe ({assignment.group_members.length}):</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {assignment.group_members.map((member) => (
                              <div key={member.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs">
                                  {member.name?.[0] || '?'}
                                </div>
                                <span className="text-sm text-gray-700">{member.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Affecté le: {assignment.assigned_at ? 
                      new Date(assignment.assigned_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : 'Date inconnue'
                    }
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/projects/${assignment.project_id}`)}
                  >
                    Voir le projet →
                  </Button>
                </div>
              </CardSimple>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
