import { Badge } from '../../../components/ui';
import { SENSITIVE_DOCUMENT_TYPES } from '../documents.types';
import type { DocumentType } from '../documents.types';

const labels: Record<DocumentType, string> = {
  contrato: 'Contrato',
  proposta: 'Proposta',
  briefing: 'Briefing',
  relatorio: 'Relatorio',
  planejamento: 'Planejamento',
  comprovante: 'Comprovante',
  outro: 'Outro',
};

export function DocumentTypeBadge({ type }: { type: DocumentType }) {
  const tone = SENSITIVE_DOCUMENT_TYPES.includes(type) ? 'warning' : 'brand';
  return <Badge tone={tone}>{labels[type]}</Badge>;
}
