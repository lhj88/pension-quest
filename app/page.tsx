import { registerParticipant } from "@/app/actions";
import { Card, PageShell, PrimaryButton, SecondaryLink } from "@/components/ui";
import { getCurrentParticipant } from "@/lib/participant";

type HomePageProps = {
  searchParams: Promise<{
    error?: string;
    returnTo?: string;
  }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const participant = await getCurrentParticipant();
  const returnTo =
    typeof params.returnTo === "string" && params.returnTo.startsWith("/")
      ? params.returnTo
      : "/me";

  return (
    <PageShell>
      <div className="grid flex-1 content-center gap-6 py-8">
        <section className="rounded-[8px] border border-emerald-200 bg-emerald-950 p-6 text-white shadow-lg sm:p-8">
          <p className="text-sm font-bold text-emerald-200">Pension Quest</p>
          <h1 className="mt-3 text-4xl font-black leading-tight sm:text-6xl">
            QR을 찾아 점수와 응모권을 모아보세요
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50 sm:text-lg">
            펜션 곳곳에 숨겨진 QR을 열면 이름을 입력하고 바로 보물을 획득할 수 있어요.
            공용 기기에서도 QR을 찍을 때마다 이름을 다시 받도록 만들었습니다.
          </p>
        </section>

        <Card className="grid gap-5">
          {params.error === "name" ? (
            <p className="rounded-[8px] bg-red-50 p-3 text-sm font-semibold text-red-700">
              이름은 1자 이상 30자 이하로 입력해 주세요.
            </p>
          ) : null}

          {participant ? (
            <div className="grid gap-3">
              <p className="text-sm font-semibold text-slate-500">
                이 기기에 저장된 참가자
              </p>
              <p className="text-2xl font-black text-slate-950">
                {participant.name}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <SecondaryLink href="/me">내 현황 보기</SecondaryLink>
                <SecondaryLink href={returnTo}>이동하기</SecondaryLink>
              </div>
            </div>
          ) : null}

          <form action={registerParticipant} className="grid gap-4">
            <input name="returnTo" type="hidden" value={returnTo} />
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              참가자 이름
              <input
                autoComplete="name"
                className="min-h-12 rounded-[8px] border border-slate-300 bg-white px-4 text-lg font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                defaultValue={participant?.name}
                maxLength={30}
                name="name"
                placeholder="예: 지수"
                required
              />
            </label>
            <PrimaryButton>
              {participant ? "이름 저장하고 계속하기" : "참가 시작하기"}
            </PrimaryButton>
          </form>
        </Card>
      </div>
    </PageShell>
  );
}
