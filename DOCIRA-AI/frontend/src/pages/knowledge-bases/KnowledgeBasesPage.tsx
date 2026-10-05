import React, { useState } from 'react';
import { Plus, Database } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Button } from '../../components/ui/Button';
import { KBCard } from '../../components/knowledge-base/KBCard';
import { CreateKBModal } from '../../components/knowledge-base/CreateKBModal';
import { useKnowledgeBases } from '../../hooks/useKnowledgeBases';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const KnowledgeBasesPage: React.FC = () => {
  const [showCreate, setShowCreate] = useState(false);
  const { data: kbs, isLoading, create, remove } = useKnowledgeBases();

  return (
    <AppLayout breadcrumb={['Workspace', 'Knowledge Bases']}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Knowledge Bases</h1>
          <p className="text-sm text-text-muted mt-0.5">Organize your documents into topic collections</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={16} className="mr-1.5" /> New Knowledge Base
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size={32} /></div>
      ) : !kbs || kbs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
            <Database size={28} className="text-accent" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">No knowledge bases yet</h3>
          <p className="text-sm text-text-muted max-w-sm mb-6">
            Create your first knowledge base to start organizing and querying your documents with AI.
          </p>
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} className="mr-1.5" /> Create First Knowledge Base
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 fade-in">
          {kbs.map(kb => (
            <KBCard key={kb.id} kb={kb} onDelete={() => remove.mutate(kb.id)} />
          ))}
        </div>
      )}

      <CreateKBModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={async (data) => {
  await create.mutateAsync(data);
}}
      />
    </AppLayout>
  );
};