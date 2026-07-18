import { ChevronDown, Plus, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { SummaryCard } from '../../../components/layout/SummaryCard';
import { Badge, Button, Card } from '../../../components/ui';
import type {
  Deliverable,
  DeliverableClient,
  DeliverableFormValues,
  DeliverableProfile,
  DeliverableStatus,
} from '../deliverables.types';
import { emptyDeliverableFormValues } from '../deliverables.types';
import { DeliverablePriorityBadge } from './DeliverablePriorityBadge';
import { DeliverableStatusBadge } from './DeliverableStatusBadge';
import { formatDate } from './DeliverableTable';

interface DeliverableClientBoardProps {
  clients: DeliverableClient[];
  items: Deliverable[];
  assignees: DeliverableProfile[];
  currentUserId: string;
  saving: boolean;
  onCreate: (values: DeliverableFormValues) => Promise<void>;
}

const suggestions = [
  'Etiqueta Whats + Info Basica',
  'Analise SWOT',
  'Analise de Mercado Digital',
  'Analise de Tendencia de Crescimento',
  'Analise de Sazonalidade e Ciclo de Compra',
  'Estudo de Mercado Aprofundado',
  'Agente de IA - Identificacao de Gargalo',
  'Cliente Oculto',
  'Treinamento de Vendas',
  '2o Cliente Oculto - Aplicacao',
  'Implementacao de CRM + Pitch Easy Booster',
  'Estudo de Inovacao',
];

const statusLabels: Record<DeliverableStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  delivered: 'Entregue',
  approved: 'Aprovado',
  overdue: 'Atrasado',
  canceled: 'Cancelado',
};

const inputClassName =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground';

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function clientDisplayName(client: DeliverableClient) {
  return client.trade_name || client.company_name;
}

function isDone(item: Deliverable) {
  return item.status === 'delivered' || item.status === 'approved';
}

function isDelayed(item: Deliverable) {
  if (item.status === 'overdue') return true;
  if (!item.due_date || isDone(item) || item.status === 'canceled') return false;
  return item.due_date < new Date().toISOString().slice(0, 10);
}

function monthKey(value: string | null) {
  return value ? value.slice(0, 7) : '';
}

export function DeliverableClientBoard({
  clients,
  items,
  assignees,
  currentUserId,
  saving,
  onCreate,
}: DeliverableClientBoardProps) {
  const [search, setSearch] = useState('');
  const [managerId, setManagerId] = useState('all');
  const [status, setStatus] = useState<'all' | DeliverableStatus>('all');
  const [month, setMonth] = useState('all');
  const [openClientId, setOpenClientId] = useState<string | null>(clients[0]?.id ?? null);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [form, setForm] = useState<DeliverableFormValues>(emptyDeliverableFormValues);

  useEffect(() => {
    if (!openClientId && clients[0]) setOpenClientId(clients[0].id);
  }, [clients, openClientId]);

  const managers = useMemo(() => {
    const map = new Map<string, DeliverableProfile>();
    clients.forEach((client) => {
      const responsible = firstRelation(client.responsible);
      if (responsible) map.set(responsible.id, responsible);
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [clients]);

  const months = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      const key = monthKey(item.due_date || item.reference_month);
      if (key) set.add(key);
    });
    return Array.from(set).sort().reverse();
  }, [items]);

  const grouped = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return clients
      .filter((client) => {
        const responsible = firstRelation(client.responsible);
        if (managerId !== 'all' && responsible?.id !== managerId) return false;
        if (!normalizedSearch) return true;
        return clientDisplayName(client).toLowerCase().includes(normalizedSearch);
      })
      .map((client) => {
        const clientItems = items.filter((item) => {
          if (item.client_id !== client.id) return false;
          if (status !== 'all' && item.status !== status) return false;
          if (month !== 'all' && monthKey(item.due_date || item.reference_month) !== month) return false;
          return true;
        });
        return { client, items: clientItems };
      })
      .filter((group) => status === 'all' && month === 'all' ? true : group.items.length > 0);
  }, [clients, items, managerId, month, search, status]);

  const summary = useMemo(() => {
    const delivered = items.filter(isDone).length;
    const pending = items.filter((item) => item.status === 'pending' || item.status === 'in_progress').length;
    const delayedClients = clients.filter((client) => items.some((item) => item.client_id === client.id && isDelayed(item))).length;
    const withoutDeliverable = clients.filter((client) => !items.some((item) => item.client_id === client.id)).length;
    return { delivered, pending, delayedClients, withoutDeliverable };
  }, [clients, items]);

  function startCreate(clientId: string) {
    setOpenClientId(clientId);
    setEditingClientId(clientId);
    setForm({
      ...emptyDeliverableFormValues,
      client_id: clientId,
      assigned_to: currentUserId,
    });
  }

  function setField<K extends keyof DeliverableFormValues>(key: K, value: DeliverableFormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit() {
    if (!form.title.trim() || !form.client_id) return;
    try {
      await onCreate(form);
      setEditingClientId(null);
      setForm(emptyDeliverableFormValues);
    } catch {
      // A pagina exibe a mensagem de erro global; manter o formulario aberto.
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <SummaryCard label="Entregas realizadas" value={summary.delivered} tone="success" density="compact" />
        <SummaryCard label="Pendentes" value={summary.pending} tone="brand" density="compact" />
        <SummaryCard label="Clientes atrasados" value={summary.delayedClients} tone="warning" density="compact" />
        <SummaryCard label="Sem entregavel" value={summary.withoutDeliverable} density="compact" />
      </div>

      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar cliente..."
              className={`${inputClassName} pl-9`}
            />
          </label>
          <select value={managerId} onChange={(event) => setManagerId(event.target.value)} className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary">
            <option value="all">Todos os gestores</option>
            {managers.map((manager) => (
              <option key={manager.id} value={manager.id}>{manager.name}</option>
            ))}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value as 'all' | DeliverableStatus)} className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary">
            <option value="all">Todos</option>
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select value={month} onChange={(event) => setMonth(event.target.value)} className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary">
            <option value="all">Todos os meses</option>
            {months.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <p className="ml-auto text-sm text-muted-foreground">{grouped.length} clientes</p>
        </div>
      </Card>

      <div className="space-y-2.5">
        {grouped.map(({ client, items: clientItems }) => {
          const responsible = firstRelation(client.responsible);
          const opened = openClientId === client.id;
          const creating = editingClientId === client.id;

          return (
            <Card key={client.id} className="overflow-hidden p-0">
              <div className="flex w-full items-center gap-2 border-b border-border px-4 py-3">
                <button
                  type="button"
                  onClick={() => setOpenClientId(opened ? null : client.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${opened ? '' : '-rotate-90'}`} aria-hidden="true" />
                  <span className="truncate text-sm font-semibold text-foreground">{clientDisplayName(client)}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{responsible?.name ?? 'Sem responsavel'}</span>
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    startCreate(client.id);
                  }}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Adicionar
                </button>
              </div>

              {opened && (
                <div className={creating ? 'bg-primary/5 px-4 py-4' : 'px-4 py-4'}>
                  {creating ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-primary">Sugestoes - clique para preencher</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {suggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => setField('title', suggestion)}
                              className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:border-primary hover:text-primary"
                            >
                              <Plus className="h-3 w-3" aria-hidden="true" />
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-3 lg:grid-cols-2">
                        <Field label="Nome" required className="lg:col-span-2">
                          <input
                            required
                            value={form.title}
                            onChange={(event) => setField('title', event.target.value)}
                            placeholder="Ex: Relatorio mensal, Analise SWOT..."
                            className={inputClassName}
                          />
                        </Field>
                        <Field label="Descricao">
                          <input
                            value={form.description}
                            onChange={(event) => setField('description', event.target.value)}
                            placeholder="Detalhes opcionais..."
                            className={inputClassName}
                          />
                        </Field>
                        <Field label="Data prevista">
                          <input
                            type="date"
                            value={form.due_date}
                            onChange={(event) => setField('due_date', event.target.value)}
                            className={inputClassName}
                          />
                        </Field>
                        <Field label="Status">
                          <select value={form.status} onChange={(event) => setField('status', event.target.value as DeliverableStatus)} className={inputClassName}>
                            {Object.entries(statusLabels).map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Responsavel">
                          <select value={form.assigned_to} onChange={(event) => setField('assigned_to', event.target.value)} className={inputClassName}>
                            <option value="">Sem responsavel</option>
                            {assignees.map((assignee) => (
                              <option key={assignee.id} value={assignee.id}>{assignee.name}</option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Observacoes">
                          <input
                            value={form.notes}
                            onChange={(event) => setField('notes', event.target.value)}
                            placeholder="Anotacoes livres..."
                            className={inputClassName}
                          />
                        </Field>
                      </div>

                      <div className="flex gap-2">
                        <Button type="button" variant="secondary" onClick={() => setEditingClientId(null)} disabled={saving}>Cancelar</Button>
                        <Button type="button" variant="primary" onClick={() => void submit()} disabled={saving || !form.title.trim()}>
                          {saving ? 'Criando...' : 'Criar entregavel'}
                        </Button>
                      </div>
                    </div>
                  ) : clientItems.length === 0 ? (
                    <p className="py-2 text-center text-sm text-muted-foreground">Nenhum entregavel - clique em Adicionar para criar</p>
                  ) : (
                    <div className="space-y-2">
                      {clientItems.map((item) => (
                        <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background px-3 py-2">
                          <div className="min-w-[220px] flex-1">
                            <p className="text-sm font-semibold text-foreground">{item.title}</p>
                            {item.description && <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>}
                          </div>
                          <DeliverableStatusBadge status={item.status} />
                          <DeliverablePriorityBadge priority={item.priority} />
                          <Badge tone="neutral">{formatDate(item.due_date)}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, required = false, className = '', children }: { label: string; required?: boolean; className?: string; children: ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}{required ? ' *' : ''}</span>
      {children}
    </label>
  );
}
