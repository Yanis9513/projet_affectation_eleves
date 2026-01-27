/**
 * Form Validation Utilities
 */

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(String(email).toLowerCase())
}

export const validatePassword = (password) => {
  return password && password.length >= 6
}

export const getPasswordStrength = (password) => {
  if (!password) return { strength: 0, label: '', color: 'gray' }
  
  let strength = 0
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^a-zA-Z\d]/.test(password)) strength++
  
  const labels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort']
  const colors = ['red', 'orange', 'yellow', 'green', 'emerald']
  
  return {
    strength,
    label: labels[strength],
    color: colors[strength]
  }
}

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value.trim() !== ''
}

export const validateMinLength = (value, min) => {
  return value && value.length >= min
}

export const validateMaxLength = (value, max) => {
  return value && value.length <= max
}

export const validateNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value)
}

export const validateRange = (value, min, max) => {
  const num = parseFloat(value)
  return !isNaN(num) && num >= min && num <= max
}

export const formatErrorMessage = (field, rule) => {
  const messages = {
    required: `${field} est requis`,
    email: `${field} doit être une adresse email valide`,
    password: `${field} doit contenir au moins 6 caractères`,
    minLength: `${field} est trop court`,
    maxLength: `${field} est trop long`,
    number: `${field} doit être un nombre`,
    range: `${field} est hors limites`
  }
  return messages[rule] || `${field} est invalide`
}
