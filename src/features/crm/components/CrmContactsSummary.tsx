import { EmptyState } from '../../../components/feedback/EmptyState';
import { Button, Card, SectionHeader } from '../../../components/ui';
import type { CrmContact } from '../crm.types';

interface CrmContactsSummaryProps {
  contacts: CrmContact[];
  canManage: boolean;
  onCreateContact: () => void;
  onEditContact: (contact: CrmContact) => void;
}

// Bloco de contatos - leitura + criacao/edicao basica. Sem delete nesta etapa.
export function CrmContactsSummary({ contacts, canManage, onCreateContact, onEditContact }: CrmContactsSummaryProps) {
  return (
    <div className="space-y-3">
      <SectionHeader
        title="Contatos"
        caption={`${contacts.length} ${contacts.length === 1 ? 'contato' : 'contatos'} registrados`}
        action={
          canManage && (
            <Button type="button" variant="secondary" size="sm" onClick={onCreateContact}>
              Novo contato
            </Button>
          )
        }
      />

      {contacts.length === 0 ? (
        <EmptyState title="Nenhum contato registrado" description="Os contatos deste cliente aparecerao aqui assim que forem cadastrados no CRM." />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="divide-y divide-border">
            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-start justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{contact.name}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {[contact.position, contact.company_name].filter(Boolean).join(' - ') || 'Sem cargo/empresa'}
                  </p>
                  {(contact.email || contact.phone) && (
                    <p className="mt-1 truncate text-xs text-muted-foreground">{[contact.email, contact.phone].filter(Boolean).join(' - ')}</p>
                  )}
                </div>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => onEditContact(contact)}
                    className="shrink-0 text-xs font-semibold text-primary hover:underline"
                  >
                    Editar
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
