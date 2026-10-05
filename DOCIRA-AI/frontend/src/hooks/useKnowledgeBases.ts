import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeBaseAPI } from '../services/knowledgeBaseAPI';
import type { CreateKBPayload } from '../services/knowledgeBaseAPI';
import { useToast } from './useToast';

export function useKnowledgeBases() {
  const qc = useQueryClient();
  const { showToast } = useToast();

  const query = useQuery({
    queryKey: ['knowledge-bases'],
    queryFn: () => knowledgeBaseAPI.list().then(r => r.data),
  });

  const create = useMutation({
    mutationFn: (data: CreateKBPayload) => knowledgeBaseAPI.create(data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['knowledge-bases'] });
      showToast('Knowledge base created!', 'success');
    },
    onError: (e: any) => showToast(e.response?.data?.detail || 'Failed to create', 'error'),
  });

  const remove = useMutation({
    mutationFn: (id: number) => knowledgeBaseAPI.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['knowledge-bases'] });
      showToast('Knowledge base deleted', 'success');
    },
    onError: (e: any) => showToast(e.response?.data?.detail || 'Failed to delete', 'error'),
  });

  return { ...query, create, remove };
}