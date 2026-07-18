import type { LucideIcon } from 'lucide-react';
import type { RoleName } from '../../auth/auth.types';

export interface NavigationItem {
  path: string;
  label: string;
  description: string;
  icon: LucideIcon;
  roles: RoleName[];
  group: 'Visao Geral' | 'Operacao' | 'Gestao';
}
