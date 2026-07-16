-- HubLevel migration 018: harden collaborator updates for deliverables.

create or replace function public.guard_colaborador_deliverable_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_colaborador() and not public.is_admin() and not public.is_gestor() then
    if new.status not in ('in_progress', 'delivered') then
      raise exception 'Colaborador can only mark deliverables as in_progress or delivered.'
        using errcode = '42501';
    end if;

    if new.updated_by is distinct from auth.uid() then
      raise exception 'Colaborador must update deliverables as the authenticated user.'
        using errcode = '42501';
    end if;

    if new.id is distinct from old.id
      or new.client_id is distinct from old.client_id
      or new.title is distinct from old.title
      or new.description is distinct from old.description
      or new.priority is distinct from old.priority
      or new.reference_month is distinct from old.reference_month
      or new.due_date is distinct from old.due_date
      or new.assigned_to is distinct from old.assigned_to
      or new.document_id is distinct from old.document_id
      or new.task_id is distinct from old.task_id
      or new.notes is distinct from old.notes
      or new.created_by is distinct from old.created_by
      or new.created_at is distinct from old.created_at
      or new.deleted_at is distinct from old.deleted_at
      or new.deleted_by is distinct from old.deleted_by
    then
      raise exception 'Colaborador can only update deliverable status fields.'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

create trigger guard_colaborador_deliverable_update
before update on public.deliverables
for each row execute function public.guard_colaborador_deliverable_update();
