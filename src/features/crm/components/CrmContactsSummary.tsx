import { Building2, Mail, Phone } from 'lucide-react';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Button, Card, SectionHeader } from '../../../components/ui';
import type { CrmContact } from '../crm.types';

interface CrmContactsSummaryProps {
  contacts: CrmContact[];
  canManage: boolean;
  onCreateContact: () => void;
  onEditContact: (contact: CrmContact) => void;
}

// Bloco de contatos - leitura + criacao/edicao basica. Sem delete nesta etapa. Hierarquia (Etapa
// 10): nome em destaque, cargo/empresa como linha secundaria, e-mail/telefone com icone como
// metadado terciario - mesmos dados de sempre, so reorganizados.
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
              <div key={contact.id} className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{contact.name}</p>
                  {(contact.position || contact.company_name) && (
                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">{[contact.position, contact.company_name].filter(Boolean).join(' - ')}</span>
                    </p>
                  )}
                  {(contact.email || contact.phone) && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {contact.email && (
                        <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3 shrink-0" aria-hidden="true" />
                          <span className="truncate">{contact.email}</span>
                        </span>
                      )}
                      {contact.phone && (
                        <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3 shrink-0" aria-hidden="true" />
                          {contact.phone}
                        </span>
                      )}
                    </div>
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
