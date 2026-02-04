import { useState } from 'react';
import Button from '../../components/Button';
import Input from '../../components/Input';

/**
 * Formulaire pour ajouter une destination (programme d'echange)
 */
export default function DestinationForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    spots: 1,
    description: '',
    requirements: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'spots' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.country.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Ajouter une destination
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nom de l'etablissement"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Universite de..."
            required
          />
          
          <Input
            label="Pays"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="France, Allemagne..."
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre de places"
            name="spots"
            type="number"
            min="1"
            value={formData.spots}
            onChange={handleChange}
            required
          />
          
          <Input
            label="Pre-requis (optionnel)"
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            placeholder="Niveau B2 requis..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description (optionnel)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Description de la destination..."
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Ajout...' : 'Ajouter la destination'}
          </Button>
        </div>
      </form>
    </div>
  );
}
