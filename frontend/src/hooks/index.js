/**
 * Export de tous les hooks personnalises
 */

// Hooks de donnees avec cache
export {
  useQuery,
  useMutation,
  usePaginatedQuery,
  invalidateQueries,
  clearCache,
  // Hooks specifiques
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useProjectStudents,
  useProjectAssignments,
  useProjectStats,
  useDestinations,
  useCreateDestination,
  useStudentPreferences,
  useSubmitPreferences,
  useExchangeStats,
  useOptimize,
  useAvailableProjects,
  useAuthCheck,
} from '../services/useQuery';

// Hooks utilitaires
export { useLocalStorage } from './useLocalStorage';
export { useDebounce, useDebouncedCallback, useThrottle } from './useDebounce';
export { useKeyPress, useKeyboardShortcuts, useEscape, useArrowKeys } from './useKeyboard';
export { useForm, validators, combineValidators, createValidationSchema } from './useForm';
export { 
  useMediaQuery, 
  useBreakpoint, 
  useDarkMode, 
  useReducedMotion, 
  useWindowSize, 
  useOrientation 
} from './useResponsive';
