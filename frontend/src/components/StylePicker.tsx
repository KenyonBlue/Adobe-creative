import { STYLE_PRESETS } from '../utils/brief-form';

interface StylePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export default function StylePicker({ value, onChange }: StylePickerProps) {
  const isCustom = !STYLE_PRESETS.some((preset) => preset.prompt === value);

  return (
    <div>
      <label className="studio-label">Creative Style</label>
      <div className="flex flex-wrap gap-2">
        {STYLE_PRESETS.map((preset) => {
          const selected = value === preset.prompt;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset.prompt)}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                selected
                  ? 'bg-blue-500/20 text-blue-200 ring-1 ring-blue-500/40'
                  : 'bg-white/[0.04] text-zinc-400 ring-1 ring-white/[0.06] hover:bg-white/[0.06] hover:text-zinc-200'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
      <input
        type="text"
        value={isCustom ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or type a custom style direction"
        className="studio-input mt-3"
      />
      {!isCustom && value && (
        <p className="mt-1.5 text-xs text-zinc-500">Preset selected — type above to override</p>
      )}
    </div>
  );
}
