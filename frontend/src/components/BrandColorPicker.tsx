import { useState } from 'react';

interface BrandColorPickerProps {
  label?: string;
  hint?: string;
  colors: string[];
  onChange: (colors: string[]) => void;
}

type EditorMode = { type: 'edit'; index: number } | { type: 'add' };

function normalizeHex(hex: string): string {
  return hex.toUpperCase();
}

function ColorEditor({
  draft,
  onDraftChange,
  onPick,
  onCancel,
  pickLabel,
}: {
  draft: string;
  onDraftChange: (hex: string) => void;
  onPick: () => void;
  onCancel: () => void;
  pickLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg bg-white/[0.04] p-3 ring-1 ring-white/[0.08]">
      <label className="relative shrink-0 cursor-pointer">
        <span
          className="block h-10 w-10 rounded-md ring-1 ring-white/10"
          style={{ backgroundColor: draft }}
        />
        <input
          type="color"
          value={draft}
          onChange={(e) => onDraftChange(normalizeHex(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="Choose color"
        />
      </label>
      <span className="font-mono text-sm text-zinc-300">{draft}</span>
      <div className="ml-auto flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-200"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onPick}
          className="rounded-lg bg-blue-500/20 px-3 py-1.5 text-sm font-medium text-blue-300 ring-1 ring-blue-500/30 transition hover:bg-blue-500/30"
        >
          {pickLabel}
        </button>
      </div>
    </div>
  );
}

export default function BrandColorPicker({
  label = 'Brand Colors',
  hint,
  colors,
  onChange,
}: BrandColorPickerProps) {
  const [editor, setEditor] = useState<EditorMode | null>(null);
  const [draft, setDraft] = useState('#1473E6');

  const openEdit = (index: number) => {
    setEditor({ type: 'edit', index });
    setDraft(colors[index]);
  };

  const openAdd = () => {
    setEditor({ type: 'add' });
    setDraft('#1473E6');
  };

  const closeEditor = () => {
    setEditor(null);
  };

  const handlePick = () => {
    const normalized = normalizeHex(draft);
    if (!editor) return;

    if (editor.type === 'add') {
      if (!colors.includes(normalized)) {
        onChange([...colors, normalized]);
      }
    } else {
      const next = colors.map((c, i) => (i === editor.index ? normalized : c));
      onChange(next);
    }
    closeEditor();
  };

  const removeColor = (index: number) => {
    if (editor?.type === 'edit' && editor.index === index) {
      closeEditor();
    }
    onChange(colors.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="studio-label">{label}</label>

      <div className="space-y-3">
        {colors.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {colors.map((color, index) => (
              <li
                key={`${color}-${index}`}
                className="group flex items-center gap-2 rounded-lg bg-white/[0.04] py-1.5 pl-1.5 pr-2 ring-1 ring-white/[0.06]"
              >
                <button
                  type="button"
                  onClick={() => openEdit(index)}
                  className="block h-8 w-8 rounded-md ring-1 ring-white/10 transition hover:ring-white/30"
                  style={{ backgroundColor: color }}
                  aria-label={`Edit color ${color}`}
                />
                <span className="font-mono text-xs text-zinc-400">{color}</span>
                <button
                  type="button"
                  onClick={() => removeColor(index)}
                  className="ml-1 flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
                  aria-label={`Remove ${color}`}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        {editor && (
          <ColorEditor
            draft={draft}
            onDraftChange={setDraft}
            onPick={handlePick}
            onCancel={closeEditor}
            pickLabel={editor.type === 'add' ? 'Add' : 'Pick'}
          />
        )}

        {!editor && (
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-zinc-400 ring-1 ring-white/[0.06] transition hover:bg-white/[0.06] hover:text-zinc-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add color
          </button>
        )}
      </div>

      {hint && <p className="mt-1.5 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}
