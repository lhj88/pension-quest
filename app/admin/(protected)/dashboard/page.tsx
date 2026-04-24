import {
  Card,
  EmptyState,
  StatCard,
  StatusBadge,
  TypeBadge,
} from "@/components/ui";
import {
  getAllHuntItems,
  getAppConfig,
  getDrawResults,
  getLeaderboard,
  getPrizes,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [config, leaderboard, items, prizes, results] = await Promise.all([
    getAppConfig(),
    getLeaderboard(),
    getAllHuntItems(),
    getPrizes(),
    getDrawResults(),
  ]);
  const claimCount = leaderboard.reduce(
    (sum, entry) => sum + entry.claimCount,
    0,
  );

  return (
    <div className="grid gap-5">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="상태" value={<StatusBadge status={config.game_status} />} />
        <StatCard label="참가자" value={`${leaderboard.length}명`} />
        <StatCard label="총 획득" value={`${claimCount}개`} />
        <StatCard label="QR 항목" value={`${items.length}개`} />
        <StatCard label="상품" value={`${prizes.length}개`} />
      </section>

      <Card>
        <h2 className="text-xl font-black text-slate-950">참가자 현황</h2>
        <div className="mt-4 grid gap-2">
          {leaderboard.length === 0 ? (
            <EmptyState
              title="참가자가 아직 없습니다"
              description="랜딩 페이지에서 이름을 등록하면 이곳에 표시됩니다."
            />
          ) : (
            leaderboard.map((entry) => (
              <div
                className="grid grid-cols-[1fr_auto] gap-3 rounded-[8px] border border-slate-200 bg-slate-50 p-3"
                key={entry.participant.id}
              >
                <div>
                  <p className="font-black text-slate-950">
                    {entry.participant.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    획득 {entry.claimCount}개
                  </p>
                </div>
                <p className="text-right text-sm font-black text-slate-800">
                  {entry.score}점 · {entry.tickets}장
                </p>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-black text-slate-950">QR 항목 요약</h2>
        <div className="mt-4 grid gap-2">
          {items.map((item) => (
            <div
              className="flex items-center justify-between gap-3 rounded-[8px] border border-slate-200 bg-slate-50 p-3"
              key={item.id}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <TypeBadge type={item.type} />
                  {!item.is_active ? (
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
                      비활성
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 font-black text-slate-950">{item.title}</p>
              </div>
              <p className="text-right text-sm font-bold text-slate-600">
                {item.points}점
                <br />
                {item.tickets}장
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-black text-slate-950">추첨 저장 결과</h2>
        <p className="mt-2 text-sm text-slate-600">
          현재 저장된 당첨 기록은 {results.length}개입니다.
        </p>
      </Card>
    </div>
  );
}
