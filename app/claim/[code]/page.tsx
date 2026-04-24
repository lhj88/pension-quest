import { redirect } from "next/navigation";

import {
  Card,
  PageShell,
  SecondaryLink,
  StatCard,
  TypeBadge,
} from "@/components/ui";
import { claimHuntItem } from "@/lib/claim";
import { getCurrentParticipant } from "@/lib/participant";

export const dynamic = "force-dynamic";

type ClaimPageProps = {
  params: Promise<{ code: string }>;
};

export default async function ClaimPage({ params }: ClaimPageProps) {
  const { code } = await params;
  const participant = await getCurrentParticipant();

  if (!participant) {
    redirect(`/?returnTo=/claim/${encodeURIComponent(code)}`);
  }

  const result = await claimHuntItem(participant.id, code);

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
          <div className="mt-4 flex justify-center">
            <TypeBadge type={result.item.type} />
          </div>
          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-600">
            {result.item.description}
          </p>
          {isDuplicate ? (
            <p className="mt-4 rounded-[8px] bg-amber-50 p-3 text-sm font-bold text-amber-800">
              같은 참가자는 이 QR을 한 번만 획득할 수 있어요.
            </p>
          ) : null}
        </Card>

        <section className="grid grid-cols-2 gap-3">
          <StatCard label="점수" value={`+${result.item.points}`} />
          <StatCard label="응모권" value={`+${result.item.tickets}`} />
        </section>

        <div className="grid gap-2 sm:grid-cols-2">
          <SecondaryLink href="/me">내 현황 보기</SecondaryLink>
          <SecondaryLink href="/results">결과 화면 보기</SecondaryLink>
        </div>
      </div>
    </PageShell>
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
          <SecondaryLink href="/me">내 현황으로 돌아가기</SecondaryLink>
        </div>
      </Card>
    </div>
  );
}
