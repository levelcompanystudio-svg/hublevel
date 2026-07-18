-- HubLevel migration 025: landing page publication slug.
--
-- Adds a friendly public identifier for published landing pages. Public access still goes
-- through the get-public-landing-page Edge Function; no public RLS policy is added here.

alter table public.client_landing_pages
add column slug text;

create unique index idx_client_landing_pages_slug_active_unique
on public.client_landing_pages(slug)
where deleted_at is null and slug is not null;

create index idx_client_landing_pages_slug
on public.client_landing_pages(slug);
