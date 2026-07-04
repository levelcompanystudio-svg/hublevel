-- HubLevel migration 013: RLS policies.

-- Roles and permissions
create policy "authenticated can read roles"
on public.roles for select
to authenticated
using (true);

create policy "admin can manage roles"
on public.roles for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admin can read permissions"
on public.permissions for select
to authenticated
using (public.is_admin());

create policy "admin can manage permissions"
on public.permissions for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Profiles
create policy "users can read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid() and deleted_at is null);

create policy "admin can read all profiles"
on public.profiles for select
to authenticated
using (public.is_admin());

create policy "gestor can read minimal active profiles"
on public.profiles for select
to authenticated
using (public.is_gestor() and status = 'active' and deleted_at is null);

create policy "users can update own name"
on public.profiles for update
to authenticated
using (id = auth.uid() and deleted_at is null)
with check (id = auth.uid());

create policy "admin can manage profiles"
on public.profiles for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Controlled catalogs
create policy "authenticated can read active acquisition sources"
on public.acquisition_sources for select
to authenticated
using (status = 'ativo' and deleted_at is null);

create policy "admin can manage acquisition sources"
on public.acquisition_sources for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "authenticated can read active services"
on public.services for select
to authenticated
using (status = 'ativo' and deleted_at is null);

create policy "admin can manage services"
on public.services for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admin can manage settings"
on public.settings for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Clients
create policy "admin can manage clients"
on public.clients for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "gestor can read own clients"
on public.clients for select
to authenticated
using (public.is_gestor() and responsible_user_id = auth.uid() and deleted_at is null);

create policy "gestor can create clients as responsible"
on public.clients for insert
to authenticated
with check (public.is_gestor() and responsible_user_id = auth.uid());

create policy "gestor can update own clients"
on public.clients for update
to authenticated
using (public.is_gestor() and responsible_user_id = auth.uid() and deleted_at is null)
with check (public.is_gestor() and responsible_user_id = auth.uid());

create policy "colaborador can read task clients"
on public.clients for select
to authenticated
using (
  public.is_colaborador()
  and deleted_at is null
  and exists (
    select 1 from public.tasks t
    where t.client_id = clients.id
      and t.assigned_to_user_id = auth.uid()
      and t.deleted_at is null
  )
);

-- Client children
create policy "admin can manage client contacts"
on public.client_contacts for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "gestor can manage contacts for own clients"
on public.client_contacts for all
to authenticated
using (public.is_gestor() and public.user_can_access_client(client_id) and deleted_at is null)
with check (public.is_gestor() and public.user_can_access_client(client_id));

create policy "admin can manage client health"
on public.client_health_history for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "gestor can manage health for own clients"
on public.client_health_history for all
to authenticated
using (public.is_gestor() and public.user_can_access_client(client_id))
with check (public.is_gestor() and public.user_can_access_client(client_id));

create policy "admin can manage client services"
on public.client_services for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "gestor can read client services for own clients"
on public.client_services for select
to authenticated
using (public.is_gestor() and public.user_can_access_client(client_id) and deleted_at is null);

-- Documents, contracts, attachments
create policy "admin can manage documents"
on public.documents for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "gestor can read operational documents"
on public.documents for select
to authenticated
using (
  public.is_gestor()
  and public.user_can_access_client(client_id)
  and deleted_at is null
  and type not in ('contrato', 'comprovante')
);

create policy "gestor can create operational documents"
on public.documents for insert
to authenticated
with check (
  public.is_gestor()
  and public.user_can_access_client(client_id)
  and type not in ('contrato', 'comprovante')
  and created_by_user_id = auth.uid()
);

create policy "admin only contracts"
on public.contracts for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admin can manage attachments"
on public.attachments for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "gestor can read own operational attachments"
on public.attachments for select
to authenticated
using (
  public.is_gestor()
  and deleted_at is null
  and (
    (entity_type = 'documents' and exists (
      select 1 from public.documents d
      where d.id = attachments.entity_id
        and d.deleted_at is null
        and d.type not in ('contrato', 'comprovante')
        and public.user_can_access_client(d.client_id)
    ))
    or (entity_type = 'tasks' and exists (
      select 1 from public.tasks t
      where t.id = attachments.entity_id
        and t.deleted_at is null
        and public.user_can_access_task(t.id)
    ))
    or (entity_type = 'updates' and exists (
      select 1 from public.updates u
      where u.id = attachments.entity_id
        and u.deleted_at is null
        and public.user_can_access_client(u.client_id)
    ))
    or (entity_type = 'meetings' and exists (
      select 1 from public.meetings m
      where m.id = attachments.entity_id
        and m.deleted_at is null
        and public.user_can_access_client(m.client_id)
    ))
  )
);

create policy "gestor can create own operational attachments"
on public.attachments for insert
to authenticated
with check (
  public.is_gestor()
  and uploaded_by_user_id = auth.uid()
  and (
    (entity_type = 'documents' and exists (
      select 1 from public.documents d
      where d.id = attachments.entity_id
        and d.deleted_at is null
        and d.type not in ('contrato', 'comprovante')
        and public.user_can_access_client(d.client_id)
    ))
    or (entity_type = 'tasks' and exists (
      select 1 from public.tasks t
      where t.id = attachments.entity_id
        and t.deleted_at is null
        and public.user_can_access_task(t.id)
    ))
    or (entity_type = 'updates' and exists (
      select 1 from public.updates u
      where u.id = attachments.entity_id
        and u.deleted_at is null
        and public.user_can_access_client(u.client_id)
    ))
    or (entity_type = 'meetings' and exists (
      select 1 from public.meetings m
      where m.id = attachments.entity_id
        and m.deleted_at is null
        and public.user_can_access_client(m.client_id)
    ))
  )
);

-- Financial: Admin only
create policy "admin only financial records"
on public.financial_records for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admin only payments"
on public.payments for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Operations
create policy "admin can manage tasks"
on public.tasks for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "gestor can manage own client tasks"
on public.tasks for all
to authenticated
using (
  public.is_gestor()
  and deleted_at is null
  and (client_id is null or public.user_can_access_client(client_id))
)
with check (
  public.is_gestor()
  and (client_id is null or public.user_can_access_client(client_id))
);

create policy "colaborador can read assigned tasks"
on public.tasks for select
to authenticated
using (public.is_colaborador() and assigned_to_user_id = auth.uid() and deleted_at is null);

create policy "colaborador can update assigned task status"
on public.tasks for update
to authenticated
using (public.is_colaborador() and assigned_to_user_id = auth.uid() and deleted_at is null)
with check (public.is_colaborador() and assigned_to_user_id = auth.uid());

create policy "admin can manage updates"
on public.updates for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "gestor can manage updates for own clients"
on public.updates for all
to authenticated
using (public.is_gestor() and public.user_can_access_client(client_id) and deleted_at is null)
with check (public.is_gestor() and public.user_can_access_client(client_id));

create policy "admin can manage meetings"
on public.meetings for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "gestor can manage meetings for own clients"
on public.meetings for all
to authenticated
using (public.is_gestor() and (client_id is null or public.user_can_access_client(client_id)) and deleted_at is null)
with check (public.is_gestor() and (client_id is null or public.user_can_access_client(client_id)));

create policy "colaborador can read participant meetings"
on public.meetings for select
to authenticated
using (
  public.is_colaborador()
  and deleted_at is null
  and participants @> jsonb_build_array(jsonb_build_object('user_id', auth.uid()::text))
);

create policy "admin can manage agenda events"
on public.agenda_events for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "gestor can manage own agenda events"
on public.agenda_events for all
to authenticated
using (
  public.is_gestor()
  and deleted_at is null
  and (
    responsible_user_id = auth.uid()
    or (client_id is not null and public.user_can_access_client(client_id))
  )
)
with check (
  public.is_gestor()
  and (
    responsible_user_id = auth.uid()
    or (client_id is not null and public.user_can_access_client(client_id))
  )
);

create policy "colaborador can read own agenda events"
on public.agenda_events for select
to authenticated
using (public.is_colaborador() and responsible_user_id = auth.uid() and deleted_at is null);

create policy "admin can manage comments"
on public.comments for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "gestor can manage own client comments"
on public.comments for all
to authenticated
using (
  public.is_gestor()
  and deleted_at is null
  and (
    (entity_type = 'tasks' and exists (select 1 from public.tasks t where t.id = comments.entity_id and public.user_can_access_task(t.id)))
    or (entity_type = 'updates' and exists (select 1 from public.updates u where u.id = comments.entity_id and public.user_can_access_client(u.client_id)))
    or (entity_type = 'meetings' and exists (select 1 from public.meetings m where m.id = comments.entity_id and (m.client_id is null or public.user_can_access_client(m.client_id))))
    or (entity_type = 'clients' and public.user_can_access_client(comments.entity_id))
  )
)
with check (
  public.is_gestor()
  and user_id = auth.uid()
  and (
    (entity_type = 'tasks' and exists (select 1 from public.tasks t where t.id = comments.entity_id and public.user_can_access_task(t.id)))
    or (entity_type = 'updates' and exists (select 1 from public.updates u where u.id = comments.entity_id and public.user_can_access_client(u.client_id)))
    or (entity_type = 'meetings' and exists (select 1 from public.meetings m where m.id = comments.entity_id and (m.client_id is null or public.user_can_access_client(m.client_id))))
    or (entity_type = 'clients' and public.user_can_access_client(comments.entity_id))
  )
);

create policy "colaborador can comment assigned tasks"
on public.comments for all
to authenticated
using (
  public.is_colaborador()
  and deleted_at is null
  and entity_type = 'tasks'
  and exists (
    select 1 from public.tasks t
    where t.id = comments.entity_id
      and t.assigned_to_user_id = auth.uid()
      and t.deleted_at is null
  )
)
with check (
  public.is_colaborador()
  and user_id = auth.uid()
  and entity_type = 'tasks'
  and exists (
    select 1 from public.tasks t
    where t.id = comments.entity_id
      and t.assigned_to_user_id = auth.uid()
      and t.deleted_at is null
  )
);

-- Activity logs
create policy "admin can read activity logs"
on public.activity_logs for select
to authenticated
using (public.is_admin());
