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
  size?: 'sm' | 'md';
}

// Nao ha campo de logo real no schema de clientes (sem upload/storage nesta etapa); usamos um
// "logo" gerado deterministicamente a partir do nome (iniciais + cor estavel), no mesmo espirito
// visual de avatares de SaaS, sem inventar nenhum dado.
export function ClientAvatar({ name, size = 'md' }: ClientAvatarProps) {
  const color = PALETTE[hashString(name) % PALETTE.length];
  const sizeClass = size === 'sm' ? 'h-8 w-8 text-[11px]' : 'h-11 w-11 text-sm';

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
