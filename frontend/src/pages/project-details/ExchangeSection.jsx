import Button from '../../components/Button';
import StatsCard, { StatsGrid } from '../../components/StatsCard';
import CountryFlag from 'react-country-flag';
import { getCountryCode } from '../../utils/countryFlags';

/**
 * Section pour le programme d'echange
 */
export default function ExchangeSection({
  destinations,
  exchangeStats,
  studentsStatus,
  isTeacher,
  isOpenForPreferences,
  onLaunch,
  onClosePreferences,
  onRunOptimization,
  onAddDestination,
  isLaunching,
  isClosing,
  isOptimizing
}) {
  return (
    <div className="space-y-6">
      {/* Stats */}
      {exchangeStats && (
        <StatsGrid columns={4}>
          <StatsCard
            value={exchangeStats.total_students || 0}
            subtitle="Etudiants"
            color="blue"
          />
          <StatsCard
            value={exchangeStats.submitted_preferences || 0}
            subtitle="Preferences soumises"
            color="emerald"
          />
          <StatsCard
            value={destinations.length}
            subtitle="Destinations"
            color="purple"
          />
          <StatsCard
            value={exchangeStats.assigned_students || 0}
            subtitle="Affectes"
            color="amber"
          />
        </StatsGrid>
      )}

      {/* Actions */}
      {isTeacher && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Actions</h3>
          <div className="flex flex-wrap gap-3">
            {!isOpenForPreferences ? (
              <Button
                variant="primary"
                onClick={onLaunch}
                disabled={isLaunching}
              >
                {isLaunching ? 'Lancement...' : 'Lancer la collecte de preferences'}
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={onClosePreferences}
                disabled={isClosing}
              >
                {isClosing ? 'Fermeture...' : 'Fermer les preferences'}
              </Button>
            )}
            
            <Button
              variant="primary"
              onClick={() => onRunOptimization('greedy')}
              disabled={isOptimizing || isOpenForPreferences}
            >
              {isOptimizing ? 'Optimisation...' : 'Lancer l\'algorithme'}
            </Button>
            
            <Button
              variant="outline"
              onClick={onAddDestination}
            >
              + Ajouter une destination
            </Button>
          </div>
        </div>
      )}

      {/* Destinations List */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Destinations ({destinations.length})
        </h3>
        
        {destinations.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Aucune destination configuree</p>
            {isTeacher && (
              <Button variant="primary" size="sm" className="mt-4" onClick={onAddDestination}>
                Ajouter une destination
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {destinations.map(dest => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DestinationCard({ destination }) {
  const spotsUsed = destination.spots - (destination.available_spots || destination.spots);
  const percentage = (spotsUsed / destination.spots) * 100;
  
  return (
    <div className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-slate-900">{destination.name}</h4>
          <p className="text-sm text-slate-500 flex items-center gap-2">
            {getCountryCode(destination.country) && (
              <CountryFlag 
                countryCode={getCountryCode(destination.country)} 
                svg 
                style={{ 
                  width: '1.5em', 
                  height: '1.1em',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '2px'
                }} 
              />
            )}
            <span title={destination.country}>{destination.country}</span>
          </p>
        </div>
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-600">Places</span>
          <span className="font-medium">{spotsUsed}/{destination.spots}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-blue-600 rounded-full h-2 transition-all"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
      
      {destination.description && (
        <p className="text-sm text-slate-600 line-clamp-2">{destination.description}</p>
      )}
    </div>
  );
}


