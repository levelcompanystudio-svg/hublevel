import {
  Activity,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckSquare,
  ClipboardCheck,
  DollarSign,
  FileSignature,
  FileText,
  LayoutDashboard,
  LayoutPanelTop,
  ListChecks,
  Plug,
  Settings,
  TrendingUp,
  Users,
  WandSparkles,
} from 'lucide-react';
import type { RoleName } from '../../auth/auth.types';
import type { NavigationItem } from './navigation.types';

export const navigationItems: NavigationItem[] = [
  {
    path: '/app/dashboard',
    label: 'Dashboard',
    description: 'Visao geral da operacao',
    icon: LayoutDashboard,
    roles: ['admin', 'gestor', 'colaborador'],
    group: 'Visao Geral',
  },
  {
    path: '/app/clientes',
    label: 'Clientes',
    description: 'Carteira de clientes',
    icon: Users,
    roles: ['admin', 'gestor'],
    group: 'Operacao',
  },
  {
    path: '/app/servicos',
    label: 'Servicos',
    description: 'Catalogo de ofertas',
    icon: BriefcaseBusiness,
    roles: ['admin', 'gestor'],
    group: 'Operacao',
  },
  {
    path: '/app/tarefas',
    label: 'Tarefas',
    description: 'Execucao operacional',
    icon: CheckSquare,
    roles: ['admin', 'gestor', 'colaborador'],
    group: 'Operacao',
  },
  {
    path: '/app/acompanhamento',
    label: 'Acompanhamento',
    description: 'Atualizacoes semanais por cliente',
    icon: Activity,
    roles: ['admin', 'gestor'],
    group: 'Operacao',
  },
  {
    path: '/app/reunioes',
    label: 'Reunioes',
    description: 'Agenda CS e consultorias por cliente',
    icon: CalendarDays,
    roles: ['admin', 'gestor'],
    group: 'Operacao',
  },
  {
    path: '/app/entregaveis',
    label: 'Entregaveis',
    description: 'Entregaveis por cliente, com prazos, prioridade e status',
    icon: ClipboardCheck,
    roles: ['admin', 'gestor', 'colaborador'],
    group: 'Operacao',
  },
  {
    path: '/app/documentos',
    label: 'Documentos',
    description: 'Contratos, propostas e arquivos por cliente',
    icon: FileText,
    roles: ['admin', 'gestor'],
    group: 'Operacao',
  },
  {
    path: '/app/checklist',
    label: 'Checklist',
    description: 'Pendencias operacionais por cliente',
    icon: ListChecks,
    roles: ['admin', 'gestor', 'colaborador'],
    group: 'Operacao',
  },
  {
    path: '/app/painel-administrativo',
    label: 'Painel Administrativo',
    description: 'Indicadores administrativos e financeiros globais',
    icon: LayoutPanelTop,
    roles: ['admin'],
    group: 'Gestao',
  },
  {
    path: '/app/contratos',
    label: 'Contratos',
    description: 'Controle administrativo',
    icon: FileSignature,
    roles: ['admin'],
    group: 'Gestao',
  },
  {
    path: '/app/financeiro',
    label: 'Financeiro',
    description: 'Receita e cobrancas',
    icon: DollarSign,
    roles: ['admin'],
    group: 'Gestao',
  },
  {
    path: '/app/alertas',
    label: 'Alertas',
    description: 'Riscos operacionais calculados em tempo real',
    icon: Bell,
    roles: ['admin', 'gestor'],
    group: 'Gestao',
  },
  {
    path: '/app/performance',
    label: 'Performance',
    description: 'Investimento, leads e satisfacao (aguardando integracao)',
    icon: TrendingUp,
    roles: ['admin', 'gestor'],
    group: 'Gestao',
  },
  {
    path: '/app/integracoes',
    label: 'Integracoes',
    description: 'Meta Ads, Google Ads, CRM e WhatsApp (nao conectado)',
    icon: Plug,
    roles: ['admin', 'gestor'],
    group: 'Gestao',
  },
  {
    path: '/app/planejador',
    label: 'Planejador',
    description: 'Briefing de landing page por cliente (rascunho local)',
    icon: WandSparkles,
    roles: ['admin', 'gestor'],
    group: 'Gestao',
  },
  {
    path: '/app/configuracoes',
    label: 'Configuracoes',
    description: 'Parametros do sistema',
    icon: Settings,
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
