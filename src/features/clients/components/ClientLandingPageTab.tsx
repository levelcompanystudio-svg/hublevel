import { useState } from 'react';
import { LandingPageBriefingForm } from '../../landing-pages/components/LandingPageBriefingForm';
import { LandingPageFutureActions } from '../../landing-pages/components/LandingPageFutureActions';
import { LandingPageLeadsInfo } from '../../landing-pages/components/LandingPageLeadsInfo';
import { emptyLandingPageBriefingValues } from '../../landing-pages/landing-page.types';
import type { LandingPageBriefingValues } from '../../landing-pages/landing-page.types';
import type { Client } from '../clients.types';

interface ClientLandingPageTabProps {
  client: Client;
}

function initialValuesFor(client: Client): LandingPageBriefingValues {
  return {
    ...emptyLandingPageBriefingValues,
    displayName: client.trade_name ?? client.company_name,
    legalName: client.company_name,
    segment: client.segment ?? '',
  };
}

export function ClientLandingPageTab({ client }: ClientLandingPageTabProps) {
  const [values, setValues] = useState<LandingPageBriefingValues>(() => initialValuesFor(client));

  return (
    <div className="space-y-4">
      <LandingPageBriefingForm values={values} onChange={setValues} />
      <div className="grid gap-4 lg:grid-cols-2">
        <LandingPageFutureActions />
        <LandingPageLeadsInfo />
      </div>
    </div>
  );
}
