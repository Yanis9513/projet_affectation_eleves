import StatsCard, { StatsGrid } from '../../components/StatsCard';

/**
 * Section affichant les affectations/groupes
 */
export default function AssignmentsSection({
  assignments,
  stats,
  projectType
}) {
  // Grouper par numero de groupe
  const groupedAssignments = {};
  assignments.forEach(assignment => {
    const groupNum = assignment.group_number || 0;
    if (!groupedAssignments[groupNum]) {
      groupedAssignments[groupNum] = [];
    }
    groupedAssignments[groupNum].push(assignment);
  });

  const groupNumbers = Object.keys(groupedAssignments).sort((a, b) => Number(a) - Number(b));

  if (assignments.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Affectations
        </h2>
        <div className="text-center py-8 text-slate-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p>Aucune affectation generee pour le moment</p>
          <p className="text-sm mt-2">Lancez l'algorithme pour creer les groupes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-6">
      {/* Stats */}
      {stats && (
        <StatsGrid columns={4}>
          <StatsCard
            value={stats.total_groups || groupNumbers.length}
            subtitle="Groupes"
            color="blue"
          />
          <StatsCard
            value={stats.total_assigned || assignments.length}
            subtitle="Etudiants affectes"
            color="emerald"
          />
          <StatsCard
            value={stats.satisfaction_rate ? `${Math.round(stats.satisfaction_rate)}%` : 'N/A'}
            subtitle="Taux satisfaction"
            color="purple"
          />
          <StatsCard
            value={stats.unassigned || 0}
            subtitle="Non affectes"
            color={stats.unassigned > 0 ? 'red' : 'slate'}
          />
        </StatsGrid>
      )}

      {/* Groups */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Groupes formes ({groupNumbers.length})
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupNumbers.map(groupNum => (
            <GroupCard 
              key={groupNum}
              groupNumber={groupNum}
              members={groupedAssignments[groupNum]}
              projectType={projectType}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function GroupCard({ groupNumber, members, projectType }) {
  // Pour les programmes d'echange, le "groupe" peut etre une destination
  const isExchange = projectType === 'exchange_program';
  const destination = isExchange && members[0]?.destination;
  
  return (
    <div className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:shadow-sm transition-all">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900">
          {isExchange && destination ? destination.name : `Groupe ${groupNumber}`}
        </h3>
        <span className="px-2 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
          {members.length} membre{members.length > 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="space-y-2">
        {members.map((member, idx) => (
          <div 
            key={member.id || idx}
            className="flex items-center gap-2 text-sm"
          >
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-xs">
              {member.student?.name?.charAt(0)?.toUpperCase() || 
               member.student_name?.charAt(0)?.toUpperCase() || 
               '?'}
            </div>
            <span className="text-slate-700">
              {member.student?.name || member.student_name || 'Etudiant'}
            </span>
            {member.preference_rank && (
              <span className="ml-auto text-xs text-slate-400">
                Choix #{member.preference_rank}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
