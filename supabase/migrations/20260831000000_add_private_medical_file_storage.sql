alter table public.prescriptions
  add column if not exists storage_path text;

alter table public.lab_reports
  add column if not exists storage_path text;

insert into storage.buckets (id, name, public)
values
  ('prescriptions', 'prescriptions', false),
  ('lab-reports', 'lab-reports', false)
on conflict (id) do update set public = false;

create policy "Users can upload their own prescription files"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'prescriptions'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can read their own prescription files"
on storage.objects for select to authenticated
using (
  bucket_id = 'prescriptions'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update their own prescription files"
on storage.objects for update to authenticated
using (
  bucket_id = 'prescriptions'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'prescriptions'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their own prescription files"
on storage.objects for delete to authenticated
using (
  bucket_id = 'prescriptions'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can upload their own lab report files"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'lab-reports'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can read their own lab report files"
on storage.objects for select to authenticated
using (
  bucket_id = 'lab-reports'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update their own lab report files"
on storage.objects for update to authenticated
using (
  bucket_id = 'lab-reports'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'lab-reports'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their own lab report files"
on storage.objects for delete to authenticated
using (
  bucket_id = 'lab-reports'
  and (storage.foldername(name))[1] = auth.uid()::text
);
