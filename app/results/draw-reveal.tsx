"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { cx, EmptyState } from "@/components/ui";

import {
  getRevealNavigationIntent,
  shouldRevealSecondPartForKey,
} from "./reveal-flow";
import { requestRevealLayerFullscreen } from "./reveal-fullscreen";
import type { DrawRevealSlide, SpecialRevealSlide } from "./reveal-items";

type RevealMode = "name-first" | "prize-first";

type DrawRevealProps = {
  slides: DrawRevealSlide[];
};

const revealModes: Array<{ label: string; value: RevealMode }> = [
  { label: "이름 먼저", value: "name-first" },
  { label: "상품 먼저", value: "prize-first" },
];

export function DrawReveal({ slides }: DrawRevealProps) {
  const revealLayerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<RevealMode>("name-first");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isOpeningVisible, setIsOpeningVisible] = useState(false);
  const [isSecondPartVisible, setIsSecondPartVisible] = useState(false);

  const currentSlide = slides[currentIndex];
  const isShowingResult = hasStarted && !isOpeningVisible;
  const hasPrizeSlides = slides.some((slide) => slide.kind === "prize");
  const isPrizeSlide = currentSlide?.kind === "prize";
  const isCurrentSlideComplete =
    isShowingResult &&
    Boolean(currentSlide) &&
    (!isPrizeSlide || isSecondPartVisible);
  const canRevealSecondPart =
    isShowingResult &&
    Boolean(currentSlide) &&
    isPrizeSlide &&
    !isSecondPartVisible;
  const canAdvanceOpening = hasStarted && isOpeningVisible;
  const canShowPreviousResult = isShowingResult && currentIndex > 0;
  const canShowNextResult =
    canAdvanceOpening ||
    (isCurrentSlideComplete && currentIndex < slides.length - 1);
  const isComplete =
    isCurrentSlideComplete && currentIndex === slides.length - 1;

  useEffect(() => {
    if (!canRevealSecondPart) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (!shouldRevealSecondPartForKey(event.key)) {
        return;
      }

      event.preventDefault();
      setIsSecondPartVisible(true);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [canRevealSecondPart]);

  useEffect(() => {
    if (!hasStarted) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      const intent = getRevealNavigationIntent(event.key);

      if (intent === "next" && canAdvanceOpening) {
        event.preventDefault();
        setIsOpeningVisible(false);
        return;
      }

      if (intent === "previous" && currentIndex > 0) {
        event.preventDefault();
        setIsSecondPartVisible(false);
        setCurrentIndex((index) => Math.max(0, index - 1));
        return;
      }

      if (
        intent === "next" &&
        isCurrentSlideComplete &&
        currentIndex < slides.length - 1
      ) {
        event.preventDefault();
        setIsSecondPartVisible(false);
        setCurrentIndex((index) => Math.min(slides.length - 1, index + 1));
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    canAdvanceOpening,
    currentIndex,
    hasStarted,
    isCurrentSlideComplete,
    isSecondPartVisible,
    slides.length,
  ]);

  function revealSecondPart() {
    if (!canRevealSecondPart) {
      return;
    }

    setIsSecondPartVisible(true);
  }

  function handleRevealKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (!shouldRevealSecondPartForKey(event.key)) {
      return;
    }

    event.preventDefault();
    if (canAdvanceOpening) {
      setIsOpeningVisible(false);
      return;
    }

    revealSecondPart();
  }

  function resetReveal(nextMode = mode) {
    setMode(nextMode);
    setCurrentIndex(0);
    setHasStarted(false);
    setIsOpeningVisible(false);
    setIsSecondPartVisible(false);
  }

  function showPreviousResult() {
    setIsSecondPartVisible(false);
    setCurrentIndex((index) => Math.max(0, index - 1));
  }

  function showNextResult() {
    if (canAdvanceOpening) {
      setIsOpeningVisible(false);
      return;
    }

    if (!canShowNextResult) {
      return;
    }

    setIsSecondPartVisible(false);
    setCurrentIndex((index) => Math.min(slides.length - 1, index + 1));
  }

  function startReveal() {
    void requestRevealLayerFullscreen(revealLayerRef.current);
    setIsSecondPartVisible(false);
    setIsOpeningVisible(true);
    setHasStarted(true);
  }

  if (slides.length === 0) {
    return (
      <EmptyState
        title="아직 공개할 결과가 없어요"
        description="추첨 결과나 보너스/꽝 QR 기록이 생기면 이곳에 표시됩니다."
      />
    );
  }

  return (
    <div className="draw-reveal-layer grid gap-5 bg-white" ref={revealLayerRef}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-950">결과 공개</h2>
          <p className="mt-1 text-sm text-slate-600">
            현재 공개 {isShowingResult ? currentIndex + 1 : 0} /{" "}
            {slides.length}
          </p>
        </div>
        {hasPrizeSlides ? (
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
        ) : null}
      </div>

      <section
        aria-label={
          canRevealSecondPart
            ? "다음 공개 정보를 보여주기"
            : canAdvanceOpening
              ? "첫 결과로 이동하기"
            : "결과 공개 화면"
        }
        className={cx(
          "draw-reveal-stage reveal-stage overflow-hidden rounded-[8px] border border-amber-200 bg-amber-50",
          (canRevealSecondPart || canAdvanceOpening) &&
            "cursor-pointer transition hover:border-amber-300",
        )}
        data-celebrate={isCurrentSlideComplete ? "true" : "false"}
        key={
          hasStarted
            ? isOpeningVisible
              ? "opening"
              : currentSlide?.id
            : "waiting"
        }
        onClick={() => {
          if (canAdvanceOpening) {
            setIsOpeningVisible(false);
            return;
          }

          revealSecondPart();
        }}
        onKeyDown={handleRevealKeyDown}
        role={canRevealSecondPart || canAdvanceOpening ? "button" : undefined}
        tabIndex={canRevealSecondPart || canAdvanceOpening ? 0 : -1}
      >
        <div className="border-b border-amber-200 bg-white/70 px-4 py-3">
          <p className="text-sm font-black text-amber-900">
            {hasStarted && isOpeningVisible
              ? "결과 공개 준비"
              : hasStarted && currentSlide
              ? getSlideStageLabel(currentSlide, currentIndex)
              : "공개 대기"}
          </p>
        </div>
        <div className="draw-reveal-content grid min-h-80 content-center gap-4 p-5 text-center sm:p-8">
          {hasStarted && isOpeningVisible ? (
            <ResultsOpeningPanel />
          ) : hasStarted && currentSlide ? (
            currentSlide.kind === "prize" ? (
              <>
                <RevealPanel
                  description={
                    mode === "prize-first"
                      ? currentSlide.prizeDescription
                      : undefined
                  }
                  eyebrow={mode === "name-first" ? "당첨자" : "당첨 상품"}
                  isVisible
                  key={`primary-${currentSlide.id}-${mode}`}
                  title={
                    mode === "name-first"
                      ? currentSlide.participantName
                      : currentSlide.prizeName
                  }
                  tone={mode === "name-first" ? "emerald" : "slate"}
                />
                <RevealPanel
                  description={
                    mode === "name-first"
                      ? currentSlide.prizeDescription
                      : undefined
                  }
                  eyebrow={mode === "name-first" ? "당첨 상품" : "당첨자"}
                  isVisible={isSecondPartVisible}
                  key={`secondary-${currentSlide.id}-${mode}`}
                  title={
                    mode === "name-first"
                      ? currentSlide.prizeName
                      : currentSlide.participantName
                  }
                  tone={mode === "name-first" ? "slate" : "emerald"}
                />
                {!isSecondPartVisible ? (
                  <p className="text-sm font-bold text-amber-800">
                    클릭하거나 Space / Enter로 다음 정보를 공개하세요.
                  </p>
                ) : null}
              </>
            ) : (
              <SpecialGroupPanel slide={currentSlide} />
            )
          ) : (
            <div className="mx-auto max-w-xl">
              <p className="text-sm font-black text-amber-800">
                {hasPrizeSlides
                  ? mode === "name-first"
                    ? "이름 먼저 공개"
                    : "상품 먼저 공개"
                  : "특별 QR 공개"}
              </p>
              <p className="mt-3 text-4xl font-black text-slate-950 sm:text-6xl">
                공개 대기
              </p>
              <p className="mt-4 text-sm text-slate-600">
                시작 버튼을 누르면 상품 당첨, 꽝 QR, 보너스 QR 화면이
                차례대로 공개됩니다.
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="draw-reveal-controls grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
        <button
          className="min-h-12 rounded-[8px] bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={hasStarted}
          onClick={startReveal}
          type="button"
        >
          공개 시작
        </button>
        <button
          className="min-h-12 rounded-[8px] border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
          disabled={!canShowPreviousResult}
          onClick={showPreviousResult}
          type="button"
        >
          이전
        </button>
        <button
          className="min-h-12 rounded-[8px] border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
          disabled={!canShowNextResult}
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

      {isComplete ? (
        <p className="rounded-[8px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-bold text-emerald-800">
          모든 결과를 공개했습니다.
        </p>
      ) : null}
    </div>
  );
}

export function ResultsOpeningPanel() {
  return (
    <div className="mx-auto grid w-full max-w-5xl justify-items-center gap-3 sm:gap-4">
      <Image
        alt="유난히 내성적이었던 어릴 적 우리들"
        className="max-h-[min(74vh,52rem)] w-auto max-w-full rounded-[8px] bg-white object-contain shadow-sm"
        height={1402}
        priority
        src="/results-opening.png"
        width={1122}
      />
      <div>
        <p className="text-sm font-black text-amber-800">오프닝</p>
        <p className="mt-2 text-4xl font-black text-slate-950 sm:text-6xl">
          결과 공개 준비
        </p>
        <p className="mt-3 text-sm font-bold text-slate-600">
          다음으로 넘기면 첫 결과가 공개됩니다.
        </p>
      </div>
    </div>
  );
}

function getSlideStageLabel(slide: DrawRevealSlide, index: number): string {
  if (slide.kind === "prize") {
    return `${index + 1}번째 당첨`;
  }

  return slide.eyebrow;
}

function SpecialGroupPanel({ slide }: { slide: SpecialRevealSlide }) {
  const isBonus = slide.type === "bonus";

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-4">
      <div
        className={cx(
          "rounded-[8px] border bg-white p-5 shadow-sm sm:p-6",
          isBonus ? "border-amber-200" : "border-slate-200",
        )}
      >
        <p
          className={cx(
            "text-sm font-black",
            isBonus ? "text-amber-800" : "text-slate-600",
          )}
        >
          {slide.eyebrow}
        </p>
        <p
          className={cx(
            "reveal-title reveal-title-pop mt-2 break-keep text-4xl font-black leading-tight sm:text-6xl",
            isBonus ? "text-amber-700" : "text-slate-950",
          )}
        >
          {slide.title}
        </p>
        <p className="mt-3 break-keep text-sm font-bold text-slate-500">
          {slide.description}
        </p>
      </div>

      <div className="grid max-h-[min(42vh,24rem)] gap-2 overflow-y-auto pr-1 text-left">
        {slide.claims.map((claim) => (
          <div
            className="grid gap-2 rounded-[8px] border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_auto] sm:items-center"
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
            <p
              className={cx(
                "text-sm font-black sm:text-right",
                isBonus ? "text-amber-700" : "text-slate-600",
              )}
            >
              {isBonus && claim.tickets > 0
                ? `응모권 +${claim.tickets}장`
                : "응모권 없음"}
            </p>
          </div>
        ))}
      </div>
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
          "reveal-title mt-2 break-keep text-4xl font-black leading-tight sm:text-6xl",
          isVisible && "reveal-title-pop",
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
