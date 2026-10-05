import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
];

const CATEGORIES = [
  'HR',
  'Legal',
  'Finance',
  'Engineering',
  'Sales',
  'Operations',
  'Other',
];

interface CreateKBModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    description?: string;
    category?: string;
    color: string;
  }) => Promise<void>;
}

export const CreateKBModal: React.FC<CreateKBModalProps> = ({
  open,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await onCreate({
        name: name.trim(),
        description: description || undefined,
        category: category || undefined,
        color,
      });

      setName('');
      setDescription('');
      setCategory('');
      setColor(COLORS[0]);
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Knowledge Base"
    >
      <div className="space-y-5">

        {/* Name */}
        <Input
          label="Name"
          placeholder="e.g. Legal Documents"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        {/* Description */}
        <Input
          label="Description (optional)"
          placeholder="What documents will this contain?"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        {/* Category */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text-secondary">
            Category
          </label>

          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="
              w-full
              surface-control
              border border-border
              rounded-xl
              px-4 py-3
              text-text-primary
              text-sm
              shadow-[0_4px_16px_rgba(51,39,26,0.05)]
              backdrop-blur-md
              transition-all
              duration-200
              hover:bg-bg-tertiary
              focus:outline-none
              focus:ring-2
              focus:ring-violet-300/40
              focus:border-violet-300/60
            "
          >
            <option value="">Select category</option>

            {CATEGORIES.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Accent Color */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text-secondary">
            Accent Color
          </label>

          <div className="flex gap-3">
            {COLORS.map(c => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`
                  w-9 h-9
                  rounded-xl
                  transition-all
                  duration-200
                  shadow-sm
                  hover:scale-110
                  ${color === c
                    ? 'ring-2 ring-violet-400 ring-offset-2 ring-offset-[var(--bg-primary)] scale-110 shadow-lg'
                    : 'opacity-90 hover:opacity-100'
                  }
                `}
                style={{ backgroundColor: c }}
                aria-label={`Select ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="
            text-xs
            text-red-600
            bg-red-50/70
            border border-red-200/70
            rounded-xl
            px-3
            py-2
            backdrop-blur-sm
          ">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">

          <Button
            variant="ghost"
            onClick={onClose}
            className="
              flex-1
              !surface-control
              !border
              !border-border
              !text-text-secondary
              hover:!bg-bg-tertiary
              !rounded-xl
              shadow-sm
              backdrop-blur-md
            "
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            loading={loading}
            className="
              flex-1
              !rounded-xl
              !bg-gradient-to-r
              !from-violet-500
              !to-purple-500
              !text-white
              shadow-[0_8px_24px_rgba(124,58,237,0.25)]
              hover:!from-violet-600
              hover:!to-purple-600
              transition-all
              duration-200
            "
          >
            Create
          </Button>

        </div>
      </div>
    </Modal>
  );
};