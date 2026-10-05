import React from 'react';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import type { Conversation } from '../../services/chatAPI';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { exportAPI } from '../../services/exportAPI';
interface Props {
  conversations: Conversation[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onNew: () => void;
}

export const ConversationList: React.FC<Props> = ({ conversations, activeId, onSelect, onDelete, onNew }) => (
  <div className="flex flex-col h-full">
    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Conversations</h3>
      <button onClick={onNew} className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center text-accent hover:bg-accent/20 transition-colors">
        <Plus size={14} />
      </button>
    </div>

    <div className="flex-1 overflow-y-auto p-2">
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MessageSquare size={24} className="text-text-muted mb-2" />
          <p className="text-xs text-text-muted">No conversations yet</p>
        </div>
      ) : (
        conversations.map(conv => (
          <div
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`group flex items-start gap-2 p-3 rounded-xl cursor-pointer transition-all mb-1
              ${activeId === conv.id ? 'bg-accent/10 border border-accent/20' : 'hover:surface-ghost border border-transparent'}`}
          >
            <MessageSquare size={14} className={`mt-0.5 flex-shrink-0 ${activeId === conv.id ? 'text-accent' : 'text-text-muted'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-primary truncate">{conv.title}</p>
              {conv.last_message && <p className="text-[10px] text-text-muted truncate mt-0.5">{conv.last_message}</p>}
              <p className="text-[10px] text-text-muted mt-0.5">{format(new Date(conv.updated_at), 'd MMM · HH:mm')}</p>
            </div>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
  {/* Export this conversation */}
  <button
    onClick={e => {
      e.stopPropagation();
      exportAPI.chatMarkdown(conv.id, conv.title);
    }}
    title="Export as Markdown"
    className="text-text-muted hover:text-accent transition-all p-0.5 rounded"
  >
    <Download size={12} />
  </button>

  {/* Delete */}
  <button
    onClick={e => { e.stopPropagation(); onDelete(conv.id); }}
    className="text-text-muted hover:text-danger transition-all p-0.5 rounded"
  >
    <Trash2 size={12} />
  </button>
</div>
          </div>
        ))
      )}
    </div>
  </div>
);