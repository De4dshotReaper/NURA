create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now(),
  constraint feedback_message_trimmed_length
    check (char_length(btrim(message)) between 1 and 2000)
);

alter table public.feedback enable row level security;

create policy "Authenticated users can submit their own feedback"
on public.feedback for insert to authenticated
with check (auth.uid() = user_id);
