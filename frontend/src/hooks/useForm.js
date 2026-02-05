/**
 * Hook pour la gestion des formulaires
 */
import { useState, useCallback, useMemo } from 'react';

/**
 * Hook generique pour la gestion de formulaires
 * @param {Object} initialValues - Valeurs initiales du formulaire
 * @param {Function} validate - Fonction de validation (optionnelle)
 * @param {Function} onSubmit - Fonction appelee lors de la soumission
 */
export function useForm(initialValues, { validate, onSubmit } = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verifier si le formulaire est valide
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  // Verifier si le formulaire a ete modifie
  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);

  // Mise a jour d'un champ
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setValues(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Supprimer l'erreur quand le champ est modifie
    if (errors[name]) {
      setErrors(prev => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  }, [errors]);

  // Mise a jour d'un champ specifique
  const setValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Mise a jour de plusieurs champs
  const setMultipleValues = useCallback((newValues) => {
    setValues(prev => ({
      ...prev,
      ...newValues
    }));
  }, []);

  // Marquer un champ comme touche
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Valider le champ si une fonction de validation existe
    if (validate) {
      const validationErrors = validate(values);
      if (validationErrors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: validationErrors[name]
        }));
      }
    }
  }, [values, validate]);

  // Valider tout le formulaire
  const validateForm = useCallback(() => {
    if (!validate) return true;

    const validationErrors = validate(values);
    setErrors(validationErrors);

    // Marquer tous les champs comme touches
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    return Object.keys(validationErrors).length === 0;
  }, [values, validate]);

  // Soumettre le formulaire
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(values);
      }
    } catch (error) {
      // L'erreur sera geree par le composant parent
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm, onSubmit]);

  // Reinitialiser le formulaire
  const reset = useCallback((newValues) => {
    setValues(newValues || initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Definir une erreur specifique
  const setError = useCallback((name, message) => {
    setErrors(prev => ({
      ...prev,
      [name]: message
    }));
  }, []);

  // Effacer les erreurs
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Props a passer aux inputs
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: handleChange,
    onBlur: handleBlur,
    error: touched[name] ? errors[name] : undefined,
  }), [values, errors, touched, handleChange, handleBlur]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
    setMultipleValues,
    setError,
    clearErrors,
    reset,
    validateForm,
    getFieldProps,
  };
}

/**
 * Validateurs courants
 */
export const validators = {
  required: (message = 'Ce champ est requis') => (value) =>
    value && value.toString().trim() ? undefined : message,

  email: (message = 'Email invalide') => (value) =>
    !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : message,

  minLength: (min, message) => (value) =>
    !value || value.length >= min ? undefined : message || `Minimum ${min} caracteres`,

  maxLength: (max, message) => (value) =>
    !value || value.length <= max ? undefined : message || `Maximum ${max} caracteres`,

  matches: (regex, message = 'Format invalide') => (value) =>
    !value || regex.test(value) ? undefined : message,

  min: (min, message) => (value) =>
    !value || parseFloat(value) >= min ? undefined : message || `Minimum ${min}`,

  max: (max, message) => (value) =>
    !value || parseFloat(value) <= max ? undefined : message || `Maximum ${max}`,

  integer: (message = 'Nombre entier requis') => (value) =>
    !value || Number.isInteger(parseFloat(value)) ? undefined : message,
};

/**
 * Combiner plusieurs validateurs
 */
export function combineValidators(...validators) {
  return (value) => {
    for (const validate of validators) {
      const error = validate(value);
      if (error) return error;
    }
    return undefined;
  };
}

/**
 * Creer un schema de validation
 */
export function createValidationSchema(schema) {
  return (values) => {
    const errors = {};
    
    for (const [field, validate] of Object.entries(schema)) {
      const error = validate(values[field]);
      if (error) {
        errors[field] = error;
      }
    }
    
    return errors;
  };
}

export default useForm;
