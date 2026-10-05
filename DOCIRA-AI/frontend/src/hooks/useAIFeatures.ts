import { useState } from 'react';
import { aiFeatureAPI} from '../services/aiFeatureAPI';
import { useToast } from './useToast';
import type {SummaryResult} from '../services/aiFeatureAPI';
import type {CompareResult } from '../services/aiFeatureAPI';
import type { ExtractResult } from '../services/aiFeatureAPI';
export function useAIFeatures() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const { showToast } = useToast();

  const summarize = async (kbId: number, docIds: number[], summaryType: string): Promise<SummaryResult | null> => {
    setLoading(true); setError('');
    try {
      const res = await aiFeatureAPI.summarize({ knowledge_base_id: kbId, document_ids: docIds, summary_type: summaryType });
      return res.data;
    } catch (e: any) {
      const msg = e.response?.data?.detail || 'Summarization failed';
      setError(msg); showToast(msg, 'error'); return null;
    } finally { setLoading(false); }
  };

  const compare = async (kbId: number, docAId: number, docBId: number, focus?: string): Promise<CompareResult | null> => {
    setLoading(true); setError('');
    try {
      const res = await aiFeatureAPI.compare({ knowledge_base_id: kbId, document_a_id: docAId, document_b_id: docBId, focus });
      return res.data;
    } catch (e: any) {
      const msg = e.response?.data?.detail || 'Comparison failed';
      setError(msg); showToast(msg, 'error'); return null;
    } finally { setLoading(false); }
  };

  const extract = async (kbId: number, docIds: number[], extractionType: string): Promise<ExtractResult | null> => {
    setLoading(true); setError('');
    try {
      const res = await aiFeatureAPI.extract({ knowledge_base_id: kbId, document_ids: docIds, extraction_type: extractionType });
      return res.data;
    } catch (e: any) {
      const msg = e.response?.data?.detail || 'Extraction failed';
      setError(msg); showToast(msg, 'error'); return null;
    } finally { setLoading(false); }
  };

  return { loading, error, summarize, compare, extract };
}