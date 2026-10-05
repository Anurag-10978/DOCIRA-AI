import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../services/analyticsAPI';

export function useAnalytics() {
  const overview       = useQuery({ queryKey: ['analytics-overview'],  queryFn: () => analyticsAPI.overview().then(r => r.data),       staleTime: 60000 });
  const dailyQueries   = useQuery({ queryKey: ['analytics-daily'],     queryFn: () => analyticsAPI.dailyQueries().then(r => r.data),    staleTime: 60000 });
  const taskBreakdown  = useQuery({ queryKey: ['analytics-tasks'],     queryFn: () => analyticsAPI.taskBreakdown().then(r => r.data),   staleTime: 60000 });
  const documentStatus = useQuery({ queryKey: ['analytics-docstatus'], queryFn: () => analyticsAPI.documentStatus().then(r => r.data),  staleTime: 60000 });
  const topDocuments   = useQuery({ queryKey: ['analytics-topdocs'],   queryFn: () => analyticsAPI.topDocuments().then(r => r.data),    staleTime: 60000 });
  const storage        = useQuery({ queryKey: ['analytics-storage'],   queryFn: () => analyticsAPI.storage().then(r => r.data),         staleTime: 60000 });

  return { overview, dailyQueries, taskBreakdown, documentStatus, topDocuments, storage };
}