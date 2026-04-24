create extension if not exists pgcrypto;

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 30),
  client_token text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.hunt_items (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (char_length(trim(code)) between 3 and 80),
  title text not null check (char_length(trim(title)) between 1 and 80),
  description text not null default '',
  type text not null check (type in ('normal', 'bonus', 'blank', 'mission')),
  points integer not null default 0 check (points >= 0),
  tickets integer not null default 0 check (tickets >= 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  hunt_item_id uuid not null references public.hunt_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (participant_id, hunt_item_id)
);

create table if not exists public.prizes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 80),
  description text not null default '',
  quantity integer not null default 1 check (quantity >= 1),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.draw_results (
  id uuid primary key default gen_random_uuid(),
  prize_id uuid not null references public.prizes(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  position integer not null default 1 check (position >= 1),
  created_at timestamptz not null default now()
);

create table if not exists public.app_config (
  id smallint primary key default 1 check (id = 1),
  game_status text not null default 'open' check (game_status in ('open', 'locked', 'draw')),
  allow_duplicate_winners boolean not null default false,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_app_config_updated_at on public.app_config;
create trigger set_app_config_updated_at
before update on public.app_config
for each row
execute function public.set_updated_at();

create index if not exists claims_participant_id_idx on public.claims(participant_id);
create index if not exists claims_hunt_item_id_idx on public.claims(hunt_item_id);
create index if not exists hunt_items_active_sort_idx on public.hunt_items(is_active, sort_order);
create index if not exists draw_results_prize_id_idx on public.draw_results(prize_id);
create index if not exists draw_results_participant_id_idx on public.draw_results(participant_id);

insert into public.app_config (id, game_status, allow_duplicate_winners)
values (1, 'open', false)
on conflict (id) do nothing;

alter table public.participants enable row level security;
alter table public.hunt_items enable row level security;
alter table public.claims enable row level security;
alter table public.prizes enable row level security;
alter table public.draw_results enable row level security;
alter table public.app_config enable row level security;
