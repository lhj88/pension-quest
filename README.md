# Pension Quest

모바일/공용 기기 우선 QR 보물찾기 MVP입니다. 8명 안팎의 펜션 여행 그룹이 QR을 스캔해 이름을 입력하고, 점수와 응모권을 모은 뒤, 마지막에 관리자가 응모권 기반 가중 추첨을 실행하는 짧은 이벤트용 앱입니다.

## File tree

```text
app/
  page.tsx                    # 참가자 이름 등록
  me/page.tsx                 # 내 점수/응모권/획득 현황
  claim/[code]/page.tsx       # QR claim URL, QR마다 이름 입력
  results/page.tsx            # 공개 결과 화면
  results/draw-reveal.tsx     # 단계별 당첨 공개 UI
  admin/page.tsx              # admin 로그인
  admin/actions.ts            # admin server actions
  admin/(protected)/...       # dashboard/items/prizes/draw/settings/qr
components/ui.tsx             # 공통 UI 컴포넌트
lib/
  supabase/admin.ts           # service role 서버 클라이언트
  participant.ts              # 참가자 식별, 이름 정규화, 같은 이름 재사용
  claim.ts                    # QR claim 처리
  draw.ts                     # weighted draw 순수 로직
  prize-order.ts              # 상품 순서 정렬/저장 helper
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

새로 설치하는 경우 `supabase/migrations/0001_initial_schema.sql`를 Supabase SQL Editor에서 먼저 실행한 뒤, `supabase/seed.sql`를 실행합니다.

이미 이전 버전 DB를 만들어 둔 경우에는 `supabase/migrations/0002_add_prize_sort_order.sql`를 한 번 실행한 뒤 앱을 배포하세요. 이 migration은 기존 상품에 `sort_order`를 추가하고, 생성일 기준으로 10, 20, 30... 순서를 채웁니다.

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

1. Supabase SQL Editor에서 `supabase/migrations/0001_initial_schema.sql` 실행
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
http://localhost:3000/claim/PENSION-001 # QR마다 이름 입력 후 획득
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

## 참가자 이름 처리

공용 컴퓨터나 공용 태블릿에서 여러 사람이 QR을 찍는 상황을 기준으로, `/claim/[code]`는 쿠키에 저장된 참가자를 바로 쓰지 않고 매번 이름을 입력받습니다.

- 같은 이름을 입력하면 같은 참가자로 보고 기존 점수와 응모권에 합산합니다.
- 같은 참가자는 같은 QR을 한 번만 획득할 수 있습니다.
- 이름이 완전히 같은 사람이 여러 명 있으면 구분할 수 없으므로, 운영할 때는 `민수1`, `민수2`처럼 별칭을 정하는 것을 권장합니다.

## 상품 순서와 결과 공개

관리자는 `/admin/prizes`에서 상품을 만들고, 위/아래 버튼이나 드래그로 추첨 상품 순서를 조정할 수 있습니다. 추첨을 실행하면 이 순서대로 당첨 슬롯이 배정되고 `/results`에서도 같은 순서로 공개됩니다.

`/results`의 당첨 공개 화면은 진행자용입니다.

- `이름 먼저` / `상품 먼저` 공개 모드를 선택할 수 있습니다.
- `공개 시작` 후 화면을 클릭하거나 Space / Enter를 누르면 두 번째 정보를 공개합니다.
- 오른쪽 화살표는 다음 당첨, 왼쪽 화살표는 이전 당첨으로 이동합니다.

## Vercel deploy

1. GitHub 저장소를 Vercel에 연결합니다.
2. Framework Preset은 Next.js로 둡니다.
3. Environment Variables에 다음을 추가합니다.
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_APP_URL` = `https://your-vercel-domain.vercel.app`
4. Supabase SQL Editor에서 migration과 seed를 적용합니다.
5. Vercel에서 Deploy를 실행합니다.
6. 배포 후 `/admin`에서 로그인하고 `/admin/qr`의 QR 카드를 인쇄합니다.

## 운영 흐름

1. 관리자가 `/admin/items`에서 QR 항목을 확인하거나 수정합니다.
2. `/admin/prizes`에서 상품과 수량, 공개 순서를 설정합니다.
3. `/admin/settings`에서 상태를 `진행중`으로 둡니다.
4. 참가자는 QR URL을 열고, 그때마다 이름을 입력한 뒤 claim을 완료합니다.
5. 행사가 끝나면 `/admin/settings`에서 `잠금`으로 바꾸거나 `/admin/draw`에서 바로 추첨을 실행합니다.
6. `/results`를 휴대폰 또는 TV에 띄워 결과와 리더보드를 보여줍니다.
