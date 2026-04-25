"use client";

import { useEffect, useState } from "react";

import { cx, EmptyState } from "@/components/ui";

type RevealMode = "name-first" | "prize-first";

export type DrawRevealResult = {
  id: string;
  participantName: string;
  prizeName: string;
  prizeDescription: string;
  position: number;
};

type DrawRevealProps = {
  results: DrawRevealResult[];
};

const revealModes: Array<{ label: string; value: RevealMode }> = [
  { label: "이름 먼저", value: "name-first" },
  { label: "상품 먼저", value: "prize-first" },
];

export function DrawReveal({ results }: DrawRevealProps) {
  const [mode, setMode] = useState<RevealMode>("name-first");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isSecondPartVisible, setIsSecondPartVisible] = useState(false);

  const currentResult = results[currentIndex];
  const isComplete =
    hasStarted && results.length > 0 && currentIndex === results.length - 1;

  useEffect(() => {
    if (!hasStarted || results.length === 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsSecondPartVisible(true);
    }, 900);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [currentIndex, hasStarted, mode, results.length]);

  function resetReveal(nextMode = mode) {
    setMode(nextMode);
    setCurrentIndex(0);
    setHasStarted(false);
    setIsSecondPartVisible(false);
  }

  function showPreviousResult() {
    setIsSecondPartVisible(false);
    setCurrentIndex((index) => Math.max(0, index - 1));
  }

  function showNextResult() {
    setIsSecondPartVisible(false);
    setCurrentIndex((index) => Math.min(results.length - 1, index + 1));
  }

  if (results.length === 0) {
    return (
      <EmptyState
        title="아직 추첨 결과가 없어요"
        description="관리자가 추첨을 실행하면 이곳에 당첨자가 표시됩니다."
      />
    );
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-950">당첨 공개</h2>
          <p className="mt-1 text-sm text-slate-600">
            현재 공개 {hasStarted ? currentIndex + 1 : 0} / {results.length}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-[8px] border border-slate-200 bg-slate-50 p-1">
          {revealModes.map((revealMode) => (
            <button
              className={cx(
                "min-h-10 rounded-[6px] px-3 py-2 text-sm font-black transition focus:outline-none focus:ring-4 focus:ring-emerald-100",
                mode === revealMode.value
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-700 hover:bg-white",
              )}
              key={revealMode.value}
              onClick={() => resetReveal(revealMode.value)}
              type="button"
            >
              {revealMode.label}
            </button>
          ))}
        </div>
      </div>

      <section className="overflow-hidden rounded-[8px] border border-amber-200 bg-amber-50">
        <div className="border-b border-amber-200 bg-white/70 px-4 py-3">
          <p className="text-sm font-black text-amber-900">
            {hasStarted ? `${currentIndex + 1}번째 당첨` : "공개 대기"}
          </p>
        </div>
        <div className="grid min-h-80 content-center gap-4 p-5 text-center sm:p-8">
          {hasStarted && currentResult ? (
            <>
              <RevealPanel
                description={
                  mode === "prize-first"
                    ? currentResult.prizeDescription
                    : undefined
                }
                eyebrow={mode === "name-first" ? "당첨자" : "당첨 상품"}
                isVisible
                key={`primary-${currentResult.id}-${mode}`}
                title={
                  mode === "name-first"
                    ? currentResult.participantName
                    : currentResult.prizeName
                }
                tone={mode === "name-first" ? "emerald" : "slate"}
              />
              <RevealPanel
                description={
                  mode === "name-first"
                    ? currentResult.prizeDescription
                    : undefined
                }
                eyebrow={mode === "name-first" ? "당첨 상품" : "당첨자"}
                isVisible={isSecondPartVisible}
                key={`secondary-${currentResult.id}-${mode}`}
                title={
                  mode === "name-first"
                    ? currentResult.prizeName
                    : currentResult.participantName
                }
                tone={mode === "name-first" ? "slate" : "emerald"}
              />
            </>
          ) : (
            <div className="mx-auto max-w-xl">
              <p className="text-sm font-black text-amber-800">
                {mode === "name-first" ? "이름 먼저 공개" : "상품 먼저 공개"}
              </p>
              <p className="mt-3 text-4xl font-black text-slate-950 sm:text-6xl">
                당첨 공개 준비
              </p>
              <p className="mt-4 text-sm text-slate-600">
                시작 버튼을 누르면 첫 번째 당첨 결과부터 한 명씩 공개됩니다.
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
        <button
          className="min-h-12 rounded-[8px] bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={hasStarted}
          onClick={() => {
            setIsSecondPartVisible(false);
            setHasStarted(true);
          }}
          type="button"
        >
          공개 시작
        </button>
        <button
          className="min-h-12 rounded-[8px] border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
          disabled={!hasStarted || currentIndex === 0}
          onClick={showPreviousResult}
          type="button"
        >
          이전
        </button>
        <button
          className="min-h-12 rounded-[8px] border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
          disabled={!hasStarted || currentIndex === results.length - 1}
          onClick={showNextResult}
          type="button"
        >
          다음
        </button>
        <button
          className="min-h-12 rounded-[8px] border border-amber-300 bg-amber-100 px-5 py-3 text-sm font-black text-amber-900 transition hover:bg-amber-200 focus:outline-none focus:ring-4 focus:ring-amber-100"
          onClick={() => resetReveal()}
          type="button"
        >
          처음부터
        </button>
      </div>

      {isComplete && isSecondPartVisible ? (
        <p className="rounded-[8px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-bold text-emerald-800">
          모든 당첨 결과를 공개했습니다.
        </p>
      ) : null}
    </div>
  );
}

function RevealPanel({
  description,
  eyebrow,
  isVisible,
  title,
  tone,
}: {
  description?: string;
  eyebrow: string;
  isVisible: boolean;
  title: string;
  tone: "emerald" | "slate";
}) {
  return (
    <div
      className={cx(
        "mx-auto w-full max-w-2xl transform rounded-[8px] border bg-white p-5 shadow-sm transition duration-500 sm:p-6",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0",
        tone === "emerald" ? "border-emerald-200" : "border-slate-200",
      )}
    >
      <p
        className={cx(
          "text-sm font-black",
          tone === "emerald" ? "text-emerald-700" : "text-amber-800",
        )}
      >
        {eyebrow}
      </p>
      <p
        className={cx(
          "mt-2 break-keep text-4xl font-black leading-tight sm:text-6xl",
          tone === "emerald" ? "text-emerald-700" : "text-slate-950",
        )}
      >
        {title}
      </p>
      {description ? (
        <p className="mt-3 break-keep text-sm font-bold text-slate-500">
          {description}
        </p>
      ) : null}
    </div>
  );
}
