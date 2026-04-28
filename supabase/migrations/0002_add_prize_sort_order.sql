alter table public.prizes
add column if not exists sort_order integer not null default 0;

with ranked_prizes as (
  select
    id,
    row_number() over (order by created_at, id) * 10 as next_sort_order
  from public.prizes
)
update public.prizes
set sort_order = ranked_prizes.next_sort_order
from ranked_prizes
where public.prizes.id = ranked_prizes.id
  and public.prizes.sort_order = 0;

create index if not exists prizes_active_sort_idx
on public.prizes(is_active, sort_order);
