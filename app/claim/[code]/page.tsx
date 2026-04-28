import {
  Card,
  PageShell,
  PrimaryButton,
  SecondaryLink,
  StatCard,
  TypeBadge,
} from "@/components/ui";
import { claimHuntItemByName } from "@/lib/claim";
import { normalizeParticipantName } from "@/lib/participant";

export const dynamic = "force-dynamic";

type ClaimPageProps = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ name?: string }>;
};

export default async function ClaimPage({
  params,
  searchParams,
}: ClaimPageProps) {
  const { code } = await params;
  const { name: rawName } = await searchParams;
  const hasSubmittedName = typeof rawName === "string";
  const participantName = hasSubmittedName
    ? normalizeParticipantName(rawName)
    : "";

  if (
    !hasSubmittedName ||
    participantName.length < 1 ||
    participantName.length > 30
  ) {
    return (
      <PageShell>
        <ClaimNameForm
          code={code}
          hasError={hasSubmittedName}
        />
      </PageShell>
    );
  }

  const result = await claimHuntItemByName(participantName, code);

  if (result.status === "invalid") {
    return (
      <PageShell>
        <ClaimMessage
          title="알 수 없는 QR이에요"
          description="코드가 잘못되었거나 등록되지 않은 QR입니다."
        />
      </PageShell>
    );
  }

  if (result.status === "locked") {
    return (
      <PageShell>
        <ClaimMessage
          title="지금은 획득할 수 없어요"
          description="관리자가 게임을 잠근 상태입니다. 잠시 후 결과 화면을 확인해 주세요."
        />
      </PageShell>
    );
  }

  if (result.status === "inactive") {
    return (
      <PageShell>
        <ClaimMessage
          title="비활성화된 QR이에요"
          description={`${result.item.title}은 현재 획득 대상이 아닙니다.`}
        />
      </PageShell>
    );
  }

  const isDuplicate = result.status === "duplicate";

  return (
    <PageShell>
      <div className="grid flex-1 content-center gap-5 py-8">
        <Card className="border-emerald-200 bg-white p-6 text-center">
          <p className="text-sm font-black text-emerald-700">
            {isDuplicate ? "이미 획득한 보물" : "획득 완료"}
          </p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">
            {result.item.title}
          </h1>
          <p className="mt-3 text-lg font-black text-slate-700">
            {result.participant.name}님으로 기록했어요
          </p>
          <div className="mt-4 flex justify-center">
            <TypeBadge type={result.item.type} />
          </div>
          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-600">
            {result.item.description}
          </p>
          {isDuplicate ? (
            <p className="mt-4 rounded-[8px] bg-amber-50 p-3 text-sm font-bold text-amber-800">
              같은 이름은 이 QR을 한 번만 획득할 수 있어요.
            </p>
          ) : null}
          <p className="mt-4 rounded-[8px] bg-slate-50 p-3 text-sm font-bold text-slate-700">
            다음 사람은 새 QR을 찍거나 아래 버튼으로 이름 입력 화면으로 돌아가면 됩니다.
          </p>
        </Card>

        <section className="grid grid-cols-2 gap-3">
          <StatCard label="점수" value={`+${result.item.points}`} />
          <StatCard label="응모권" value={`+${result.item.tickets}`} />
        </section>

        <div className="grid gap-2 sm:grid-cols-2">
          <SecondaryLink href={`/claim/${encodeURIComponent(code)}`}>
            다른 이름으로 다시 입력
          </SecondaryLink>
          <SecondaryLink href="/results">결과 화면 보기</SecondaryLink>
        </div>
      </div>
    </PageShell>
  );
}

function ClaimNameForm({
  code,
  hasError,
}: {
  code: string;
  hasError: boolean;
}) {
  return (
    <div className="grid flex-1 content-center gap-5 py-8">
      <Card className="border-emerald-200 p-6">
        <p className="text-sm font-black text-emerald-700">QR 발견!</p>
        <h1 className="mt-2 text-4xl font-black leading-tight text-slate-950">
          이름을 입력하면 바로 기록돼요
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          공용 컴퓨터나 공용 태블릿에서도 섞이지 않도록 QR을 찍을 때마다 이름을 받습니다.
          같은 이름을 다시 입력하면 이전 기록에 이어서 누적돼요.
        </p>

        {hasError ? (
          <p className="mt-4 rounded-[8px] bg-red-50 p-3 text-sm font-semibold text-red-700">
            이름은 1자 이상 30자 이하로 입력해 주세요.
          </p>
        ) : null}

        <form
          action={`/claim/${encodeURIComponent(code)}`}
          className="mt-6 grid gap-4"
          method="get"
        >
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            참가자 이름
            <input
              autoComplete="off"
              autoFocus
              className="min-h-14 rounded-[8px] border border-slate-300 bg-white px-4 text-xl font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              maxLength={30}
              name="name"
              placeholder="예: 지수"
              required
            />
          </label>
          <PrimaryButton className="min-h-14 text-base">
            이 이름으로 QR 획득하기
          </PrimaryButton>
        </form>
      </Card>
    </div>
  );
}

function ClaimMessage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="grid flex-1 content-center py-8">
      <Card className="text-center">
        <h1 className="text-3xl font-black text-slate-950">{title}</h1>
        <p className="mt-3 text-slate-600">{description}</p>
        <div className="mt-6">
          <SecondaryLink href="/results">결과 화면 보기</SecondaryLink>
        </div>
      </Card>
    </div>
  );
}
