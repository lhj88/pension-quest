import { PageShell, SecondaryLink } from "@/components/ui";

const steps = [
  { label: "QR 찾고", detail: "숨겨진 QR을 발견하면" },
  { label: "이름 쓰고", detail: "그 자리에서 이름을 남기고" },
  { label: "응모권 모으기", detail: "추첨 기회를 차곡차곡" },
  { label: "추첨 받기", detail: "마지막에 선물을 뽑아요" },
];

export default function Home() {
  return (
    <PageShell>
      <div className="grid flex-1 content-center gap-6 py-8">
        <section className="overflow-hidden rounded-[8px] border-4 border-slate-950 bg-white shadow-lg">
          <div className="border-b-4 border-slate-950 bg-sky-100 px-5 py-4 sm:px-8">
            <p className="text-sm font-black uppercase text-sky-800">
              Pension Quest
            </p>
          </div>

          <div className="grid gap-6 px-5 py-7 sm:px-8 sm:py-9">
            <div className="grid gap-4">
              <p className="w-fit rounded-[8px] border-2 border-emerald-500 bg-white px-3 py-1 text-sm font-black text-emerald-700">
                오늘의 응모권 게임
              </p>
              <h1 className="max-w-3xl text-5xl font-black leading-tight text-slate-950 sm:text-7xl">
                QR을 찾아
                <span className="block text-yellow-500">응모권을 모아요</span>
              </h1>
              <p className="max-w-2xl text-lg font-bold leading-8 text-slate-700">
                시작은 이 화면이 아니라 숨겨진 QR입니다. QR을 열면 이름을 쓰고
                응모권을 받을 수 있어요.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              {steps.map((step, index) => (
                <section
                  className="rounded-[8px] border-2 border-slate-950 bg-slate-50 p-4"
                  key={step.label}
                >
                  <p className="flex size-9 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">
                    {index + 1}
                  </p>
                  <h2 className="mt-3 text-2xl font-black leading-tight text-slate-950">
                    {step.label}
                  </h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                    {step.detail}
                  </p>
                </section>
              ))}
            </div>
          </div>
        </section>

        <nav className="grid sm:max-w-xs">
          <SecondaryLink href="/help">설명 보기</SecondaryLink>
        </nav>
      </div>
    </PageShell>
  );
}
