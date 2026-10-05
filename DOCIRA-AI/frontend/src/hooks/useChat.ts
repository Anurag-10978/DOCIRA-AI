import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatAPI  } from '../services/chatAPI';
import type {Message} from '../services/chatAPI';
import { useToast } from './useToast';

export function useConversations() {
  const qc = useQueryClient();
  const { showToast } = useToast();

  const query = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatAPI.listConversations().then(r => r.data),
  });

  const create = useMutation({
    mutationFn: (data: { title?: string; knowledge_base_id: number }) =>
      chatAPI.createConversation(data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conversations'] }),
    onError: (e: any) => showToast(e.response?.data?.detail || 'Failed', 'error'),
  });

  const remove = useMutation({
    mutationFn: (id: number) => chatAPI.deleteConversation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
      showToast('Conversation deleted', 'success');
    },
  });

  return { ...query, create, remove };
}

export function useMessages(convId: number | null) {
  const [isTyping, setIsTyping] = useState(false);
  const qc = useQueryClient();
  const { showToast } = useToast();

  const messagesQuery = useQuery({
    queryKey: ['messages', convId],
    queryFn: () => chatAPI.getMessages(convId!).then(r => r.data),
    enabled: !!convId,
  });

  const sendMessage = useCallback(async (payload: {
    content: string;
    task_type?: string;
    document_ids?: number[];
  }): Promise<Message | null> => {
    if (!convId) return null;
    setIsTyping(true);

    // Optimistic user message
    const tempMsg: Message = {
      id: Date.now(),
      conversation_id: convId,
      role: 'user',
      content: payload.content,
      citations: [],
      created_at: new Date().toISOString(),
    };

    qc.setQueryData(['messages', convId], (old: Message[] | undefined) =>
      [...(old || []), tempMsg]
    );

    try {
      const res = await chatAPI.sendMessage(convId, payload);
      const aiMsg = res.data;

      qc.setQueryData(['messages', convId], (old: Message[] | undefined) => {
        const filtered = (old || []).filter(m => m.id !== tempMsg.id);
        return [...filtered, tempMsg, aiMsg];
      });

      qc.invalidateQueries({ queryKey: ['conversations'] });
      return aiMsg;
    } catch (e: any) {
      showToast(e.response?.data?.detail || 'Failed to send', 'error');
      qc.setQueryData(['messages', convId], (old: Message[] | undefined) =>
        (old || []).filter(m => m.id !== tempMsg.id)
      );
      return null;
    } finally {
      setIsTyping(false);
    }
  }, [convId, qc, showToast]);

  return { ...messagesQuery, sendMessage, isTyping };
}