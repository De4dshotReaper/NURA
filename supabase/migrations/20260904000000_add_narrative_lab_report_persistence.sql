alter table public.lab_reports
  add column if not exists analysis_type text not null default 'structured',
  add column if not exists narrative_analysis jsonb;

alter table public.lab_reports
  drop constraint if exists lab_reports_analysis_type_check;

alter table public.lab_reports
  add constraint lab_reports_analysis_type_check
  check (analysis_type in ('structured', 'narrative'));
