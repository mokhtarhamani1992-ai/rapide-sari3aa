-- RAPIDE security upgrade: run the WHOLE file once in Supabase > SQL Editor.
-- If the editor adds an extra ")" at the very end after pasting, delete it before Run.

-- 1) wipe test rows (they have no owner)
delete from rapide_docs;

-- 2) owner column + admins table
alter table rapide_docs add column if not exists owner uuid default auth.uid();

create table if not exists rapide_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table rapide_admins enable row level security;
drop policy if exists "admin self" on rapide_admins;
create policy "admin self" on rapide_admins for select to authenticated using (user_id = auth.uid());

create or replace function is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from rapide_admins where user_id = auth.uid())
$$;

-- 3) remove the old open policies
drop policy if exists "proto read" on rapide_docs;
drop policy if exists "proto insert" on rapide_docs;
drop policy if exists "proto update" on rapide_docs;
drop policy if exists "rapide read" on rapide_docs;
drop policy if exists "rapide insert" on rapide_docs;
drop policy if exists "rapide update" on rapide_docs;

-- 4) new policies: logged-in users only
create policy "rapide read" on rapide_docs for select to authenticated
  using (kind <> 'drivers' or owner = auth.uid() or is_admin() or (data->>'ok') = 'true');

create policy "rapide insert" on rapide_docs for insert to authenticated
  with check (is_admin() or (owner = auth.uid() and kind <> 'cfg' and (kind <> 'drivers' or (data->>'ok') = 'false')));

create policy "rapide update" on rapide_docs for update to authenticated
  using (owner = auth.uid() or is_admin())
  with check (is_admin() or (owner = auth.uid() and kind <> 'cfg' and (kind <> 'drivers' or (data->>'ok') = 'false')));

-- 5) make yourself admin AFTER you created your account in the app
-- insert into rapide_admins (user_id) select id from auth.users where email = 'YOUR_EMAIL_HERE';
