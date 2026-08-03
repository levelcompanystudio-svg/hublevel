import { EmptyState } from '../../../components/feedback/EmptyState';
import { Card, SectionHeader } from '../../../components/ui';
import type { CrmContact } from '../crm.types';

interface CrmContactsSummaryProps {
  contacts: CrmContact[];
}

// Bloco de leitura. Criacao/edicao de contatos fica para uma etapa futura do CRM.
export function CrmContactsSummary({ contacts }: CrmContactsSummaryProps) {
  return (
    <div className="space-y-3">
      <SectionHeader title="Contatos" caption={`${contacts.length} ${contacts.length === 1 ? 'contato' : 'contatos'} registrados`} />

      {contacts.length === 0 ? (
        <EmptyState title="Nenhum contato registrado" description="Os contatos deste cliente aparecerao aqui assim que forem cadastrados no CRM." />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="divide-y divide-border">
            {contacts.map((contact) => (
              <div key={contact.id} className="p-3">
                <p className="truncate text-sm font-medium text-foreground">{contact.name}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {[contact.position, contact.company_name].filter(Boolean).join(' - ') || 'Sem cargo/empresa'}
                </p>
                {(contact.email || contact.phone) && (
                  <p className="mt-1 truncate text-xs text-muted-foreground">{[contact.email, contact.phone].filter(Boolean).join(' - ')}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
