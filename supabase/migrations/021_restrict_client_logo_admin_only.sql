-- HubLevel migration 021: restrict client logo management to admins only.

drop policy if exists "gestor can manage own client logo objects" on storage.objects;

create or replace function public.prevent_non_admin_client_logo_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.logo_url is distinct from new.logo_url and not public.is_admin() then
    raise exception 'Only admins can update client logos.' using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_non_admin_client_logo_update on public.clients;

create trigger prevent_non_admin_client_logo_update
before update of logo_url on public.clients
for each row
execute function public.prevent_non_admin_client_logo_update();
