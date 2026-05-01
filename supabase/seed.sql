insert into public.app_config (id, game_status, allow_duplicate_winners)
values (1, 'open', false)
on conflict (id) do update
set game_status = excluded.game_status,
    allow_duplicate_winners = excluded.allow_duplicate_winners;

insert into public.hunt_items (code, title, description, type, points, tickets, is_active, sort_order)
values
  ('PENSION-001', '일반 QR 1', '기본 보물 QR입니다. 응모권 1장을 획득합니다.', 'normal', 0, 1, true, 10),
  ('PENSION-002', '일반 QR 2', '기본 보물 QR입니다. 응모권 1장을 획득합니다.', 'normal', 0, 1, true, 20),
  ('PENSION-003', '일반 QR 3', '기본 보물 QR입니다. 응모권 1장을 획득합니다.', 'normal', 0, 1, true, 30),
  ('PENSION-004', '일반 QR 4', '기본 보물 QR입니다. 응모권 1장을 획득합니다.', 'normal', 0, 1, true, 40),
  ('PENSION-005', '일반 QR 5', '기본 보물 QR입니다. 응모권 1장을 획득합니다.', 'normal', 0, 1, true, 50),
  ('PENSION-006', '일반 QR 6', '기본 보물 QR입니다. 응모권 1장을 획득합니다.', 'normal', 0, 1, true, 60),
  ('PENSION-007', '일반 QR 7', '기본 보물 QR입니다. 응모권 1장을 획득합니다.', 'normal', 0, 1, true, 70),
  ('PENSION-008', '일반 QR 8', '기본 보물 QR입니다. 응모권 1장을 획득합니다.', 'normal', 0, 1, true, 80),
  ('BONUS-STAR', '축하의 박수', '이 QR을 찾은 사람에게 모두의 박수 3초. 응모권 1장 추가!', 'bonus', 0, 1, true, 90),
  ('BLANK-OOF', '아쉽지만 꽝', '아무 일도 일어나지 않았습니다. 그래도 찾은 사람은 대단함.', 'blank', 0, 0, true, 100),
  ('MISSION-SING', '뒷정리 MVP 후보', '오늘의 뒷정리 후보에 등록되었습니다. 실제 집행 여부는 현장 분위기에 따릅니다.', 'mission', 0, 0, true, 110)
on conflict (code) do update
set title = excluded.title,
    description = excluded.description,
    type = excluded.type,
    points = excluded.points,
    tickets = excluded.tickets,
    is_active = excluded.is_active,
    sort_order = excluded.sort_order;

update public.hunt_items
set is_active = false
where code not in (
  'PENSION-001',
  'PENSION-002',
  'PENSION-003',
  'PENSION-004',
  'PENSION-005',
  'PENSION-006',
  'PENSION-007',
  'PENSION-008',
  'BONUS-STAR',
  'BLANK-OOF',
  'MISSION-SING'
);

insert into public.prizes (name, description, quantity, is_active, sort_order)
values
  ('1등 상품', '오늘의 메인 보상입니다.', 1, true, 10),
  ('2등 상품', '응모권의 힘을 믿어보세요.', 1, true, 20),
  ('깜짝 상품', '마지막까지 재미를 더하는 보너스 상품입니다.', 1, true, 30)
on conflict do nothing;
