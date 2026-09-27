alter table public.lesson_records
add column if not exists classic_example text not null default '';

alter table public.lesson_records
drop column if exists lesson_date,
drop column if exists lesson_type,
drop column if exists title,
drop column if exists improvement_actions,
drop column if exists tags;

drop index if exists public.lesson_records_owner_date_idx;

create index if not exists lesson_records_owner_updated_idx
on public.lesson_records (owner_id, updated_at desc);
