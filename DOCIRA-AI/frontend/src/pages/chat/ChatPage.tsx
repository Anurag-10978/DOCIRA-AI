import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { ConversationList } from '../../components/chat/ConversationList';
import { useConversations, useMessages } from '../../hooks/useChat';
import { GlassCard } from '../../components/ui/GlassCard';

export const ChatPage: React.FC = () => {
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [kbId, setKbId] = useState<number | null>(null);

  const { data: conversations = [], create, remove } = useConversations();
  const { data: messages = [], sendMessage, isTyping } = useMessages(activeConvId);

  const handleKbChange = async (id: number) => {
    setKbId(id);
    if (id) {
      const conv = await create.mutateAsync({ knowledge_base_id: id });
      setActiveConvId(conv.id);
    }
  };

  const handleNew = async () => {
    if (!kbId) return;
    const conv = await create.mutateAsync({ knowledge_base_id: kbId });
    setActiveConvId(conv.id);
  };

  return (
    <AppLayout breadcrumb={['Workspace', 'AI Chat']}>
      <div className="flex gap-4 h-[calc(100vh-8rem)]">
        <GlassCard className="w-64 flex-shrink-0 overflow-hidden">
          <ConversationList
            conversations={conversations}
            activeId={activeConvId}
            onSelect={setActiveConvId}
            onDelete={id => { remove.mutate(id); if (activeConvId === id) setActiveConvId(null); }}
            onNew={handleNew}
          />
        </GlassCard>
        <GlassCard className="flex-1 overflow-hidden">
          <ChatWindow
            conversationId={activeConvId}
            messages={messages}
            isTyping={isTyping}
            onSend={(content, taskType) => sendMessage({ content, task_type: taskType })}
            kbId={kbId}
            onKbChange={handleKbChange}
          />
        </GlassCard>
      </div>
    </AppLayout>
  );
};