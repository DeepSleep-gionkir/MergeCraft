create table user_progress (
  user_id uuid not null,
  element_id bigint references elements(id),
  discovered_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, element_id)
);

-- Enable RLS
alter table user_progress enable row level security;

-- Allow anyone to insert/select their own progress (identified by user_id)
-- Note: Since we are using a client-side generated UUID for "guest" auth without actual Supabase Auth,
-- we might need to be careful. For a simple game, we can allow public access or just use the anon key.
-- A better approach for "guest" accounts without login is to just allow anon access to this table
-- but strictly filter by the user_id provided in the query.

create policy "Allow public access" on user_progress for all using (true) with check (true);
