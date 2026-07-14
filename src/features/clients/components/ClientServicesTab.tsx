import { useCallback, useEffect, useState } from 'react';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Button, Card } from '../../../components/ui';
import { listServices } from '../../services/services.api';
import type { Service } from '../../services/services.types';
import { createClientService, listClientServices, updateClientService } from '../client-services.api';
import type { ClientService, ClientServiceFormValues } from '../client-services.types';
import { emptyClientServiceFormValues, validateClientServiceForm } from '../client-services.types';
import { ClientServiceForm } from './ClientServiceForm';
import { ClientServiceStatusBadge } from './ClientServiceStatusBadge';

interface ClientServicesTabProps {
  clientId: string;
  canManage: boolean;
}

function formatCurrency(value: number | null): string {
  if (value === null) return 'Sem valor definido';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(value: string | null): string {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T00:00:00`));
}

function serviceName(item: ClientService): string {
  const service = Array.isArray(item.service) ? item.service[0] : item.service;
  return service?.name ?? 'Servico do catalogo';
}

function serviceCategory(item: ClientService): string | null {
  const service = Array.isArray(item.service) ? item.service[0] : item.service;
  return service?.category ?? null;
}

export function ClientServicesTab({ clientId, canManage }: ClientServicesTabProps) {
  const [items, setItems] = useState<ClientService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [catalog, setCatalog] = useState<Service[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [values, setValues] = useState<ClientServiceFormValues>(emptyClientServiceFormValues);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await listClientServices(clientId);
      setItems(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar servicos contratados.');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  async function ensureCatalogLoaded() {
    if (catalog.length > 0 || catalogLoading) return;
    try {
      setCatalogLoading(true);
      const result = await listServices(false);
      setCatalog(result);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Erro ao carregar catalogo de servicos.');
    } finally {
      setCatalogLoading(false);
    }
  }

  async function openCreate() {
    setEditingId(null);
    setValues(emptyClientServiceFormValues);
    setFormError(null);
    setFormOpen(true);
    await ensureCatalogLoaded();
  }

  async function openEdit(item: ClientService) {
    setEditingId(item.id);
    setValues({
      service_id: item.service_id,
      status: item.status,
      monthly_value: item.monthly_value !== null ? String(item.monthly_value) : '',
      start_date: item.start_date ?? '',
      end_date: item.end_date ?? '',
      notes: item.notes ?? '',
    });
    setFormError(null);
    setFormOpen(true);
    await ensureCatalogLoaded();
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setFormError(null);
  }

  async function handleSubmit() {
    const validationError = validateClientServiceForm(values, items, editingId);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSaving(true);
      setFormError(null);
      if (editingId) {
        await updateClientService(editingId, values);
      } else {
        await createClientService(clientId, values);
      }
      await loadItems();
      closeForm();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar servico contratado.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {canManage && !formOpen && (
        <div className="flex justify-end">
          <Button type="button" variant="primary" onClick={() => void openCreate()}>
            Adicionar servico
          </Button>
        </div>
      )}

      {formOpen && canManage && (
        <ClientServiceForm
          values={values}
          catalog={catalog}
          editing={Boolean(editingId)}
          loading={saving || catalogLoading}
          onChange={setValues}
          onSubmit={() => void handleSubmit()}
          onCancel={closeForm}
        />
      )}

      {formError && <ErrorState description={formError} />}

      {loading && <LoadingState title="Carregando servicos contratados" />}
      {error && <ErrorState description={error} />}

      {!loading && !error && (
        items.length === 0 ? (
          <EmptyState
            title="Nenhum servico contratado"
            description="Os servicos vinculados a este cliente aparecerao aqui assim que forem adicionados."
          />
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{serviceName(item)}</p>
                      <ClientServiceStatusBadge status={item.status} />
                    </div>
                    {serviceCategory(item) && (
                      <p className="mt-1 text-xs text-muted-foreground">{serviceCategory(item)}</p>
                    )}
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Valor mensal</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">{formatCurrency(item.monthly_value)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Inicio</p>
                        <p className="mt-1 text-sm text-foreground">{formatDate(item.start_date)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fim</p>
                        <p className="mt-1 text-sm text-foreground">{formatDate(item.end_date)}</p>
                      </div>
                    </div>
                    {item.notes && (
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.notes}</p>
                    )}
                  </div>
                  {canManage && (
                    <Button type="button" variant="secondary" onClick={() => void openEdit(item)}>
                      Editar
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}
