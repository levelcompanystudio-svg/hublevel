import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { FilterBar } from '../../../components/layout/FilterBar';
import { PageHeader } from '../../../components/layout/PageHeader';
import { SummaryCard } from '../../../components/layout/SummaryCard';
import { Badge, Button } from '../../../components/ui';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { listMeetings } from '../meetings.api';
import type { Meeting } from '../meetings.types';
import { MeetingTable } from '../components/MeetingTable';

export function MeetingListPage() {
  const { profile } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const role = profile?.roles?.name;
  const canAccess = role === 'admin' || role === 'gestor';

  useEffect(() => {
    if (!canAccess) {
      setLoading(false);
      return;
    }
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const result = await listMeetings();
        if (active) setMeetings(result);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Erro ao carregar reunioes.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [canAccess]);

  if (!canAccess) return <AccessDeniedPlaceholder />;

  const scheduledMeetings = meetings.filter((meeting) => meeting.status === 'agendada').length;
  const completedMeetings = meetings.filter((meeting) => meeting.status === 'realizada').length;
  const canceledMeetings = meetings.filter((meeting) => meeting.status === 'cancelada' || meeting.status === 'remarcada').length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operacao"
        title="Reunioes"
        description="Agenda de reunioes, alinhamentos e consultorias com os clientes da carteira."
        action={(
          <Link to="/app/reunioes/novo">
            <Button type="button" variant="primary">Nova reuniao</Button>
          </Link>
        )}
      />

      {loading && <LoadingState title="Carregando reunioes" />}
      {error && <ErrorState description={error} />}
      {!loading && !error && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Total de reunioes" value={meetings.length} tone="brand" />
            <SummaryCard label="Agendadas" value={scheduledMeetings} />
            <SummaryCard label="Realizadas" value={completedMeetings} tone="success" />
            <SummaryCard label="Canceladas/remarcadas" value={canceledMeetings} tone="warning" />
          </div>
          <FilterBar label="Filtros visuais">
            <Badge tone="brand">{role === 'admin' ? 'Todos os clientes' : 'Minha carteira'}</Badge>
            <Badge>Agenda CS</Badge>
          </FilterBar>
          <MeetingTable meetings={meetings} />
        </>
      )}
    </div>
  );
}
