-- HubLevel migration 015: extend services catalog fields.

alter table public.services
  add column category text,
  add column default_price numeric(12,2),
  add column billing_cycle text,
  add column notes text,
  add constraint services_default_price_non_negative
    check (default_price is null or default_price >= 0);
