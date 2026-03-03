/**
 * Hooks personnalises pour la gestion des donnees API avec cache.
 * Remplace les appels API directs par une couche de cache intelligente.
 */
import { useState, useEffect, useCallback, useRef } from 'react';

// Cache simple en memoire
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Hook pour fetcher des donnees avec cache
 * @param {string} key - Cle unique pour le cache
 * @param {Function} fetcher - Fonction qui retourne une Promise
 * @param {Object} options - Options de configuration
 */
export function useQuery(key, fetcher, options = {}) {
  const {
    enabled = true,
    cacheTime = CACHE_DURATION,
    refetchOnWindowFocus = false,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const mountedRef = useRef(true);
  // Stabilize fetcher and callbacks via refs to avoid infinite re-fetch loops
  const fetcherRef = useRef(fetcher);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  fetcherRef.current = fetcher;
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  const fetchData = useCallback(async (skipCache = false) => {
    if (!enabled) return;

    // Verifier le cache
    const cacheKey = typeof key === 'string' ? key : JSON.stringify(key);
    const cached = cache.get(cacheKey);
    
    if (!skipCache && cached && Date.now() - cached.timestamp < cacheTime) {
      setData(cached.data);
      setIsLoading(false);
      return;
    }

    setIsFetching(true);
    
    try {
      const result = await fetcherRef.current();
      
      if (!mountedRef.current) return;
      
      // Mettre en cache
      cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      setData(result);
      setError(null);
      onSuccessRef.current?.(result);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err);
      onErrorRef.current?.(err);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setIsFetching(false);
      }
    }
  }, [key, enabled, cacheTime]);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Invalider le cache pour cette cle
  const invalidate = useCallback(() => {
    const cacheKey = typeof key === 'string' ? key : JSON.stringify(key);
    cache.delete(cacheKey);
  }, [key]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return;
    
    const handleFocus = () => {
      fetchData(true);
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, fetchData]);

  return {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
    invalidate
  };
}

/**
 * Hook pour les mutations (POST, PUT, DELETE)
 * @param {Function} mutationFn - Fonction de mutation
 * @param {Object} options - Options de configuration
 */
export function useMutation(mutationFn, options = {}) {
  const {
    onSuccess,
    onError,
    onSettled,
    invalidateKeys = [],
  } = options;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  // Stabilize callbacks via refs to avoid stale closures
  const mutationFnRef = useRef(mutationFn);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const onSettledRef = useRef(onSettled);
  mutationFnRef.current = mutationFn;
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;
  onSettledRef.current = onSettled;

  const mutate = useCallback(async (variables) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    setIsError(false);

    let resultData = undefined;
    let resultError = undefined;

    try {
      const result = await mutationFnRef.current(variables);
      resultData = result;
      setData(result);
      setIsSuccess(true);
      
      // Invalider les caches specifiees
      invalidateKeys.forEach(key => {
        const cacheKey = typeof key === 'string' ? key : JSON.stringify(key);
        cache.delete(cacheKey);
      });
      
      onSuccessRef.current?.(result, variables);
      return result;
    } catch (err) {
      resultError = err;
      setError(err);
      setIsError(true);
      onErrorRef.current?.(err, variables);
      throw err;
    } finally {
      setIsLoading(false);
      onSettledRef.current?.(resultData, resultError, variables);
    }
  }, [invalidateKeys]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    setIsSuccess(false);
    setIsError(false);
  }, []);

  return {
    mutate,
    mutateAsync: mutate,
    data,
    error,
    isLoading,
    isSuccess,
    isError,
    reset
  };
}

/**
 * Hook pour la pagination
 */
export function usePaginatedQuery(key, fetcher, options = {}) {
  const { page = 1, limit = 10, ...queryOptions } = options;
  
  const paginatedKey = `${key}_page${page}_limit${limit}`;
  
  return useQuery(
    paginatedKey,
    () => fetcher(page, limit),
    queryOptions
  );
}

/**
 * Invalider le cache global par prefixe
 */
export function invalidateQueries(keyPrefix) {
  for (const [key] of cache) {
    if (key.startsWith(keyPrefix)) {
      cache.delete(key);
    }
  }
}

/**
 * Vider tout le cache
 */
export function clearCache() {
  cache.clear();
}

/**
 * Hook pour les projets
 */
export function useProjects() {
  return useQuery('projects', async () => {
    const { projectAPI } = await import('./api');
    const response = await projectAPI.getAll();
    return response.data;
  });
}

/**
 * Hook pour un projet specifique
 */
export function useProject(projectId) {
  return useQuery(
    ['project', projectId],
    async () => {
      const { projectAPI } = await import('./api');
      const response = await projectAPI.getById(projectId);
      return response.data;
    },
    { enabled: !!projectId }
  );
}

/**
 * Hook pour creer un projet
 */
export function useCreateProject() {
  return useMutation(
    async (data) => {
      const { projectAPI } = await import('./api');
      const response = await projectAPI.create(data);
      return response.data;
    },
    {
      invalidateKeys: ['projects']
    }
  );
}

/**
 * Hook pour mettre a jour un projet
 */
export function useUpdateProject() {
  return useMutation(
    async ({ id, data }) => {
      const { projectAPI } = await import('./api');
      const response = await projectAPI.update(id, data);
      return response.data;
    },
    {
      invalidateKeys: ['projects']
    }
  );
}

/**
 * Hook pour supprimer un projet
 */
export function useDeleteProject() {
  return useMutation(
    async (id) => {
      const { projectAPI } = await import('./api');
      const response = await projectAPI.delete(id);
      return response.data;
    },
    {
      invalidateKeys: ['projects']
    }
  );
}

/**
 * Hook pour les etudiants d'un projet
 */
export function useProjectStudents(projectId) {
  return useQuery(
    ['projectStudents', projectId],
    async () => {
      const { projectAPI } = await import('./api');
      const response = await projectAPI.getStudents(projectId);
      return response.data;
    },
    { enabled: !!projectId }
  );
}

/**
 * Hook pour les affectations d'un projet
 */
export function useProjectAssignments(projectId) {
  return useQuery(
    ['projectAssignments', projectId],
    async () => {
      const { assignmentAPI } = await import('./api');
      const response = await assignmentAPI.getByProject(projectId);
      return response.data;
    },
    { enabled: !!projectId }
  );
}

/**
 * Hook pour les statistiques d'un projet
 */
export function useProjectStats(projectId) {
  return useQuery(
    ['projectStats', projectId],
    async () => {
      const { assignmentAPI } = await import('./api');
      const response = await assignmentAPI.getStats(projectId);
      return response.data;
    },
    { enabled: !!projectId }
  );
}

/**
 * Hook pour les destinations (exchange program)
 */
export function useDestinations(projectId) {
  return useQuery(
    ['destinations', projectId],
    async () => {
      const { destinationAPI } = await import('./api');
      const response = await destinationAPI.getByProject(projectId);
      return response.data;
    },
    { enabled: !!projectId }
  );
}

/**
 * Hook pour creer une destination
 */
export function useCreateDestination() {
  return useMutation(
    async ({ projectId, data }) => {
      const { destinationAPI } = await import('./api');
      const response = await destinationAPI.create(projectId, data);
      return response.data;
    },
    {
      onSuccess: (_, { projectId }) => {
        invalidateQueries(`["destinations","${projectId}"]`);
      }
    }
  );
}

/**
 * Hook pour les preferences d'un etudiant
 */
export function useStudentPreferences(projectId) {
  return useQuery(
    ['preferences', projectId],
    async () => {
      const { preferenceAPI } = await import('./api');
      const response = await preferenceAPI.getMine(projectId);
      return response.data;
    },
    { enabled: !!projectId }
  );
}

/**
 * Hook pour soumettre des preferences
 */
export function useSubmitPreferences() {
  return useMutation(
    async ({ projectId, preferences }) => {
      const { preferenceAPI } = await import('./api');
      const response = await preferenceAPI.submit(projectId, preferences);
      return response.data;
    },
    {
      onSuccess: (_, { projectId }) => {
        invalidateQueries(`["preferences","${projectId}"]`);
      }
    }
  );
}

/**
 * Hook pour les statistiques d'echange
 */
export function useExchangeStats(projectId) {
  return useQuery(
    ['exchangeStats', projectId],
    async () => {
      const { exchangeAPI } = await import('./api');
      const response = await exchangeAPI.getStats(projectId);
      return response.data;
    },
    { enabled: !!projectId }
  );
}

/**
 * Hook pour lancer l'optimisation
 */
export function useOptimize() {
  return useMutation(
    async (projectId) => {
      const { exchangeAPI } = await import('./api');
      const response = await exchangeAPI.optimize(projectId);
      return response.data;
    },
    {
      onSuccess: (_, projectId) => {
        invalidateQueries(`["projectAssignments","${projectId}"]`);
        invalidateQueries(`["projectStats","${projectId}"]`);
        invalidateQueries(`["exchangeStats","${projectId}"]`);
      }
    }
  );
}

/**
 * Hook pour les projets disponibles (pour etudiants)
 */
export function useAvailableProjects() {
  return useQuery('availableProjects', async () => {
    const { projectAPI } = await import('./api');
    const response = await projectAPI.getMyProjects();
    return response.data.filter(p => p.is_active && p.is_open_for_preferences);
  });
}

/**
 * Hook pour verifier l'etat d'authentification
 */
export function useAuthCheck() {
  return useQuery('authCheck', async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const { authAPI } = await import('./api');
    try {
      const response = await authAPI.verifyToken();
      return response.data;
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  });
}
