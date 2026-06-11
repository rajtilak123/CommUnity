-- Phase 3: Complaints module

create type public.complaint_status as enum ('open', 'in_progress', 'resolved', 'closed');
create type public.complaint_priority as enum ('low', 'medium', 'high', 'urgent');
create type public.complaint_category as enum (
  'plumbing',
  'electrical',
  'security',
  'housekeeping',
  'parking',
  'maintenance',
  'noise',
  'amenities',
  'other'
);

create sequence public.complaint_reference_seq start 1000;

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references public.societies (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete cascade,
  assigned_to uuid references public.profiles (id) on delete set null,
  title text not null check (char_length(trim(title)) >= 3),
  description text not null check (char_length(trim(description)) >= 10),
  category public.complaint_category not null default 'other',
  priority public.complaint_priority not null default 'medium',
  status public.complaint_status not null default 'open',
  reference_code text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists complaints_society_id_idx on public.complaints (society_id);
create index if not exists complaints_created_by_idx on public.complaints (created_by);
create index if not exists complaints_status_idx on public.complaints (status);
create index if not exists complaints_priority_idx on public.complaints (priority);
create index if not exists complaints_created_at_idx on public.complaints (created_at desc);

create table if not exists public.complaint_attachments (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints (id) on delete cascade,
  file_url text not null,
  file_name text,
  created_at timestamptz not null default now()
);

create index if not exists complaint_attachments_complaint_id_idx
  on public.complaint_attachments (complaint_id);

create table if not exists public.complaint_comments (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(trim(content)) >= 1),
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists complaint_comments_complaint_id_idx
  on public.complaint_comments (complaint_id);

create table if not exists public.complaint_status_history (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints (id) on delete cascade,
  old_status public.complaint_status,
  new_status public.complaint_status not null,
  changed_by uuid not null references public.profiles (id) on delete cascade,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists complaint_status_history_complaint_id_idx
  on public.complaint_status_history (complaint_id);

-- Helpers
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.get_auth_society_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select society_id
  from public.profiles
  where id = auth.uid();
$$;

create or replace function public.generate_complaint_reference()
returns trigger
language plpgsql
as $$
begin
  if new.reference_code is null or new.reference_code = '' then
    new.reference_code := 'CMP-' || lpad(nextval('public.complaint_reference_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

create trigger complaints_generate_reference
  before insert on public.complaints
  for each row
  execute function public.generate_complaint_reference();

create trigger complaints_updated_at
  before update on public.complaints
  for each row
  execute function public.handle_updated_at();

create or replace function public.log_complaint_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.complaint_status_history (complaint_id, old_status, new_status, changed_by, note)
    values (new.id, null, new.status, new.created_by, 'Complaint created');
  elsif tg_op = 'UPDATE' and old.status is distinct from new.status then
    insert into public.complaint_status_history (complaint_id, old_status, new_status, changed_by, note)
    values (new.id, old.status, new.status, auth.uid(), null);
  end if;
  return new;
end;
$$;

create trigger complaints_status_history
  after insert or update of status on public.complaints
  for each row
  execute function public.log_complaint_status_change();

-- RLS
alter table public.complaints enable row level security;
alter table public.complaint_attachments enable row level security;
alter table public.complaint_comments enable row level security;
alter table public.complaint_status_history enable row level security;

-- complaints policies
create policy "Residents can view own complaints"
  on public.complaints
  for select
  to authenticated
  using (created_by = auth.uid());

create policy "Admins can view society complaints"
  on public.complaints
  for select
  to authenticated
  using (
    public.is_admin()
    and society_id = public.get_auth_society_id()
  );

create policy "Residents can create complaints"
  on public.complaints
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and society_id = public.get_auth_society_id()
  );

create policy "Admins can update society complaints"
  on public.complaints
  for update
  to authenticated
  using (
    public.is_admin()
    and society_id = public.get_auth_society_id()
  )
  with check (
    public.is_admin()
    and society_id = public.get_auth_society_id()
  );

-- complaint_attachments policies
create policy "Users can view attachments on accessible complaints"
  on public.complaint_attachments
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.complaints c
      where c.id = complaint_id
        and (
          c.created_by = auth.uid()
          or (
            public.is_admin()
            and c.society_id = public.get_auth_society_id()
          )
        )
    )
  );

create policy "Residents can add attachments to own complaints"
  on public.complaint_attachments
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.complaints c
      where c.id = complaint_id
        and c.created_by = auth.uid()
    )
  );

create policy "Admins can add attachments to society complaints"
  on public.complaint_attachments
  for insert
  to authenticated
  with check (
    public.is_admin()
    and exists (
      select 1
      from public.complaints c
      where c.id = complaint_id
        and c.society_id = public.get_auth_society_id()
    )
  );

-- complaint_comments policies
create policy "Residents can view non-internal comments on own complaints"
  on public.complaint_comments
  for select
  to authenticated
  using (
    is_internal = false
    and exists (
      select 1
      from public.complaints c
      where c.id = complaint_id
        and c.created_by = auth.uid()
    )
  );

create policy "Admins can view all comments on society complaints"
  on public.complaint_comments
  for select
  to authenticated
  using (
    public.is_admin()
    and exists (
      select 1
      from public.complaints c
      where c.id = complaint_id
        and c.society_id = public.get_auth_society_id()
    )
  );

create policy "Residents can comment on own complaints"
  on public.complaint_comments
  for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and is_internal = false
    and exists (
      select 1
      from public.complaints c
      where c.id = complaint_id
        and c.created_by = auth.uid()
    )
  );

create policy "Admins can comment on society complaints"
  on public.complaint_comments
  for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and public.is_admin()
    and exists (
      select 1
      from public.complaints c
      where c.id = complaint_id
        and c.society_id = public.get_auth_society_id()
    )
  );

-- complaint_status_history policies
create policy "Residents can view history on own complaints"
  on public.complaint_status_history
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.complaints c
      where c.id = complaint_id
        and c.created_by = auth.uid()
    )
  );

create policy "Admins can view history on society complaints"
  on public.complaint_status_history
  for select
  to authenticated
  using (
    public.is_admin()
    and exists (
      select 1
      from public.complaints c
      where c.id = complaint_id
        and c.society_id = public.get_auth_society_id()
    )
  );

-- Storage bucket for complaint images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'complaint-images',
  'complaint-images',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do nothing;

create policy "Authenticated users can upload complaint images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'complaint-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can read own complaint images"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'complaint-images'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

create policy "Users can delete own complaint images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'complaint-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
