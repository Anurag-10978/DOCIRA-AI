import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentAPI } from '../services/documentAPI';
import type { UploadPayload } from '../services/documentAPI';
import { useToast } from './useToast';

export function useDocuments(kbId: number) {
  const qc = useQueryClient();
  const { showToast } = useToast();

  const query = useQuery({
    queryKey: ['documents', kbId],
    queryFn: () => documentAPI.list(kbId).then(r => r.data),
    enabled: !!kbId,
    refetchInterval: (query) => {
  const docs = query.state.data ?? [];

  const hasActive = docs.some(
    (d) => d.status === 'processing' || d.status === 'pending'
  );

  return hasActive ? 3000 : false;
},
  });

  const upload = useMutation({
    mutationFn: ({ payload, onProgress }: { payload: UploadPayload; onProgress?: (n: number) => void }) =>
      documentAPI.upload(payload, onProgress).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents', kbId] });
      showToast('Document uploaded! Processing started...', 'success');
    },
    onError: (e: any) => showToast(e.response?.data?.detail || 'Upload failed', 'error'),
  });

  const remove = useMutation({
    mutationFn: (id: number) => documentAPI.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents', kbId] });
      showToast('Document deleted', 'success');
    },
  });

  const reprocess = useMutation({
    mutationFn: (id: number) => documentAPI.reprocess(id).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents', kbId] });
      showToast('Re-processing started!', 'success');
    },
  });

  return { ...query, upload, remove, reprocess };
}