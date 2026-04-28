insert into public.app_config (id, game_status, allow_duplicate_winners)
values (1, 'open', false)
on conflict (id) do update
set game_status = excluded.game_status,
    allow_duplicate_winners = excluded.allow_duplicate_winners;

insert into public.hunt_items (code, title, description, type, points, tickets, is_active, sort_order)
values
  ('PENSION-001', '창가의 작은 보물', '거실 창가 근처에서 발견한 첫 번째 단서예요.', 'normal', 10, 1, true, 10),
  ('PENSION-002', '주방 탐험가', '주방 주변을 꼼꼼히 살핀 사람에게 주는 점수입니다.', 'normal', 10, 1, true, 20),
  ('PENSION-003', '계단 밑 발견', '지나치기 쉬운 곳을 잘 찾아냈어요.', 'normal', 10, 1, true, 30),
  ('PENSION-004', '테라스 산책', '바깥 공기를 마시며 찾은 보물입니다.', 'normal', 10, 1, true, 40),
  ('PENSION-005', '소파 주변 수색', '편한 자리에도 힌트는 숨어 있어요.', 'normal', 10, 1, true, 50),
  ('PENSION-006', '문 뒤의 신호', '문 뒤를 확인한 세심함에 보상!', 'normal', 10, 1, true, 60),
  ('BONUS-STAR', '보너스 별조각', '이번 여행의 운이 살짝 따라줬네요.', 'bonus', 25, 3, true, 70),
  ('BONUS-LUCKY', '행운의 추가권', '응모권이 크게 늘어나는 특별 QR입니다.', 'bonus', 15, 4, true, 80),
  ('BLANK-OOF', '꽝도 추억', '점수는 없지만 발견 기록은 남습니다.', 'blank', 0, 0, true, 90),
  ('MISSION-SING', '미션: 한 소절 부르기', '관리자에게 노래 한 소절 또는 건배사를 보여주면 인정!', 'mission', 20, 2, true, 100)
on conflict (code) do update
set title = excluded.title,
    description = excluded.description,
    type = excluded.type,
    points = excluded.points,
    tickets = excluded.tickets,
    is_active = excluded.is_active,
    sort_order = excluded.sort_order;

insert into public.prizes (name, description, quantity, is_active, sort_order)
values
  ('1등 상품', '오늘의 메인 보상입니다.', 1, true, 10),
  ('2등 상품', '응모권의 힘을 믿어보세요.', 1, true, 20),
  ('깜짝 상품', '마지막까지 재미를 더하는 보너스 상품입니다.', 1, true, 30)
on conflict do nothing;
