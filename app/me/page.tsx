import { redirect } from "next/navigation";

import {
  Card,
  EmptyState,
  PageShell,
  SecondaryLink,
  StatCard,
  TypeBadge,
} from "@/components/ui";
import { getActiveHuntItems, getAppConfig, getParticipantClaims } from "@/lib/data";
import { formatDateTime } from "@/lib/labels";
import { getCurrentParticipant } from "@/lib/participant";
import { summarizeClaims } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const participant = await getCurrentParticipant();

  if (!participant) {
    redirect("/?returnTo=/me");
  }

  const [claims, activeItems, config] = await Promise.all([
    getParticipantClaims(participant.id),
    getActiveHuntItems(),
    getAppConfig(),
  ]);
  const summary = summarizeClaims(
    claims.map((claim) => ({
      points: claim.hunt_item.points,
      tickets: claim.hunt_item.tickets,
      type: claim.hunt_item.type,
    })),
  );
  const activeItemIds = new Set(activeItems.map((item) => item.id));
  const activeClaimCount = claims.filter((claim) =>
    activeItemIds.has(claim.hunt_item.id),
  ).length;
  const progress =
    activeItems.length > 0
      ? Math.round((activeClaimCount / activeItems.length) * 100)
      : 0;

  return (
    <PageShell>
      <div className="grid gap-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-emerald-700">내 보물 현황</p>
            <h1 className="mt-1 text-4xl font-black text-slate-950">
              {participant.name}님
            </h1>
          </div>
          <div className="flex gap-2">
            <SecondaryLink href="/results">결과 보기</SecondaryLink>
            <SecondaryLink href="/">이름 변경</SecondaryLink>
          </div>
        </header>

        {config.game_status !== "open" ? (
          <Card className="border-orange-200 bg-orange-50 text-orange-900">
            <p className="font-bold">현재 보물찾기가 잠겨 있어요.</p>
            <p className="mt-1 text-sm">
              관리자가 추첨을 준비 중이면 새 QR 획득이 제한될 수 있습니다.
            </p>
          </Card>
        ) : null}

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="점수" value={`${summary.score}점`} />
          <StatCard label="응모권" value={`${summary.tickets}장`} />
          <StatCard label="획득" value={`${summary.claimCount}개`} />
          <StatCard label="진행률" value={`${progress}%`} />
        </section>

        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                획득한 QR
              </h2>
              <p className="text-sm text-slate-500">
                같은 QR은 한 번만 기록됩니다.
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
              {activeClaimCount}/{activeItems.length}
            </span>
          </div>

          {claims.length === 0 ? (
            <EmptyState
              title="아직 획득한 보물이 없어요"
              description="펜션 곳곳의 QR을 찾아 휴대폰 카메라로 열어보세요."
            />
          ) : (
            <div className="grid gap-3">
              {claims.map((claim) => (
                <article
                  className="rounded-[8px] border border-slate-200 bg-slate-50 p-4"
                  key={claim.id}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <TypeBadge type={claim.hunt_item.type} />
                    <p className="text-xs font-semibold text-slate-500">
                      {formatDateTime(claim.created_at)}
                    </p>
                  </div>
                  <h3 className="mt-2 text-lg font-black text-slate-950">
                    {claim.hunt_item.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {claim.hunt_item.description}
                  </p>
                  <p className="mt-3 text-sm font-bold text-emerald-700">
                    +{claim.hunt_item.points}점 · 응모권 +
                    {claim.hunt_item.tickets}장
                  </p>
                </article>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
