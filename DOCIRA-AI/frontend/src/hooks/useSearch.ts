import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchAPI } from '../services/searchAPI';
import type {SearchResponse} from '../services/searchAPI';
export function useSearch(kbId: number) {
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const history = useQuery({
    queryKey: ['search-history'],
    queryFn: () => searchAPI.history().then(r => r.data),
  });

  const frequent = useQuery({
    queryKey: ['search-frequent'],
    queryFn: () => searchAPI.frequent().then(r => r.data),
  });

  const search = async (query: string) => {
    if (!query.trim() || !kbId) return;
    setLoading(true);
    setError('');
    try {
      const res = await searchAPI.semantic({ query, knowledge_base_id: kbId });
      setResults(res.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    results, loading, error, search,
    history: history.data || [],
    frequent: frequent.data || [],
  };
}