import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, FileText, File, FileCode } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ProgressBar } from '../ui/ProgressBar';
import { documentAPI } from '../../services/documentAPI';

const FILE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText size={16} className="text-danger" />,
  docx: <File size={16} className="text-accent" />,
  txt: <FileCode size={16} className="text-success" />,
  md: <FileCode size={16} className="text-warning" />,
};

const ALLOWED = ['pdf', 'docx', 'txt', 'md'];
const MAX_FILE_SIZE = 200 * 1024 * 1024;

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  kbId: number;
  onSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  open,
  onClose,
  kbId,
  onSuccess,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [category, setCategory] = useState('');
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    }

    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const addFiles = (selected: FileList | File[]) => {
    const incoming = Array.from(selected);
    const valid: File[] = [];
    const errors: string[] = [];

    for (const file of incoming) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      if (!ALLOWED.includes(ext)) {
        errors.push(`${file.name}: unsupported file type`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: maximum size is 200 MB`);
        continue;
      }

      valid.push(file);
    }

    setFiles(prev => {
      const existing = new Set(
        prev.map(
          file => `${file.name}-${file.size}-${file.lastModified}`
        )
      );

      const unique = valid.filter(
        file =>
          !existing.has(
            `${file.name}-${file.size}-${file.lastModified}`
          )
      );

      return [...prev, ...unique];
    });

    setError(errors.length ? errors.join(' | ') : '');

    if (valid.length === 1 && incoming.length === 1) {
      setTitle(valid[0].name.replace(/\.[^/.]+$/, ''));
    } else if (valid.length > 1 || incoming.length > 1) {
      setTitle('');
    }
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);

    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFiles([]);
    setTitle('');
    setTagsInput('');
    setCategory('');
    setProgress(0);
    setError('');

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const tags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);

      for (let i = 0; i < files.length; i++) {
        const currentFile = files[i];

        setProgress(0);

        await documentAPI.upload(
          {
            file: currentFile,
            knowledge_base_id: kbId,
            title:
              files.length === 1
                ? title
                : currentFile.name.replace(/\.[^/.]+$/, ''),
            tags,
            category: category || undefined,
          },
          setProgress
        );
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (e: any) {
      setError(
        e.response?.data?.detail || 'Upload failed'
      );
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Upload Documents"
      size="md"
    >
      {/* Drop Zone */}
      <div
        onDragOver={e => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() =>
          !uploading && inputRef.current?.click()
        }
        className={`
          border-2 border-dashed rounded-xl p-6 text-center
          transition-all duration-200 mb-5
          ${files.length
            ? 'border-success/40 bg-success/5'
            : dragging
              ? 'border-accent bg-accent/10'
              : 'border-border hover:border-accent/50 cursor-pointer'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.md"
          className="hidden"
          onChange={e => {
            if (e.target.files) {
              addFiles(e.target.files);
            }
          }}
        />

        {files.length > 0 ? (
          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-text-primary">
                {files.length} file
                {files.length !== 1 ? 's' : ''} selected
              </p>

              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  resetForm();
                }}
                className="text-xs text-danger hover:underline"
              >
                Clear all
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {files.map((file, index) => {
                const ext =
                  file.name
                    .split('.')
                    .pop()
                    ?.toLowerCase() || '';

                return (
                  <div
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    className="flex items-center gap-3 p-2 rounded-lg border border-border bg-bg-tertiary"
                  >
                    <div className="w-9 h-9 rounded-lg surface-ghost flex items-center justify-center">
                      {FILE_ICONS[ext] || (
                        <File
                          size={18}
                          className="text-text-muted"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {file.name}
                      </p>

                      <p className="text-xs text-text-muted">
                        {formatSize(file.size)}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={uploading}
                      onClick={e => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="text-text-muted hover:text-danger disabled:opacity-50"
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-text-muted text-center pt-2">
              Click here or drag more files to add them
            </p>
          </div>
        ) : (
          <div>
            <Upload
              size={28}
              className="mx-auto text-text-muted mb-2"
            />

            <p className="text-sm text-text-secondary font-medium">
              Drop your files here or click to browse
            </p>

            <p className="text-xs text-text-muted mt-1">
              PDF, DOCX, TXT, MD — up to 200 MB per file
            </p>
          </div>
        )}
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <Input
          label="Document Title"
          placeholder={
            files.length > 1
              ? 'Titles will use file names'
              : 'e.g. Q4 Sales Contract'
          }
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={files.length > 1}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Tags (comma-separated)"
            placeholder="legal, contract, 2024"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">
              Category
            </label>

            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-border-active"
            >
              <option value="">None</option>
              <option>HR</option>
              <option>Legal</option>
              <option>Finance</option>
              <option>Engineering</option>
              <option>Sales</option>
            </select>
          </div>
        </div>

        {uploading && (
          <ProgressBar
            value={progress}
            label={`Uploading ${files.length} file${files.length !== 1 ? 's' : ''
              }...`}
          />
        )}

        {error && (
          <p className="text-xs text-danger bg-danger/5 border border-danger/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1"
            disabled={uploading}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            loading={uploading}
            disabled={files.length === 0 || uploading}
            className="flex-1"
          >
            Upload & Process
          </Button>
        </div>
      </div>
    </Modal>
  );
};