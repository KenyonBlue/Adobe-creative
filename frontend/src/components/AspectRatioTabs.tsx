import { AspectRatioKey } from '../types';

interface AspectRatioTabsProps {
  selected: AspectRatioKey;
  onChange: (ratio: AspectRatioKey) => void;
  compact?: boolean;
}

const RATIOS: { key: AspectRatioKey; label: string; sub: string }[] = [
  { key: '1x1', label: '1:1', sub: 'Square' },
  { key: '9x16', label: '9:16', sub: 'Story' },
  { key: '16x9', label: '16:9', sub: 'Wide' },
];

export default function AspectRatioTabs({
  selected,
  onChange,
  compact = false,
}: AspectRatioTabsProps) {
  return (
    <div className={`flex gap-1 rounded-xl bg-white/[0.04] p-1 ${compact ? '' : ''}`}>
      {RATIOS.map(({ key, label, sub }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex flex-col items-center rounded-lg px-4 py-2 transition-all duration-200 ${
            selected === key
              ? 'bg-white/[0.1] text-white shadow-lg shadow-blue-500/10'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <span className="text-sm font-semibold">{label}</span>
          {!compact && <span className="text-[10px] text-zinc-500">{sub}</span>}
        </button>
      ))}
    </div>
  );
}
