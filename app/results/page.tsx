import {
  Card,
  EmptyState,
  PageShell,
  SecondaryLink,
  StatCard,
  StatusBadge,
} from "@/components/ui";
import { getAppConfig, getDrawResults, getLeaderboard } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const [config, results, leaderboard] = await Promise.all([
    getAppConfig(),
    getDrawResults(),
    getLeaderboard(),
  ]);
  const grouped = results.reduce<
    Array<{
      prizeId: string;
      prizeName: string;
      prizeDescription: string;
      winners: string[];
    }>
  >((groups, result) => {
    const existing = groups.find((group) => group.prizeId === result.prize_id);

    if (existing) {
      existing.winners.push(result.participant.name);
      return groups;
    }

    groups.push({
      prizeId: result.prize_id,
      prizeName: result.prize.name,
      prizeDescription: result.prize.description,
      winners: [result.participant.name],
    });
    return groups;
  }, []);

  return (
    <PageShell>
      <div className="grid gap-5">
        <header className="rounded-[8px] bg-slate-950 p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-bold text-emerald-200">공개 결과</p>
            <StatusBadge status={config.game_status} />
          </div>
          <h1 className="mt-3 text-4xl font-black sm:text-6xl">
            오늘의 보물찾기 결과
          </h1>
          <p className="mt-3 max-w-2xl text-slate-200">
            점수 순위와 추첨 결과를 한 화면에서 확인하세요.
          </p>
        </header>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="참가자" value={`${leaderboard.length}명`} />
          <StatCard
            label="총 점수"
            value={`${leaderboard.reduce((sum, entry) => sum + entry.score, 0)}점`}
          />
          <StatCard
            label="총 응모권"
            value={`${leaderboard.reduce((sum, entry) => sum + entry.tickets, 0)}장`}
          />
          <StatCard label="당첨 기록" value={`${results.length}개`} />
        </section>

        <Card>
          <h2 className="text-2xl font-black text-slate-950">당첨자</h2>
          <div className="mt-4 grid gap-3">
            {grouped.length === 0 ? (
              <EmptyState
                title="아직 추첨 결과가 없어요"
                description="관리자가 추첨을 실행하면 이곳에 당첨자가 표시됩니다."
              />
            ) : (
              grouped.map((group) => (
                <article
                  className="rounded-[8px] border border-amber-200 bg-amber-50 p-4"
                  key={group.prizeId}
                >
                  <p className="text-sm font-bold text-amber-800">
                    {group.prizeDescription}
                  </p>
                  <h3 className="mt-1 text-xl font-black text-slate-950">
                    {group.prizeName}
                  </h3>
                  <p className="mt-3 text-3xl font-black text-emerald-700">
                    {group.winners.join(", ")}
                  </p>
                </article>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-slate-950">리더보드</h2>
            <SecondaryLink href="/me">내 현황</SecondaryLink>
          </div>
          <div className="mt-4 grid gap-2">
            {leaderboard.length === 0 ? (
              <EmptyState
                title="참가자가 아직 없어요"
                description="첫 참가자가 이름을 등록하면 순위가 생깁니다."
              />
            ) : (
              leaderboard.map((entry, index) => (
                <div
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[8px] border border-slate-200 bg-slate-50 p-3"
                  key={entry.participant.id}
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-800">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-black text-slate-950">
                      {entry.participant.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      획득 {entry.claimCount}개
                    </p>
                  </div>
                  <p className="text-right text-sm font-black text-slate-800">
                    {entry.score}점
                    <br />
                    <span className="text-emerald-700">
                      {entry.tickets}장
                    </span>
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
