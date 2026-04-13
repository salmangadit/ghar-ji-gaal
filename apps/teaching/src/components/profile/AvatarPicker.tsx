const AVATARS = [
  '🦁', '🐯', '🐻', '🐼', '🦊', '🐸',
  '🐨', '🐮', '🐷', '🐙', '🦋', '🦄',
  '🐬', '🦜', '🐧', '🦁', '🌟', '🚀',
];

interface AvatarPickerProps {
  selected: string;
  onChange: (emoji: string) => void;
}

export function AvatarPicker({ selected, onChange }: AvatarPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {AVATARS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onChange(emoji)}
          className={`text-2xl p-2 rounded-xl transition-all duration-150 ${
            selected === emoji
              ? 'bg-primary/20 ring-2 ring-primary scale-110'
              : 'bg-white/60 active:scale-95'
          }`}
          style={selected === emoji ? { '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties : {}}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
