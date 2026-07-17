const PALETTE = [
  '#F97316', // orange
  '#DC2626', // red
  '#7C3AED', // violet
  '#059669', // emerald
  '#2563EB', // blue
  '#DB2777', // pink
  '#CA8A04', // amber
  '#0891B2', // cyan
  '#4F46E5', // indigo
  '#65A30D', // lime
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

interface ClientAvatarProps {
  name: string;
  logoUrl?: string | null;
  size?: 'sm' | 'md';
}

// Quando o cliente tem uma logo real enviada (logo_url), ela e exibida. Caso contrario, cai para
// um "logo" gerado deterministicamente a partir do nome (iniciais + cor estavel), sem inventar
// nenhum dado.
export function ClientAvatar({ name, logoUrl, size = 'md' }: ClientAvatarProps) {
  const color = PALETTE[hashString(name) % PALETTE.length];
  const sizeClass = size === 'sm' ? 'h-8 w-8 text-[11px]' : 'h-11 w-11 text-sm';

  if (logoUrl) {
    return (
      <div className={`${sizeClass} shrink-0 overflow-hidden rounded-xl border border-border bg-white shadow-sm`}>
        <img src={logoUrl} alt={name} className="h-full w-full object-contain" />
      </div>
    );
  }

  return (
    <div
      className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-sm`}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {initialsFor(name)}
    </div>
  );
}
