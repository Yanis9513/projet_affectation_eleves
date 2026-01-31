import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CardSimple } from '../components/Card';
import Button from '../components/Button';
import { Loading } from '../components/Loading';
import { destinationAPI, destinationPreferenceAPI } from '../services/api';
import toast from 'react-hot-toast';

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
      case 'A': return 'bg-green-500 text-white';
      case 'B': return 'bg-green-400 text-white';
      case 'C': return 'bg-blue-400 text-white';
      case 'D': return 'bg-yellow-400 text-white';
      case 'E': return 'bg-orange-400 text-white';
      case 'F': return 'bg-red-400 text-white';
      default: return 'bg-gray-200 text-gray-700';
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
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
            Noter les Universités
          </h1>
          <p className="text-gray-600">
            Attribuez une note de A (préférée) à F (moins préférée) à chaque université
          </p>
        </div>

        {/* Instructions */}
        <CardSimple className="mb-6 bg-blue-50 border-l-4 border-blue-500">
          <h3 className="font-bold text-blue-800 mb-2">Comment ça marche :</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• A = Université que vous préférez le plus</li>
            <li>• B = Université très intéressante</li>
            <li>• C = Université intéressante</li>
            <li>• D = Université acceptable</li>
            <li>• E = Peu intéressé</li>
            <li>• F = Dernier choix</li>
            <li className="font-semibold mt-2">Chaque note doit être unique !</li>
          </ul>
        </CardSimple>

        {/* Destinations List */}
        <div className="space-y-4 mb-8">
          {destinations.map((dest, index) => (
            <CardSimple key={dest.id} className="bg-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Destination Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-gray-400">
                      #{index + 1}
                    </span>
                    <h3 className="text-xl font-bold text-gray-800">
                      {dest.university_name}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-2">
                    {dest.city}, {dest.country}
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {dest.total_places} places
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                      {dest.mobility_type}
                    </span>
                    {dest.min_english_level && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
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
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        } ${hasSubmitted ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                  <span className={`text-sm font-medium ${
                    preferences[dest.id] ? getGradeColor(preferences[dest.id]).split(' ')[0].replace('bg-', 'text-') : 'text-gray-500'
                  }`}>
                    {getGradeDescription(preferences[dest.id])}
                  </span>
                </div>
              </div>
            </CardSimple>
          ))}
        </div>

        {/* Summary */}
        <CardSimple className="mb-6 bg-gray-50">
          <h3 className="font-bold text-gray-800 mb-4">Récapitulatif de vos choix</h3>
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
            <p className="text-orange-600 text-sm mt-4">
              {destinations.length - Object.values(preferences).filter(g => g !== '').length} université(s) sans note
            </p>
          )}
        </CardSimple>

        {/* Submit Button */}
        {!hasSubmitted && (
          <div className="flex justify-center">
            <Button 
              variant="primary" 
              onClick={handleSubmit}
              className="px-8 py-3 text-lg"
            >
              Soumettre mes préférences
            </Button>
          </div>
        )}

        {hasSubmitted && (
          <CardSimple className="bg-green-50 border-2 border-green-200 text-center">
            <h3 className="text-xl font-bold text-green-800 mb-2">
              Préférences enregistrées !
            </h3>
            <p className="text-green-700 mb-4">
              Vos préférences ont été soumises avec succès. Vous serez redirigé vers votre tableau de bord.
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/student')}
            >
              Retour au tableau de bord
            </Button>
          </CardSimple>
        )}
      </div>
    </div>
  );
}
