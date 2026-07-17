-- HubLevel migration 020: client logo upload (column + storage bucket/policies).

alter table public.clients add column logo_url text;

-- Bucket publico para leitura (a logo e um asset de marca, sem dado sensivel), mas escrita
-- (upload/troca/remocao) restrita por policy: admin gerencia qualquer logo, gestor apenas dos
-- proprios clientes. Convencao de path: client-logos/{client_id}/{arquivo}, entao
-- storage.foldername(name) tem o client_id como primeiro segmento.
insert into storage.buckets (id, name, public)
values ('client-logos', 'client-logos', true)
on conflict (id) do nothing;

create policy "admin can manage client logo objects"
on storage.objects for all
to authenticated
using (bucket_id = 'client-logos' and public.is_admin())
with check (bucket_id = 'client-logos' and public.is_admin());

create policy "gestor can manage own client logo objects"
on storage.objects for all
to authenticated
using (
  bucket_id = 'client-logos'
  and public.is_gestor()
  and public.user_can_access_client((storage.foldername(name))[1]::uuid)
)
with check (
  bucket_id = 'client-logos'
  and public.is_gestor()
  and public.user_can_access_client((storage.foldername(name))[1]::uuid)
);
