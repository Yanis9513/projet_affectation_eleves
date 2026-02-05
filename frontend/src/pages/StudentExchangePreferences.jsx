import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { Loading } from '../components/Loading';
import { destinationAPI, destinationPreferenceAPI } from '../services/api';
import toast from 'react-hot-toast';
import CountryFlag from 'react-country-flag';
import { getCountryCode } from '../utils/countryFlags';

// SVG Icons
const ArrowLeftIcon = () => (
  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
)

const InfoIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export default function StudentExchangePreferences() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get destinations for this project
      const destResponse = await destinationAPI.getByProject(projectId);
      setDestinations(destResponse.data || []);
      
      // Get student's current preferences
      const prefResponse = await destinationPreferenceAPI.getMyPreferences(projectId);
      const existingPrefs = prefResponse.data || [];
      
      if (existingPrefs.length > 0) {
        setHasSubmitted(true);
        // Convert to object for easy lookup
        const prefsObj = {};
        existingPrefs.forEach(pref => {
          prefsObj[pref.destination_id] = pref.grade;
        });
        setPreferences(prefsObj);
      } else {
        // Initialize empty preferences
        const emptyPrefs = {};
        destResponse.data?.forEach(dest => {
          emptyPrefs[dest.id] = '';
        });
        setPreferences(emptyPrefs);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (destinationId, grade) => {
    setPreferences(prev => ({
      ...prev,
      [destinationId]: grade
    }));
  };

  const validatePreferences = () => {
    const grades = Object.values(preferences).filter(g => g !== '');
    
    // Check if all destinations have a grade
    if (grades.length !== destinations.length) {
      toast.error('Veuillez attribuer une note à toutes les universités');
      return false;
    }
    
    // Check for duplicate grades
    const uniqueGrades = new Set(grades);
    if (uniqueGrades.size !== grades.length) {
      toast.error('Chaque note doit être unique (vous ne pouvez pas avoir deux A)');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validatePreferences()) return;
    
    try {
      const preferencesData = Object.entries(preferences).map(([destinationId, grade]) => ({
        destination_id: parseInt(destinationId),
        grade: grade
      }));
      
      await destinationPreferenceAPI.submit({
        project_id: parseInt(projectId),
        preferences: preferencesData
      });
      
      toast.success('Préférences soumises avec succès !');
      setHasSubmitted(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/student');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting preferences:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de la soumission');
    }
  };

  const getGradeColor = (grade) => {
    switch(grade) {
      case 'A': return 'bg-emerald-500 text-white';
      case 'B': return 'bg-emerald-400 text-white';
      case 'C': return 'bg-blue-400 text-white';
      case 'D': return 'bg-amber-400 text-white';
      case 'E': return 'bg-orange-400 text-white';
      case 'F': return 'bg-red-400 text-white';
      default: return 'bg-slate-200 text-slate-700';
    }
  };

  const getGradeDescription = (grade) => {
    switch(grade) {
      case 'A': return 'Université préférée';
      case 'B': return 'Très intéressé';
      case 'C': return 'Intéressé';
      case 'D': return 'Acceptable';
      case 'E': return 'Peu intéressé';
      case 'F': return 'Dernier choix';
      default: return 'Sélectionner une note';
    }
  };

  if (loading) {
    return <Loading text="Chargement des universités..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl animate-fade-in">
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
            Noter les Universités
          </h1>
          <p className="text-slate-600">
            Attribuez une note de A (préférée) à F (moins préférée) à chaque université
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <InfoIcon />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Comment ça marche :</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>A</strong> = Université que vous préférez le plus</li>
                <li>• <strong>B</strong> = Université très intéressante</li>
                <li>• <strong>C</strong> = Université intéressante</li>
                <li>• <strong>D</strong> = Université acceptable</li>
                <li>• <strong>E</strong> = Peu intéressé</li>
                <li>• <strong>F</strong> = Dernier choix</li>
                <li className="font-semibold mt-2 text-blue-800">Chaque note doit être unique !</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Destinations List */}
        <div className="space-y-4 mb-8">
          {destinations.map((dest, index) => (
            <div key={dest.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Destination Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl font-bold text-slate-300">
                      #{index + 1}
                    </span>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {dest.university_name}
                    </h3>
                  </div>
                  <p className="text-slate-600 mb-2">
                    {dest.city ? `${dest.city}, ` : ''}
                    {dest.country && (
                      <span className="inline-flex items-center gap-2">
                        {getCountryCode(dest.country) && (
                          <CountryFlag 
                            countryCode={getCountryCode(dest.country)} 
                            svg 
                            style={{ 
                              width: '1.5em', 
                              height: '1.1em',
                              border: '1px solid rgba(0,0,0,0.1)',
                              borderRadius: '2px'
                            }} 
                          />
                        )}
                        <span title={dest.country}>{dest.country}</span>
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {dest.total_places} places
                    </span>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                      {dest.mobility_type}
                    </span>
                    {dest.min_english_level && (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                        Anglais: {dest.min_english_level}
                      </span>
                    )}
                  </div>
                </div>

                {/* Grade Selection */}
                <div className="flex flex-col items-center">
                  <div className="flex gap-2 mb-2">
                    {['A', 'B', 'C', 'D', 'E', 'F'].map((grade) => (
                      <button
                        key={grade}
                        onClick={() => handleGradeChange(dest.id, grade)}
                        disabled={hasSubmitted}
                        className={`w-10 h-10 rounded-lg font-bold text-lg transition-all ${
                          preferences[dest.id] === grade
                            ? getGradeColor(grade)
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        } ${hasSubmitted ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                  <span className={`text-sm font-medium ${
                    preferences[dest.id] ? getGradeColor(preferences[dest.id]).split(' ')[0].replace('bg-', 'text-') : 'text-slate-500'
                  }`}>
                    {getGradeDescription(preferences[dest.id])}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Récapitulatif de vos choix</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(preferences)
              .filter(([_, grade]) => grade !== '')
              .sort(([_, a], [__, b]) => a.localeCompare(b))
              .map(([destId, grade]) => {
                const dest = destinations.find(d => d.id === parseInt(destId));
                return (
                  <div 
                    key={destId}
                    className={`p-3 rounded-lg ${getGradeColor(grade)}`}
                  >
                    <div className="font-bold text-lg">{grade}</div>
                    <div className="text-sm truncate">{dest?.university_name}</div>
                  </div>
                );
              })}
          </div>
          {Object.values(preferences).filter(g => g !== '').length !== destinations.length && (
            <p className="text-amber-600 text-sm mt-4">
              {destinations.length - Object.values(preferences).filter(g => g !== '').length} université(s) sans note
            </p>
          )}
        </div>

        {/* Submit Button or Already Submitted Message */}
        {!hasSubmitted ? (
          <div className="flex justify-center">
            <Button 
              variant="primary" 
              onClick={handleSubmit}
              className="px-8 py-3 text-lg"
            >
              Soumettre mes préférences
            </Button>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center shadow-sm">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4">
              <CheckCircleIcon />
            </div>
            <h3 className="text-xl font-semibold text-emerald-800 mb-2">
              Préférences déjà soumises
            </h3>
            <p className="text-emerald-700 mb-4">
              Vous avez déjà soumis vos préférences pour ce projet. Vous pouvez les consulter dans "Mes Préférences".
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                variant="secondary" 
                onClick={() => navigate('/my-preferences')}
              >
                Voir mes préférences
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => navigate('/student')}
              >
                Retour au tableau de bord
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
