import { AspectRatioKey } from '../types';

interface AspectRatioTabsProps {
  selected: AspectRatioKey;
  onChange: (ratio: AspectRatioKey) => void;
}

const RATIOS: { key: AspectRatioKey; label: string }[] = [
  { key: '1x1', label: '1:1 Square' },
  { key: '9x16', label: '9:16 Story' },
  { key: '16x9', label: '16:9 Landscape' },
];

export default function AspectRatioTabs({ selected, onChange }: AspectRatioTabsProps) {
  return (
    <div className="flex gap-2">
      {RATIOS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            selected === key
              ? 'bg-adobe-blue text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
