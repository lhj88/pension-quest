import type { Metadata } from "next";

import { Card, PageShell, SecondaryLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "사용 설명서 | Pension Quest",
  description: "Pension Quest 쉬운 사용 설명서",
};

export default function HelpPage() {
  return (
    <PageShell>
      <div className="grid gap-5 pb-10">
        <header className="rounded-[8px] bg-emerald-950 p-6 text-white sm:p-8">
          <p className="text-sm font-black text-emerald-200">쉬운 설명서</p>
          <h1 className="mt-3 text-4xl font-black leading-tight sm:text-6xl">
            응모권 모으기 설명서
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-emerald-50">
            보는 사람에 맞게 두 가지로 나눴어요. 참가자는 게임이 어떻게
            돌아가는지만 보면 되고, 진행자는 준비와 추첨 방법을 보면 됩니다.
          </p>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <a
              className="rounded-[8px] border border-emerald-200 bg-white p-4 text-emerald-950 transition hover:bg-emerald-50"
              href="#players"
            >
              <p className="text-2xl font-black">일반 사용자 버전</p>
              <p className="mt-1 text-sm font-bold">
                참가자에게 보여주는 설명
              </p>
            </a>
            <a
              className="rounded-[8px] border border-emerald-200 bg-white p-4 text-emerald-950 transition hover:bg-emerald-50"
              href="#admins"
            >
              <p className="text-2xl font-black">관리자 버전</p>
              <p className="mt-1 text-sm font-bold">
                진행자가 보는 운영 설명
              </p>
            </a>
          </div>
        </header>

        <section id="players">
          <Card className="grid gap-5">
            <SectionTitle
              title="일반 사용자 버전"
              text="게임이 어떻게 돌아가는지 쉽게 설명하는 부분입니다."
            />
            <section className="grid gap-3 sm:grid-cols-4">
              <BigStep number="1" title="QR 찾기" text="숨겨진 QR을 찾아요." />
              <BigStep number="2" title="이름 쓰기" text="내 이름을 써요." />
              <BigStep number="3" title="모으기" text="응모권을 모아요." />
              <BigStep number="4" title="추첨 받기" text="응모권으로 선물을 뽑아요." />
            </section>
            <div className="grid gap-3">
              <SimpleRule
                title="이 게임은 뭐예요?"
                text="펜션 안에 있는 QR을 찾아 응모권을 모으는 게임이에요."
              />
              <SimpleRule
                title="QR을 찾으면 어떻게 돼요?"
                text="이름을 쓰면 응모권이 생겨요."
              />
              <SimpleRule
                title="응모권은 왜 모아요?"
                text="응모권이 많을수록 선물에 당첨될 기회가 많아져요."
              />
              <SimpleRule
                title="같은 QR은 또 할 수 있나요?"
                text="같은 이름으로는 같은 QR을 한 번만 할 수 있어요."
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <SecondaryLink href="/">참가 시작</SecondaryLink>
              <SecondaryLink href="/me">내 현황 보기</SecondaryLink>
              <SecondaryLink href="/results">결과 보기</SecondaryLink>
            </div>
          </Card>
        </section>

        <section id="admins">
          <Card className="grid gap-5">
            <SectionTitle
              title="관리자 버전"
              text="행사를 준비하고 진행하는 사람이 보는 부분입니다."
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <MiniCard title="시작 전" text="QR 출력, 상품 입력, 진행중 상태 확인" />
              <MiniCard title="진행 중" text="참가자가 QR을 찾고 이름을 입력" />
              <MiniCard title="마지막" text="게임 잠금, 추첨 실행, 결과 공개" />
            </div>
            <div className="grid gap-3">
              <SimpleRule
                title="1. QR을 준비해요"
                text="관리자 화면에서 QR 카드를 출력하고 펜션 곳곳에 숨겨요."
              />
              <SimpleRule
                title="2. 상품을 준비해요"
                text="상품 이름, 개수, 공개 순서를 정해요."
              />
              <SimpleRule
                title="3. 참가를 시작해요"
                text="설정에서 게임 상태를 진행중으로 둬요."
              />
              <SimpleRule
                title="4. 끝나면 추첨해요"
                text="추첨 화면에서 버튼을 누르고 결과 화면을 큰 화면에 띄워요."
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-4">
              <SecondaryLink href="/admin">관리자</SecondaryLink>
              <SecondaryLink href="/admin/qr">QR 출력</SecondaryLink>
              <SecondaryLink href="/admin/prizes">상품</SecondaryLink>
              <SecondaryLink href="/admin/draw">추첨</SecondaryLink>
            </div>
          </Card>
        </section>

        <Card className="grid gap-4">
          <SectionTitle title="헷갈릴 때" text="현장에서 자주 나오는 질문입니다." />
          <Question
            question="이미 했다고 나와요."
            answer="그 QR은 같은 이름으로 한 번만 할 수 있어요."
          />
          <Question
            question="이름을 잘못 썼어요."
            answer="다음 QR부터 맞는 이름을 쓰면 돼요. 필요하면 진행자에게 말해요."
          />
          <Question
            question="QR이 안 열려요."
            answer="진행자에게 QR 카드를 확인해 달라고 해요."
          />
        </Card>
      </div>
    </PageShell>
  );
}

function BigStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <section className="rounded-[8px] border border-slate-200 bg-slate-50 p-4">
      <p className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-lg font-black text-emerald-800">
        {number}
      </p>
      <h2 className="mt-3 text-2xl font-black text-slate-950">{title}</h2>
      <p className="mt-2 text-base leading-7 text-slate-600">{text}</p>
    </section>
  );
}

function SectionTitle({ title, text }: { title: string; text?: string }) {
  return (
    <div>
      <h2 className="text-3xl font-black leading-tight text-slate-950">
        {title}
      </h2>
      {text ? (
        <p className="mt-2 text-base leading-7 text-slate-600">{text}</p>
      ) : null}
    </div>
  );
}

function SimpleRule({ title, text }: { title: string; text: string }) {
  return (
    <section className="rounded-[8px] border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-xl font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-base leading-7 text-slate-600">{text}</p>
    </section>
  );
}

function MiniCard({ title, text }: { title: string; text: string }) {
  return (
    <section className="rounded-[8px] border border-emerald-200 bg-emerald-50 p-4">
      <h3 className="text-lg font-black text-emerald-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-emerald-900">{text}</p>
    </section>
  );
}

function Question({ question, answer }: { question: string; answer: string }) {
  return (
    <section className="rounded-[8px] border border-slate-200 bg-white p-4">
      <h3 className="font-black text-slate-950">{question}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{answer}</p>
    </section>
  );
}
