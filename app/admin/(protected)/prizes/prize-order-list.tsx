"use client";

import { useMemo, useState, type DragEvent } from "react";
import { useFormStatus } from "react-dom";

import { reorderPrizes, savePrize } from "@/app/admin/actions";
import {
  Card,
  cx,
  PrimaryButton,
  TextArea,
  TextInput,
} from "@/components/ui";
import { reorderPrizeIds } from "@/lib/prize-order";
import type { Prize } from "@/types/domain";

type PrizeOrderListProps = {
  prizes: Prize[];
};

export function PrizeOrderList({ prizes }: PrizeOrderListProps) {
  const [orderedPrizes, setOrderedPrizes] = useState(prizes);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const orderedIds = useMemo(
    () => orderedPrizes.map((prize) => prize.id),
    [orderedPrizes],
  );
  const originalIds = useMemo(() => prizes.map((prize) => prize.id), [prizes]);
  const hasOrderChanges = orderedIds.join(",") !== originalIds.join(",");

  function applyOrder(nextIds: string[]) {
    const prizeById = new Map(orderedPrizes.map((prize) => [prize.id, prize]));
    setOrderedPrizes(
      nextIds
        .map((id) => prizeById.get(id))
        .filter((prize): prize is Prize => Boolean(prize)),
    );
  }

  function movePrize(activeId: string, overId: string) {
    applyOrder(reorderPrizeIds(orderedIds, { activeId, overId }));
  }

  function movePrizeByIndex(index: number, nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= orderedPrizes.length) {
      return;
    }

    const nextPrizes = [...orderedPrizes];
    const [activePrize] = nextPrizes.splice(index, 1);
    nextPrizes.splice(nextIndex, 0, activePrize);
    setOrderedPrizes(nextPrizes);
  }

  function handleDragStart(event: DragEvent<HTMLButtonElement>, id: string) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
    setDraggingId(id);
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>, overId: string) {
    event.preventDefault();
    const activeId = draggingId ?? event.dataTransfer.getData("text/plain");

    if (!activeId || activeId === overId || dropTargetId === overId) {
      return;
    }

    setDropTargetId(overId);
    movePrize(activeId, overId);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDropTargetId(null);
  }

  if (orderedPrizes.length === 0) {
    return (
      <Card className="text-center">
        <p className="font-bold text-slate-800">상품이 아직 없습니다</p>
        <p className="mt-2 text-sm text-slate-500">
          위 폼에서 상품을 만들면 추첨 순서를 조정할 수 있어요.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      <form
        action={reorderPrizes}
        className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-slate-200 bg-slate-50 p-3"
      >
        <input
          name="ordered_ids"
          type="hidden"
          value={JSON.stringify(orderedIds)}
        />
        <p className="text-sm font-bold text-slate-700">
          위/아래 버튼이나 드래그로 당첨 공개 순서를 정하세요.
        </p>
        <SaveOrderButton disabled={!hasOrderChanges} />
      </form>

      {orderedPrizes.map((prize, index) => (
        <div
          key={prize.id}
          onDragEnter={(event) => handleDragEnter(event, prize.id)}
          onDragOver={handleDragOver}
          onDrop={handleDragEnd}
        >
          <Card
            className={cx(
              "transition",
              draggingId === prize.id && "opacity-60",
              dropTargetId === prize.id && "border-emerald-300 bg-emerald-50",
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex gap-3">
                <button
                  aria-label={`${prize.name} 순서 이동`}
                  className="mt-0.5 inline-flex min-h-10 min-w-10 cursor-grab items-center justify-center rounded-[8px] border border-slate-300 bg-white text-sm font-black text-slate-600 hover:bg-slate-50 active:cursor-grabbing"
                  draggable
                  onDragEnd={handleDragEnd}
                  onDragStart={(event) => handleDragStart(event, prize.id)}
                  title="드래그해서 순서 변경"
                  type="button"
                >
                  이동
                </button>
                <div>
                  <h3 className="text-lg font-black text-slate-950">
                    {prize.name}
                  </h3>
                  <p className="text-sm text-slate-600">{prize.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  aria-label={`${prize.name} 위로 이동`}
                  className="min-h-9 rounded-[8px] border border-slate-300 bg-white px-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                  disabled={index === 0}
                  onClick={() => movePrizeByIndex(index, index - 1)}
                  title="위로 이동"
                  type="button"
                >
                  ↑
                </button>
                <button
                  aria-label={`${prize.name} 아래로 이동`}
                  className="min-h-9 rounded-[8px] border border-slate-300 bg-white px-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                  disabled={index === orderedPrizes.length - 1}
                  onClick={() => movePrizeByIndex(index, index + 1)}
                  title="아래로 이동"
                  type="button"
                >
                  ↓
                </button>
                <p className="text-sm font-bold text-slate-600">
                  공개 순서 {index + 1} · {prize.quantity}개 ·{" "}
                  {prize.is_active ? "활성" : "비활성"}
                </p>
              </div>
            </div>
            <PrizeForm prize={prize} />
          </Card>
        </div>
      ))}
    </div>
  );
}

export function PrizeForm({
  defaultSortOrder = 10,
  prize,
}: {
  defaultSortOrder?: number;
  prize?: Prize;
}) {
  return (
    <form action={savePrize} className="mt-4 grid gap-4">
      {prize ? <input name="id" type="hidden" value={prize.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-[1fr_140px_140px]">
        <TextInput
          defaultValue={prize?.name}
          label="상품명"
          name="name"
          placeholder="예: 1등 상품"
          required
        />
        <TextInput
          defaultValue={prize?.quantity ?? 1}
          label="수량"
          name="quantity"
          type="number"
        />
        <TextInput
          defaultValue={prize?.sort_order ?? defaultSortOrder}
          label="순서값"
          name="sort_order"
          type="number"
        />
      </div>
      <TextArea
        defaultValue={prize?.description}
        label="설명"
        name="description"
      />
      <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
        <input
          className="size-4 accent-emerald-600"
          defaultChecked={prize?.is_active ?? true}
          name="is_active"
          type="checkbox"
        />
        활성화
      </label>
      <PrimaryButton className="sm:w-fit">
        {prize ? "상품 저장" : "상품 만들기"}
      </PrimaryButton>
    </form>
  );
}

function SaveOrderButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex min-h-11 items-center justify-center rounded-[8px] bg-slate-950 px-4 py-2 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      disabled={disabled || pending}
      type="submit"
    >
      {pending ? "저장 중" : "순서 저장"}
    </button>
  );
}
