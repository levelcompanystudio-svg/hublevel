import { LANDING_PAGE_LEAD_STATUSES, landingPageLeadStatusLabels } from '../landing-page-leads.types';
import type { LandingPageLeadStatus } from '../landing-page-leads.types';

interface LandingPageLeadStatusSelectProps {
  value: LandingPageLeadStatus;
  disabled?: boolean;
  onChange: (status: LandingPageLeadStatus) => void;
}

export function LandingPageLeadStatusSelect({ value, disabled, onChange }: LandingPageLeadStatusSelectProps) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as LandingPageLeadStatus)}
      className="rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
    >
      {LANDING_PAGE_LEAD_STATUSES.map((status) => (
        <option key={status} value={status}>
          {landingPageLeadStatusLabels[status]}
        </option>
      ))}
    </select>
  );
}
