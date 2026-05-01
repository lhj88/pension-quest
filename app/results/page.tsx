import {
  Card,
  EmptyState,
  PageShell,
  SecondaryLink,
  StatCard,
  StatusBadge,
  TypeBadge,
} from "@/components/ui";
import {
  getAppConfig,
  getDrawResults,
  getLeaderboard,
  getSpecialClaimGroups,
} from "@/lib/data";
import type { SpecialClaimGroup } from "@/lib/special-claims";

import { DrawReveal } from "./draw-reveal";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const [config, results, leaderboard, specialClaimGroups] = await Promise.all([
    getAppConfig(),
    getDrawResults(),
    getLeaderboard(),
    getSpecialClaimGroups(),
  ]);
  const specialClaimCount = specialClaimGroups.reduce(
    (sum, group) => sum + group.claims.length,
    0,
  );
  const revealResults = results.map((result) => ({
    id: result.id,
    participantName: result.participant.name,
    prizeName: result.prize.name,
    prizeDescription: result.prize.description,
    position: result.position,
  }));

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
            진행자가 선택한 순서로 당첨 결과를 한 명씩 공개하세요.
          </p>
        </header>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="참가자" value={`${leaderboard.length}명`} />
          <StatCard
            label="총 응모권"
            value={`${leaderboard.reduce((sum, entry) => sum + entry.tickets, 0)}장`}
          />
          <StatCard label="특별 QR" value={`${specialClaimCount}개`} />
          <StatCard label="당첨 기록" value={`${results.length}개`} />
        </section>

        <Card>
          <DrawReveal results={revealResults} />
        </Card>

        <SpecialClaimGroups groups={specialClaimGroups} />

        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-slate-950">리더보드</h2>
            <SecondaryLink href="/">처음 화면</SecondaryLink>
          </div>
          <div className="mt-4 grid gap-2">
            {leaderboard.length === 0 ? (
              <EmptyState
                title="참가자가 아직 없어요"
                description="QR을 열고 이름을 입력하면 순위가 생깁니다."
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
                  <p className="text-right text-sm font-black text-emerald-700">
                    응모권
                    <br />
                    <span className="text-lg">{entry.tickets}장</span>
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

function SpecialClaimGroups({ groups }: { groups: SpecialClaimGroup[] }) {
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-950">특별 QR 기록</h2>
          <p className="mt-1 text-sm text-slate-500">
            보너스, 꽝, 장난 QR을 누가 찾았는지 추첨 화면에서 같이 보여줍니다.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        {groups.length === 0 ? (
          <EmptyState
            title="특별 QR 기록이 아직 없어요"
            description="보너스, 꽝, 장난 QR을 찍으면 여기에 표시됩니다."
          />
        ) : (
          groups.map((group) => (
            <section
              className="rounded-[8px] border border-slate-200 bg-slate-50 p-4"
              key={group.type}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <TypeBadge type={group.type} />
                <span className="text-xs font-bold text-slate-500">
                  {group.claims.length}명
                </span>
              </div>
              <div className="mt-3 grid gap-2">
                {group.claims.map((claim) => (
                  <div
                    className="grid gap-2 rounded-[8px] bg-white p-3 sm:grid-cols-[1fr_auto] sm:items-center"
                    key={claim.id}
                  >
                    <div>
                      <p className="font-black text-slate-950">
                        {claim.participantName}
                      </p>
                      <p className="text-sm font-bold text-slate-700">
                        {claim.itemTitle}
                      </p>
                      {claim.itemDescription ? (
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {claim.itemDescription}
                        </p>
                      ) : null}
                    </div>
                    <p className="text-sm font-black text-emerald-700 sm:text-right">
                      {claim.tickets > 0
                        ? `응모권 +${claim.tickets}장`
                        : "응모권 없음"}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </Card>
  );
}
