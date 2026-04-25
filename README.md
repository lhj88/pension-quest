# Pension Quest

모바일 우선 QR 보물찾기 MVP입니다. 8명 안팎의 펜션 여행 그룹이 QR을 스캔해 점수와 응모권을 모으고, 마지막에 관리자가 응모권 기반 가중 추첨을 실행하는 짧은 이벤트용 앱입니다.

## File tree

```text
app/
  page.tsx                    # 참가자 이름 등록
  me/page.tsx                 # 내 점수/응모권/획득 현황
  claim/[code]/page.tsx       # QR claim URL
  results/page.tsx            # 공개 결과 화면
  admin/page.tsx              # admin 로그인
  admin/actions.ts            # admin server actions
  admin/(protected)/...       # dashboard/items/prizes/draw/settings/qr
components/ui.tsx             # 공통 UI 컴포넌트
lib/
  supabase/admin.ts           # service role 서버 클라이언트
  participant.ts              # 참가자 cookie 식별
  claim.ts                    # idempotent QR claim
  draw.ts                     # weighted draw 순수 로직
  stats.ts                    # 점수/응모권 집계
supabase/
  migrations/0001_initial_schema.sql
  migrations/0002_add_prize_sort_order.sql
  seed.sql
scripts/list-qr-urls.ts
tests/
  draw.test.ts
  stats.test.ts
```

## Environment variables

`.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
ADMIN_PASSWORD=change-this-before-deploy
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`SUPABASE_SERVICE_ROLE_KEY`는 서버에서만 사용합니다. Vercel Environment Variables에는 넣되, 클라이언트 코드나 브라우저에는 노출하지 마세요.

## DB schema

`supabase/migrations/`의 SQL을 번호순으로 Supabase SQL Editor에서 먼저 실행한 뒤, `supabase/seed.sql`를 실행합니다.

주요 테이블:

```text
participants
  id uuid pk
  name text
  client_token text unique
  created_at timestamptz

hunt_items
  id uuid pk
  code text unique
  title text
  description text
  type text check normal|bonus|blank|mission
  points integer
  tickets integer
  is_active boolean
  sort_order integer
  created_at timestamptz

claims
  id uuid pk
  participant_id uuid fk
  hunt_item_id uuid fk
  created_at timestamptz
  unique(participant_id, hunt_item_id)

prizes
  id uuid pk
  name text
  description text
  quantity integer
  is_active boolean
  sort_order integer
  created_at timestamptz

draw_results
  id uuid pk
  prize_id uuid fk
  participant_id uuid fk
  position integer
  created_at timestamptz

app_config
  id smallint pk default 1
  game_status text check open|locked|draw
  allow_duplicate_winners boolean
  updated_at timestamptz
```

모든 테이블은 RLS가 켜져 있고 public policy는 만들지 않습니다. 앱은 Next.js 서버에서 Supabase service role로 접근합니다.

## Local run

```bash
npm install
cp .env.example .env.local
```

Supabase 프로젝트를 만든 뒤:

1. Supabase SQL Editor에서 `supabase/migrations/` SQL을 번호순으로 실행
2. 이어서 `supabase/seed.sql` 실행
3. `.env.local`에 Supabase URL, anon key, service role key, admin password 입력

개발 서버:

```bash
npm run dev
```

주요 URL:

```text
http://localhost:3000/                 # 참가자 등록
http://localhost:3000/me               # 내 현황
http://localhost:3000/claim/PENSION-001
http://localhost:3000/results
http://localhost:3000/admin
```

품질 확인:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## QR 운영

관리자 로그인 후 `/admin/qr`에서 인쇄용 QR 카드를 볼 수 있습니다.

터미널에서 URL만 확인하려면:

```bash
npm run qr:urls
```

`NEXT_PUBLIC_APP_URL`은 실제 배포 URL로 설정해야 인쇄된 QR이 배포 앱을 가리킵니다.
현재 실서비스 도메인은 `https://pension-quest-chi.vercel.app`입니다.

## Vercel deploy

1. GitHub 저장소를 Vercel에 연결합니다.
2. Framework Preset은 Next.js로 둡니다.
3. Environment Variables에 다음을 추가합니다.
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_APP_URL` = `https://pension-quest-chi.vercel.app`
4. Supabase SQL Editor에서 migration과 seed를 적용합니다.
5. Vercel에서 Deploy를 실행합니다.
6. 배포 후 `/admin`에서 로그인하고 `/admin/qr`의 QR 카드를 인쇄합니다.

## 운영 흐름

1. 관리자가 `/admin/items`에서 QR 항목을 확인하거나 수정합니다.
2. `/admin/prizes`에서 상품과 수량을 설정합니다.
3. `/admin/settings`에서 상태를 `진행중`으로 둡니다.
4. 참가자는 QR URL을 열고 이름을 등록한 뒤 자동으로 claim을 완료합니다.
5. 행사가 끝나면 `/admin/settings`에서 `잠금`으로 바꾸거나 `/admin/draw`에서 바로 추첨을 실행합니다.
6. `/results`를 휴대폰 또는 TV에 띄워 결과와 리더보드를 보여줍니다.
