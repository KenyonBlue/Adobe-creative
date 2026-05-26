import { useState } from 'react';
import {
  PRESET_AUDIENCES,
  addCustomAudience,
  audienceIsSelected,
  getCustomAudiences,
  parseList,
  serializeList,
  toggleAudience,
} from '../utils/brief-form';

interface AudiencePickerProps {
  label?: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
}

export default function AudiencePicker({
  label = 'Target Audiences',
  hint,
  value,
  onChange,
}: AudiencePickerProps) {
  const selected = parseList(value);
  const customAudiences = getCustomAudiences(selected);
  const [customInput, setCustomInput] = useState('');

  const updateSelected = (next: string[]) => {
    onChange(serializeList(next));
  };

  const handleToggle = (audience: string) => {
    updateSelected(toggleAudience(selected, audience));
  };

  const handleAddCustom = () => {
    const next = addCustomAudience(selected, customInput);
    if (next.length !== selected.length) {
      updateSelected(next);
      setCustomInput('');
    }
  };

  return (
    <div>
      <label className="studio-label">{label}</label>

      <div className="flex flex-wrap gap-2">
        {PRESET_AUDIENCES.map((audience) => {
          const isSelected = audienceIsSelected(selected, audience);
          return (
            <button
              key={audience}
              type="button"
              onClick={() => handleToggle(audience)}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                isSelected
                  ? 'bg-blue-500/20 text-blue-200 ring-1 ring-blue-500/40'
                  : 'bg-white/[0.04] text-zinc-400 ring-1 ring-white/[0.06] hover:bg-white/[0.06] hover:text-zinc-200'
              }`}
              aria-pressed={isSelected}
            >
              {audience}
            </button>
          );
        })}
      </div>

      {customAudiences.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-xs text-zinc-500">Custom audiences</p>
          <div className="flex flex-wrap gap-2">
            {customAudiences.map((audience) => (
              <button
                key={audience}
                type="button"
                onClick={() => handleToggle(audience)}
                className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 px-3 py-1.5 text-sm text-violet-200 ring-1 ring-violet-500/30 transition hover:bg-violet-500/25"
              >
                {audience}
                <span className="text-violet-300/70" aria-hidden>
                  ×
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddCustom();
            }
          }}
          placeholder="Add custom audience"
          className="studio-input flex-1"
        />
        <button
          type="button"
          onClick={handleAddCustom}
          disabled={!customInput.trim()}
          className="shrink-0 rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-zinc-300 ring-1 ring-white/[0.06] transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add
        </button>
      </div>

      {selected.length > 0 && (
        <p className="mt-2 text-xs text-zinc-500">
          {selected.length} audience{selected.length === 1 ? '' : 's'} selected
        </p>
      )}

      {hint && <p className="mt-1.5 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}
