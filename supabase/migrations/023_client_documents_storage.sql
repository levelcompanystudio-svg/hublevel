-- HubLevel migration 023: client document file storage.
--
-- Stores real files attached to client documents. The object path starts with
-- the client_id so Storage policies can reuse the same client access rules used
-- by the application tables.

insert into storage.buckets (id, name, public)
values ('client-documents', 'client-documents', false)
on conflict (id) do nothing;

create policy "admin can manage client document files"
on storage.objects for all
to authenticated
using (bucket_id = 'client-documents' and public.is_admin())
with check (bucket_id = 'client-documents' and public.is_admin());

create policy "gestor can manage own client document files"
on storage.objects for all
to authenticated
using (
  bucket_id = 'client-documents'
  and (storage.foldername(name))[1] is not null
  and public.user_can_access_client((storage.foldername(name))[1]::uuid)
)
with check (
  bucket_id = 'client-documents'
  and (storage.foldername(name))[1] is not null
  and public.user_can_access_client((storage.foldername(name))[1]::uuid)
);
