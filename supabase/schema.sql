begin;

create schema if not exists private;
revoke all on schema private from public;

create table if not exists public.holdings_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'viewer')),
  created_at timestamptz not null default now()
);

create table if not exists public.site_content (
  content_key text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now(),
  published_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.site_content_drafts (
  content_key text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  legal_name text,
  entity_type text not null check (entity_type in ('holding', 'operating', 'investment', 'research', 'other')),
  jurisdiction text,
  base_currency text not null default 'EUR' check (base_currency ~ '^[A-Z]{3}$'),
  status text not null default 'draft' check (status in ('draft', 'active', 'development', 'pilot', 'inactive')),
  description text,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_relationships (
  id uuid primary key default gen_random_uuid(),
  parent_organization_id uuid not null references public.organizations(id) on delete restrict,
  child_organization_id uuid not null references public.organizations(id) on delete restrict,
  relationship_type text not null check (relationship_type in ('ownership', 'management', 'funding', 'strategic')),
  ownership_percent numeric(5,2) check (ownership_percent between 0 and 100),
  status text not null default 'draft' check (status in ('draft', 'confirmed', 'historic')),
  effective_from date,
  effective_to date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (parent_organization_id <> child_organization_id),
  check (effective_to is null or effective_from is null or effective_to >= effective_from),
  unique (parent_organization_id, child_organization_id, relationship_type, effective_from)
);

create table if not exists public.initiatives (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  owner_organization_id uuid references public.organizations(id) on delete set null,
  category text not null,
  stage text not null default 'idea' check (stage in ('idea', 'pilot', 'active', 'paused', 'completed')),
  summary text,
  started_on date,
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (target_date is null or started_on is null or target_date >= started_on)
);

create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  initiative_id uuid references public.initiatives(id) on delete set null,
  title text not null,
  summary text,
  scope text,
  status text not null default 'open' check (status in ('open', 'draft', 'approved', 'rejected', 'superseded')),
  decided_on date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.capital_allocations (
  id uuid primary key default gen_random_uuid(),
  source_organization_id uuid references public.organizations(id) on delete restrict,
  destination_organization_id uuid references public.organizations(id) on delete restrict,
  initiative_id uuid references public.initiatives(id) on delete set null,
  decision_id uuid references public.decisions(id) on delete set null,
  purpose text not null,
  amount numeric(20,2) not null check (amount > 0),
  currency text not null default 'EUR' check (currency ~ '^[A-Z]{3}$'),
  status text not null default 'planned' check (status in ('planned', 'approved', 'committed', 'completed', 'cancelled')),
  effective_on date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (source_organization_id is distinct from destination_organization_id),
  check (destination_organization_id is not null or initiative_id is not null)
);

create table if not exists public.audit_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  entity_table text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists organization_relationships_parent_idx
  on public.organization_relationships (parent_organization_id);
create index if not exists organization_relationships_child_idx
  on public.organization_relationships (child_organization_id);
create index if not exists initiatives_owner_idx
  on public.initiatives (owner_organization_id);
create index if not exists initiatives_stage_idx
  on public.initiatives (stage);
create index if not exists decisions_initiative_idx
  on public.decisions (initiative_id);
create index if not exists decisions_status_idx
  on public.decisions (status);
create index if not exists decisions_created_by_idx
  on public.decisions (created_by);
create index if not exists capital_allocations_source_idx
  on public.capital_allocations (source_organization_id);
create index if not exists capital_allocations_destination_idx
  on public.capital_allocations (destination_organization_id);
create index if not exists capital_allocations_initiative_idx
  on public.capital_allocations (initiative_id);
create index if not exists capital_allocations_decision_idx
  on public.capital_allocations (decision_id);
create index if not exists capital_allocations_status_date_idx
  on public.capital_allocations (status, effective_on desc);
create index if not exists capital_allocations_created_by_idx
  on public.capital_allocations (created_by);
create index if not exists audit_events_entity_idx
  on public.audit_events (entity_table, entity_id, created_at desc);
create index if not exists audit_events_actor_idx
  on public.audit_events (actor_user_id, created_at desc);
create index if not exists site_content_updated_by_idx
  on public.site_content (updated_by);
create index if not exists site_content_drafts_updated_by_idx
  on public.site_content_drafts (updated_by);

create or replace function private.is_holdings_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.holdings_memberships
      where user_id = (select auth.uid())
    );
$$;

create or replace function private.can_manage_holdings()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.holdings_memberships
      where user_id = (select auth.uid())
        and role in ('owner', 'admin')
    );
$$;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.capture_audit_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  record_id uuid;
begin
  record_id := case when tg_op = 'DELETE' then old.id else new.id end;

  insert into public.audit_events (
    actor_user_id,
    action,
    entity_table,
    entity_id,
    before_data,
    after_data
  )
  values (
    (select auth.uid()),
    tg_op,
    tg_table_name,
    record_id,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

revoke all on function private.is_holdings_member() from public;
revoke all on function private.can_manage_holdings() from public;
revoke all on function private.set_updated_at() from public;
revoke all on function private.capture_audit_event() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_holdings_member() to authenticated;
grant execute on function private.can_manage_holdings() to authenticated;

drop trigger if exists organizations_set_updated_at on public.organizations;
create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function private.set_updated_at();

drop trigger if exists relationships_set_updated_at on public.organization_relationships;
create trigger relationships_set_updated_at
before update on public.organization_relationships
for each row execute function private.set_updated_at();

drop trigger if exists initiatives_set_updated_at on public.initiatives;
create trigger initiatives_set_updated_at
before update on public.initiatives
for each row execute function private.set_updated_at();

drop trigger if exists decisions_set_updated_at on public.decisions;
create trigger decisions_set_updated_at
before update on public.decisions
for each row execute function private.set_updated_at();

drop trigger if exists capital_allocations_set_updated_at on public.capital_allocations;
create trigger capital_allocations_set_updated_at
before update on public.capital_allocations
for each row execute function private.set_updated_at();

drop trigger if exists site_content_set_updated_at on public.site_content;
create trigger site_content_set_updated_at
before update on public.site_content
for each row execute function private.set_updated_at();

drop trigger if exists site_content_drafts_set_updated_at on public.site_content_drafts;
create trigger site_content_drafts_set_updated_at
before update on public.site_content_drafts
for each row execute function private.set_updated_at();

drop trigger if exists organizations_audit on public.organizations;
create trigger organizations_audit
after insert or update or delete on public.organizations
for each row execute function private.capture_audit_event();

drop trigger if exists relationships_audit on public.organization_relationships;
create trigger relationships_audit
after insert or update or delete on public.organization_relationships
for each row execute function private.capture_audit_event();

drop trigger if exists initiatives_audit on public.initiatives;
create trigger initiatives_audit
after insert or update or delete on public.initiatives
for each row execute function private.capture_audit_event();

drop trigger if exists decisions_audit on public.decisions;
create trigger decisions_audit
after insert or update or delete on public.decisions
for each row execute function private.capture_audit_event();

drop trigger if exists capital_allocations_audit on public.capital_allocations;
create trigger capital_allocations_audit
after insert or update or delete on public.capital_allocations
for each row execute function private.capture_audit_event();

alter table public.holdings_memberships enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_relationships enable row level security;
alter table public.initiatives enable row level security;
alter table public.decisions enable row level security;
alter table public.capital_allocations enable row level security;
alter table public.audit_events enable row level security;
alter table public.site_content enable row level security;
alter table public.site_content_drafts enable row level security;

create policy "members can read own membership"
on public.holdings_memberships for select
to authenticated
using (user_id = (select auth.uid()) or (select private.can_manage_holdings()));

create policy "members can read organizations"
on public.organizations for select
to authenticated
using ((select private.is_holdings_member()));
create policy "managers can insert organizations"
on public.organizations for insert
to authenticated
with check ((select private.can_manage_holdings()));
create policy "managers can update organizations"
on public.organizations for update
to authenticated
using ((select private.can_manage_holdings()))
with check ((select private.can_manage_holdings()));
create policy "managers can delete organizations"
on public.organizations for delete
to authenticated
using ((select private.can_manage_holdings()));

create policy "members can read relationships"
on public.organization_relationships for select
to authenticated
using ((select private.is_holdings_member()));
create policy "managers can insert relationships"
on public.organization_relationships for insert
to authenticated
with check ((select private.can_manage_holdings()));
create policy "managers can update relationships"
on public.organization_relationships for update
to authenticated
using ((select private.can_manage_holdings()))
with check ((select private.can_manage_holdings()));
create policy "managers can delete relationships"
on public.organization_relationships for delete
to authenticated
using ((select private.can_manage_holdings()));

create policy "members can read initiatives"
on public.initiatives for select
to authenticated
using ((select private.is_holdings_member()));
create policy "managers can insert initiatives"
on public.initiatives for insert
to authenticated
with check ((select private.can_manage_holdings()));
create policy "managers can update initiatives"
on public.initiatives for update
to authenticated
using ((select private.can_manage_holdings()))
with check ((select private.can_manage_holdings()));
create policy "managers can delete initiatives"
on public.initiatives for delete
to authenticated
using ((select private.can_manage_holdings()));

create policy "members can read decisions"
on public.decisions for select
to authenticated
using ((select private.is_holdings_member()));
create policy "managers can insert decisions"
on public.decisions for insert
to authenticated
with check ((select private.can_manage_holdings()));
create policy "managers can update decisions"
on public.decisions for update
to authenticated
using ((select private.can_manage_holdings()))
with check ((select private.can_manage_holdings()));
create policy "managers can delete decisions"
on public.decisions for delete
to authenticated
using ((select private.can_manage_holdings()));

create policy "members can read capital allocations"
on public.capital_allocations for select
to authenticated
using ((select private.is_holdings_member()));
create policy "managers can insert capital allocations"
on public.capital_allocations for insert
to authenticated
with check ((select private.can_manage_holdings()));
create policy "managers can update capital allocations"
on public.capital_allocations for update
to authenticated
using ((select private.can_manage_holdings()))
with check ((select private.can_manage_holdings()));
create policy "managers can delete capital allocations"
on public.capital_allocations for delete
to authenticated
using ((select private.can_manage_holdings()));

create policy "managers can read audit events"
on public.audit_events for select
to authenticated
using ((select private.can_manage_holdings()));

create policy "published site content is publicly readable"
on public.site_content for select
to anon, authenticated
using (true);
create policy "managers can insert published site content"
on public.site_content for insert
to authenticated
with check ((select private.can_manage_holdings()));
create policy "managers can update published site content"
on public.site_content for update
to authenticated
using ((select private.can_manage_holdings()))
with check ((select private.can_manage_holdings()));

create policy "members can read site content drafts"
on public.site_content_drafts for select
to authenticated
using ((select private.is_holdings_member()));
create policy "managers can insert site content drafts"
on public.site_content_drafts for insert
to authenticated
with check ((select private.can_manage_holdings()));
create policy "managers can update site content drafts"
on public.site_content_drafts for update
to authenticated
using ((select private.can_manage_holdings()))
with check ((select private.can_manage_holdings()));

revoke all on public.holdings_memberships from anon, authenticated;
revoke all on public.organizations from anon, authenticated;
revoke all on public.organization_relationships from anon, authenticated;
revoke all on public.initiatives from anon, authenticated;
revoke all on public.decisions from anon, authenticated;
revoke all on public.capital_allocations from anon, authenticated;
revoke all on public.audit_events from anon, authenticated;
revoke all on public.site_content from anon, authenticated;
revoke all on public.site_content_drafts from anon, authenticated;

grant select on public.holdings_memberships to authenticated;
grant select, insert, update, delete on public.organizations to authenticated;
grant select, insert, update, delete on public.organization_relationships to authenticated;
grant select, insert, update, delete on public.initiatives to authenticated;
grant select, insert, update, delete on public.decisions to authenticated;
grant select, insert, update, delete on public.capital_allocations to authenticated;
grant select on public.audit_events to authenticated;
grant select on public.site_content to anon, authenticated;
grant insert, update on public.site_content to authenticated;
grant select, insert, update on public.site_content_drafts to authenticated;

insert into public.organizations
  (name, slug, entity_type, jurisdiction, status, description, sort_order)
values
  ('Holding', 'holding', 'holding', 'Greece', 'draft', 'Ιδιοκτησία, έλεγχος και κατανομή κεφαλαίου.', 10),
  ('Network Allcom', 'network-allcom', 'operating', 'Greece', 'active', 'Λειτουργικός και τεχνολογικός βραχίονας.', 20),
  ('Investments', 'investments', 'investment', 'Greece', 'development', 'Ακίνητα και επενδυτικά χαρτοφυλάκια.', 30),
  ('Research & Strategic Initiatives', 'research-strategic-initiatives', 'research', 'Greece', 'pilot', 'Μακροχρόνια έρευνα και νέα εγχειρήματα.', 40)
on conflict (slug) do update set
  name = excluded.name,
  entity_type = excluded.entity_type,
  jurisdiction = excluded.jurisdiction,
  status = excluded.status,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into public.initiatives
  (name, slug, owner_organization_id, category, stage, summary, started_on)
select
  'Το Μέλλον Ενός Παιδιού',
  'to-mellon-enos-paidiou',
  id,
  'research-and-development',
  'pilot',
  'Μακροχρόνιο πρόγραμμα έρευνας και ανάπτυξης με αφετηρία την εκπαίδευση και τη συστηματική τεκμηρίωση.',
  date '2026-01-01'
from public.organizations
where slug = 'network-allcom'
on conflict (slug) do update set
  owner_organization_id = excluded.owner_organization_id,
  category = excluded.category,
  stage = excluded.stage,
  summary = excluded.summary;

insert into public.decisions (title, summary, scope, status)
select seed.title, seed.summary, seed.scope, 'open'
from (
  values
    ('Οριστικοποίηση μετοχικού χάρτη', 'Καθορισμός της τελικής ιδιοκτησιακής αλυσίδας.', 'Holding · Investments · Network Allcom'),
    ('Κανόνες εταιρικής διακυβέρνησης', 'Ρόλοι, εγκρίσεις και όρια αποφάσεων.', 'Governance'),
    ('Δημόσια και ιδιωτική πληροφορία', 'Διαχωρισμός εταιρικής παρουσίας και εσωτερικού control room.', 'Website')
) as seed(title, summary, scope)
where not exists (
  select 1 from public.decisions existing where existing.title = seed.title
);

commit;
