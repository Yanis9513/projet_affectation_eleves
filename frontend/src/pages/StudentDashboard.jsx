import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardSimple } from '../components/Card';
import Button from '../components/Button';
import { Loading } from '../components/Loading';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState({
    name: '',
    email: '',
    filiere: '',
    rank: null,
    englishLevel: '',
    hasSubmittedPreferences: false,
    assignedProject: null
  });

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      // Load from auth context and localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Use actual logged-in user data
      setStudent({
        name: storedUser.name || storedUser.email?.split('@')[0] || 'Student',
        email: storedUser.email || 'student@edu.esiee.fr',
        filiere: storedUser.filiere || 'Informatique',
        rank: storedUser.rank || null,
        englishLevel: storedUser.englishLevel || 'B2',
        hasSubmittedPreferences: false,
        assignedProject: null // Will be populated when algorithm runs
      });
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Chargement de votre tableau de bord..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Tableau de Bord Étudiant
        </h1>
        <p className="text-gray-600 mb-8">Bienvenue {student.name}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <CardSimple className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:shadow-lg transition-all">
            <p className="text-gray-700 text-sm font-medium mb-1">Filière</p>
            <p className="text-3xl font-bold text-esiee-blue">{student.filiere}</p>
          </CardSimple>
          <CardSimple className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 hover:shadow-lg transition-all">
            <p className="text-gray-700 text-sm font-medium mb-1">Classement</p>
            <p className="text-3xl font-bold text-purple-600">{student.rank || 'N/A'}</p>
          </CardSimple>
          <CardSimple className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 hover:shadow-lg transition-all">
            <p className="text-gray-700 text-sm font-medium mb-1">Niveau Anglais</p>
            <p className="text-3xl font-bold text-green-600">{student.englishLevel}</p>
          </CardSimple>
          <CardSimple className={`bg-gradient-to-br ${student.hasSubmittedPreferences ? 'from-green-50 to-green-100 border-2 border-green-200' : 'from-orange-50 to-orange-100 border-2 border-orange-200'} hover:shadow-lg transition-all`}>
            <p className="text-gray-700 text-sm font-medium mb-1">Préférences</p>
            <p className={`text-2xl font-bold ${student.hasSubmittedPreferences ? 'text-green-600' : 'text-orange-600'}`}>
              {student.hasSubmittedPreferences ? '✓ Envoyées' : '⚠ À faire'}
            </p>
          </CardSimple>
        </div>

        {/* Assignment Status */}
        {student.assignedProject ? (
          <CardSimple className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-3xl">🎉</span>
                  <h3 className="text-2xl font-bold text-green-800">
                    Projet Assigné !
                  </h3>
                </div>
                <h4 className="text-xl font-bold text-esiee-blue mb-2">
                  {student.assignedProject.title}
                </h4>
                <p className="text-gray-700 mb-3">
                  {student.assignedProject.description || 'Félicitations ! Vous avez été assigné à ce projet.'}
                </p>
                {student.assignedProject.groupMembers && (
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-700 mb-1">👥 Membres de votre groupe:</p>
                    <div className="flex flex-wrap gap-2">
                      {student.assignedProject.groupMembers.map((member, idx) => (
                        <span key={idx} className="px-3 py-1 bg-white border border-green-300 rounded-full text-sm">
                          {member}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Button variant="primary" onClick={() => navigate(`/projects/${student.assignedProject.id}`)}>
                Voir Détails
              </Button>
            </div>
          </CardSimple>
        ) : (
          <CardSimple className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300">
            <div className="flex items-start gap-4">
              <span className="text-4xl">⏳</span>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-yellow-800 mb-2">
                  En attente d'affectation
                </h3>
                <p className="text-gray-700 mb-3">
                  Les affectations seront annoncées prochainement une fois que tous les étudiants auront soumis leurs préférences.
                </p>
                {!student.hasSubmittedPreferences && (
                  <div className="bg-orange-100 border-l-4 border-orange-500 p-3 rounded">
                    <p className="text-orange-800 font-semibold text-sm">
                      ⚠️ N'oubliez pas de soumettre vos préférences de projets !
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardSimple>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Browse Projects Card */}
          <CardSimple 
            className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 hover:shadow-xl transition-all cursor-pointer"
            onClick={() => navigate('/projects')}
          >
            <div className="text-center">
              <div className="text-5xl mb-3">📁</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Parcourir les Projets</h3>
              <p className="text-sm text-gray-600 mb-4">
                Découvrez tous les projets disponibles et leurs détails
              </p>
              <Button variant="primary" fullWidth size="sm">
                Voir les Projets
              </Button>
            </div>
          </CardSimple>

          {/* Submit Preferences Card */}
          <CardSimple 
            className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 hover:shadow-xl transition-all cursor-pointer"
            onClick={() => navigate('/preferences')}
          >
            <div className="text-center">
              <div className="text-5xl mb-3">⭐</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Mes Préférences</h3>
              <p className="text-sm text-gray-600 mb-4">
                {student.hasSubmittedPreferences ? 'Modifiez vos préférences' : 'Soumettez vos préférences de projets'}
              </p>
              <Button 
                variant={student.hasSubmittedPreferences ? 'outline' : 'primary'} 
                fullWidth 
                size="sm"
              >
                {student.hasSubmittedPreferences ? 'Modifier' : 'Soumettre'}
              </Button>
            </div>
          </CardSimple>

          {/* My Profile Card */}
          <CardSimple 
            className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 hover:shadow-xl transition-all cursor-pointer"
            onClick={() => navigate('/profile')}
          >
            <div className="text-center">
              <div className="text-5xl mb-3">👤</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Mon Profil</h3>
              <p className="text-sm text-gray-600 mb-4">
                Consultez et modifiez vos informations personnelles
              </p>
              <Button variant="outline" fullWidth size="sm">
                Voir le Profil
              </Button>
            </div>
          </CardSimple>
        </div>

        {/* Quick Info Card */}
        <CardSimple className="mt-6 bg-gradient-to-r from-gray-50 to-white border-l-4 border-esiee-blue">
          <h3 className="text-lg font-bold text-gray-800 mb-3">📋 Vos Informations</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Email</p>
              <p className="font-semibold text-gray-800 text-sm truncate">{student.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Filière</p>
              <p className="font-semibold text-gray-800 text-sm">{student.filiere}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Classement</p>
              <p className="font-semibold text-gray-800 text-sm">#{student.rank || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Niveau Anglais</p>
              <p className="font-semibold text-gray-800 text-sm">{student.englishLevel}</p>
            </div>
          </div>
        </CardSimple>
      </div>
    </div>
  );
}
