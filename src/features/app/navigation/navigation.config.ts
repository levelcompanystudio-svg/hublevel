import type { RoleName } from '../../auth/auth.types';
import type { NavigationItem } from './navigation.types';

export const navigationItems: NavigationItem[] = [
  {
    path: '/app/dashboard',
    label: 'Dashboard',
    description: 'Visao geral da operacao',
    icon: 'D',
    roles: ['admin', 'gestor', 'colaborador'],
    group: 'Visao Geral',
  },
  {
    path: '/app/clientes',
    label: 'Clientes',
    description: 'Carteira de clientes',
    icon: 'C',
    roles: ['admin', 'gestor'],
    group: 'Operacao',
  },
  {
    path: '/app/servicos',
    label: 'Servicos',
    description: 'Catalogo de ofertas',
    icon: 'S',
    roles: ['admin', 'gestor'],
    group: 'Operacao',
  },
  {
    path: '/app/tarefas',
    label: 'Tarefas',
    description: 'Execucao operacional',
    icon: 'T',
    roles: ['admin', 'gestor', 'colaborador'],
    group: 'Operacao',
  },
  {
    path: '/app/acompanhamento',
    label: 'Acompanhamento',
    description: 'Atualizacoes semanais por cliente',
    icon: 'U',
    roles: ['admin', 'gestor'],
    group: 'Operacao',
  },
  {
    path: '/app/reunioes',
    label: 'Reunioes',
    description: 'Agenda CS e consultorias por cliente',
    icon: 'R',
    roles: ['admin', 'gestor'],
    group: 'Operacao',
  },
  {
    path: '/app/documentos',
    label: 'Documentos',
    description: 'Contratos, propostas e arquivos por cliente',
    icon: 'Dc',
    roles: ['admin', 'gestor'],
    group: 'Operacao',
  },
  {
    path: '/app/checklist',
    label: 'Checklist',
    description: 'Entregaveis e pendencias por cliente',
    icon: 'X',
    roles: ['admin', 'gestor', 'colaborador'],
    group: 'Operacao',
  },
  {
    path: '/app/contratos',
    label: 'Contratos',
    description: 'Controle administrativo',
    icon: 'K',
    roles: ['admin'],
    group: 'Gestao',
  },
  {
    path: '/app/financeiro',
    label: 'Financeiro',
    description: 'Receita e cobrancas',
    icon: 'F',
    roles: ['admin'],
    group: 'Gestao',
  },
  {
    path: '/app/alertas',
    label: 'Alertas',
    description: 'Riscos operacionais calculados em tempo real',
    icon: 'L',
    roles: ['admin', 'gestor'],
    group: 'Gestao',
  },
  {
    path: '/app/configuracoes',
    label: 'Configuracoes',
    description: 'Parametros do sistema',
    icon: 'A',
    roles: ['admin'],
    group: 'Administracao',
  },
];

export function getNavigationForRole(role?: RoleName): NavigationItem[] {
  if (!role) return [];
  return navigationItems.filter((item) => item.roles.includes(role));
}

export function canAccessPath(role: RoleName | undefined, path: string): boolean {
  if (!role) return false;
  const item = navigationItems.find((entry) => entry.path === path);
  return item ? item.roles.includes(role) : true;
}

export function getNavigationItem(pathname: string): NavigationItem | undefined {
  const exactMatch = navigationItems.find((item) => item.path === pathname);
  if (exactMatch) return exactMatch;

  // Rotas aninhadas (detalhe/novo/editar) nao tem entrada propria no menu;
  // resolve para o item de navegacao pai mais especifico (ex.: /app/clientes/:id/editar -> Clientes).
  const parentMatches = navigationItems
    .filter((item) => pathname.startsWith(`${item.path}/`))
    .sort((a, b) => b.path.length - a.path.length);

  return parentMatches[0];
}
