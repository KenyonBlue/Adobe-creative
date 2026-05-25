import { useCallback, useRef, useState } from 'react';
import { uploadAssets } from '../api/client';
import { UploadedAsset } from '../types';

interface CampaignFormProps {
  briefJson: string;
  onBriefChange: (json: string) => void;
  onUploadedAssets: (assets: UploadedAsset[]) => void;
  onSubmit: () => void;
  isRunning: boolean;
}

export default function CampaignForm({
  briefJson,
  onBriefChange,
  onUploadedAssets,
  onSubmit,
  isRunning,
}: CampaignFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      setUploadStatus('Uploading...');
      try {
        const result = await uploadAssets(fileArray);
        onUploadedAssets(result.uploaded);
        setUploadStatus(`Uploaded ${result.uploaded.length} file(s)`);
      } catch (err) {
        setUploadStatus(err instanceof Error ? err.message : 'Upload failed');
      }
    },
    [onUploadedAssets]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-900">Campaign Brief</h2>

      <label className="mb-1 block text-sm font-medium text-gray-700">
        Brief JSON
      </label>
      <textarea
        value={briefJson}
        onChange={(e) => onBriefChange(e.target.value)}
        rows={16}
        className="mb-4 w-full rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-sm focus:border-adobe-blue focus:outline-none focus:ring-1 focus:ring-adobe-blue"
        spellCheck={false}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`mb-4 cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          dragOver
            ? 'border-adobe-blue bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <p className="text-sm font-medium text-gray-700">
          Drop product assets or logos here
        </p>
        <p className="mt-1 text-xs text-gray-500">PNG, JPG, WebP, SVG — up to 10MB</p>
        {uploadStatus && (
          <p className="mt-2 text-xs text-adobe-blue">{uploadStatus}</p>
        )}
      </div>

      <button
        onClick={onSubmit}
        disabled={isRunning}
        className="w-full rounded-lg bg-adobe-blue px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isRunning ? 'Generating Creatives...' : 'Run Pipeline'}
      </button>
    </div>
  );
}
