import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { getErrorMessage } from '../utils/format.js';

// Owns API status and document list. Effects must return cleanup functions or undefined—never a Promise.
export function useWorkspace() {
  const [documents, setDocuments] = useState([]);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setLoading(true);
    try {
      const [documentData, healthData] = await Promise.all([api.documents(), api.health()]);
      setDocuments(Array.isArray(documentData.documents) ? documentData.documents : []);
      setHealth(healthData);
      setError('');
      return true;
    } catch (err) {
      setHealth(null);
      setError(getErrorMessage(err, 'Could not load workspace.'));
      return false;
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Deliberately do not return refresh(): it is async and returns a Promise.
    void refresh();
  }, [refresh]);

  return { documents, health, error, setError, loading, refresh };
}
