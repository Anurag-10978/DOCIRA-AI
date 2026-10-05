import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsAPI } from '../services/settingsAPI';
import { useToast } from './useToast';
import type { AISettings } from '../services/settingsAPI';
export function useSettings() {
  const qc = useQueryClient();
  const { showToast } = useToast();

  const settings = useQuery({
    queryKey: ['ai-settings'],
    queryFn:  () => settingsAPI.getAI().then(r => r.data),
  });

  const models = useQuery({
    queryKey: ['ollama-models'],
    queryFn:  () => settingsAPI.getModels().then(r => r.data.models),
  });

  const update = useMutation({
    mutationFn: (data: Partial<AISettings>) => settingsAPI.updateAI(data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-settings'] });
      showToast('Settings saved!', 'success');
    },
    onError: () => showToast('Failed to save settings', 'error'),
  });

  const pullModel = useMutation({
    mutationFn: (model: string) => settingsAPI.pullModel(model),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ollama-models'] });
      showToast('Model pulled successfully!', 'success');
    },
    onError: () => showToast('Failed to pull model', 'error'),
  });

  return { settings, models, update, pullModel };
}