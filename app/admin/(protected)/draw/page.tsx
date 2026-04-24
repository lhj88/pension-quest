import {
  clearDrawResults,
  runDraw,
} from "@/app/admin/actions";
import {
  Card,
  EmptyState,
  PrimaryButton,
  SecondaryLink,
  StatCard,
} from "@/components/ui";
import {
  getActivePrizes,
  getAppConfig,
  getDrawResults,
  getLeaderboard,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminDrawPage() {
  const [config, leaderboard, prizes, results] = await Promise.all([
    getAppConfig(),
    getLeaderboard(),
    getActivePrizes(),
    getDrawResults(),
  ]);
  const totalTickets = leaderboard.reduce((sum, entry) => sum + entry.tickets, 0);
  const totalSlots = prizes.reduce((sum, prize) => sum + prize.quantity, 0);

  return (
    <div className="grid gap-5">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="추첨 대상 상품" value={`${prizes.length}개`} />
        <StatCard label="당첨 슬롯" value={`${totalSlots}개`} />
        <StatCard label="총 응모권" value={`${totalTickets}장`} />
        <StatCard label="저장 결과" value={`${results.length}개`} />
      </section>

      <Card>
        <h2 className="text-xl font-black text-slate-950">가중 추첨 실행</h2>
        <p className="mt-2 text-sm text-slate-600">
          응모권 수가 많을수록 당첨 확률이 높아집니다. 실행하면 기존 추첨
          결과를 새 결과로 교체합니다.
        </p>
        <form action={runDraw} className="mt-5 grid gap-4">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <input
              className="size-4 accent-emerald-600"
              defaultChecked={config.allow_duplicate_winners}
              name="allow_duplicate_winners"
              type="checkbox"
            />
            한 사람이 여러 상품에 당첨될 수 있게 하기
          </label>
          <PrimaryButton className="sm:w-fit">추첨 실행하기</PrimaryButton>
        </form>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-black text-slate-950">현재 결과</h2>
          <div className="flex gap-2">
            <SecondaryLink href="/results">공개 화면</SecondaryLink>
            <form action={clearDrawResults}>
              <button
                className="min-h-11 rounded-[8px] border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100"
                type="submit"
              >
                결과 비우기
              </button>
            </form>
          </div>
        </div>
        <div className="mt-4 grid gap-2">
          {results.length === 0 ? (
            <EmptyState
              title="저장된 추첨 결과가 없습니다"
              description="추첨 실행 버튼을 누르면 상품별 당첨자가 저장됩니다."
            />
          ) : (
            results.map((result) => (
              <div
                className="grid grid-cols-[1fr_auto] gap-3 rounded-[8px] border border-amber-200 bg-amber-50 p-3"
                key={result.id}
              >
                <div>
                  <p className="font-black text-slate-950">
                    {result.prize.name}
                  </p>
                  <p className="text-sm text-slate-600">
                    {result.participant.name}
                  </p>
                </div>
                <p className="text-sm font-bold text-amber-800">
                  #{result.position}
                </p>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-black text-slate-950">응모권 풀</h2>
        <div className="mt-4 grid gap-2">
          {leaderboard.length === 0 ? (
            <EmptyState
              title="응모권이 없습니다"
              description="참가자가 QR을 획득하면 이 목록에 표시됩니다."
            />
          ) : (
            leaderboard.map((entry) => (
              <div
                className="flex items-center justify-between rounded-[8px] border border-slate-200 bg-slate-50 p-3"
                key={entry.participant.id}
              >
                <p className="font-bold text-slate-950">
                  {entry.participant.name}
                </p>
                <p className="text-sm font-black text-emerald-700">
                  {entry.tickets}장
                </p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
