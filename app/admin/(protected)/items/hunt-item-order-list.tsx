"use client";

import { useMemo, useState, type DragEvent } from "react";
import { useFormStatus } from "react-dom";

import {
  deleteHuntItem,
  reorderHuntItems,
  saveHuntItem,
} from "@/app/admin/actions";
import {
  Card,
  cx,
  PrimaryButton,
  TextArea,
  TextInput,
  TypeBadge,
} from "@/components/ui";
import { huntItemDeleteWarning } from "@/lib/delete-warnings";
import { reorderHuntItemIds } from "@/lib/hunt-item-order";
import type { HuntItem, HuntItemType } from "@/types/domain";

type HuntItemOrderListProps = {
  items: HuntItem[];
};

const itemTypes: Array<{ value: HuntItemType; label: string }> = [
  { value: "normal", label: "일반" },
  { value: "bonus", label: "보너스" },
  { value: "blank", label: "꽝" },
  { value: "mission", label: "장난" },
];

export function HuntItemOrderList({ items }: HuntItemOrderListProps) {
  const [orderedItems, setOrderedItems] = useState(items);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const orderedIds = useMemo(
    () => orderedItems.map((item) => item.id),
    [orderedItems],
  );
  const originalIds = useMemo(() => items.map((item) => item.id), [items]);
  const hasOrderChanges = orderedIds.join(",") !== originalIds.join(",");

  function applyOrder(nextIds: string[]) {
    const itemById = new Map(orderedItems.map((item) => [item.id, item]));
    setOrderedItems(
      nextIds
        .map((id) => itemById.get(id))
        .filter((item): item is HuntItem => Boolean(item)),
    );
  }

  function moveItem(activeId: string, overId: string) {
    applyOrder(reorderHuntItemIds(orderedIds, { activeId, overId }));
  }

  function moveItemByIndex(index: number, nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= orderedItems.length) {
      return;
    }

    const nextItems = [...orderedItems];
    const [activeItem] = nextItems.splice(index, 1);
    nextItems.splice(nextIndex, 0, activeItem);
    setOrderedItems(nextItems);
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
    moveItem(activeId, overId);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDropTargetId(null);
  }

  if (orderedItems.length === 0) {
    return (
      <Card className="text-center">
        <p className="font-bold text-slate-800">QR 항목이 아직 없습니다</p>
        <p className="mt-2 text-sm text-slate-500">
          위 폼에서 QR 항목을 만들면 출력 순서를 조정할 수 있어요.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      <form
        action={reorderHuntItems}
        className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-slate-200 bg-slate-50 p-3"
      >
        <input
          name="ordered_ids"
          type="hidden"
          value={JSON.stringify(orderedIds)}
        />
        <p className="text-sm font-bold text-slate-700">
          위/아래 버튼이나 드래그로 QR 출력 순서를 정하세요.
        </p>
        <SaveOrderButton disabled={!hasOrderChanges} />
      </form>

      {orderedItems.map((item, index) => (
        <div
          key={item.id}
          onDragEnter={(event) => handleDragEnter(event, item.id)}
          onDragOver={handleDragOver}
          onDrop={handleDragEnd}
        >
          <Card
            className={cx(
              "transition",
              draggingId === item.id && "opacity-60",
              dropTargetId === item.id && "border-emerald-300 bg-emerald-50",
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex gap-3">
                <button
                  aria-label={`${item.title} 순서 이동`}
                  className="mt-0.5 inline-flex min-h-10 min-w-10 cursor-grab items-center justify-center rounded-[8px] border border-slate-300 bg-white text-sm font-black text-slate-600 hover:bg-slate-50 active:cursor-grabbing"
                  draggable
                  onDragEnd={handleDragEnd}
                  onDragStart={(event) => handleDragStart(event, item.id)}
                  title="드래그해서 순서 변경"
                  type="button"
                >
                  이동
                </button>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <TypeBadge type={item.type} />
                    <span className="text-xs font-bold text-slate-500">
                      {item.code}
                    </span>
                  </div>
                  <h3 className="mt-1 text-lg font-black text-slate-950">
                    {item.title}
                  </h3>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  aria-label={`${item.title} 위로 이동`}
                  className="min-h-9 rounded-[8px] border border-slate-300 bg-white px-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                  disabled={index === 0}
                  onClick={() => moveItemByIndex(index, index - 1)}
                  title="위로 이동"
                  type="button"
                >
                  ↑
                </button>
                <button
                  aria-label={`${item.title} 아래로 이동`}
                  className="min-h-9 rounded-[8px] border border-slate-300 bg-white px-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                  disabled={index === orderedItems.length - 1}
                  onClick={() => moveItemByIndex(index, index + 1)}
                  title="아래로 이동"
                  type="button"
                >
                  ↓
                </button>
                <p className="text-sm font-bold text-slate-600">
                  출력 순서 {index + 1} · 응모권 {item.tickets}장 ·{" "}
                  {item.is_active ? "활성" : "비활성"}
                </p>
              </div>
            </div>
            <ItemForm item={item} />
            <DeleteItemForm item={item} />
          </Card>
        </div>
      ))}
    </div>
  );
}

export function ItemForm({
  item,
}: {
  item?: HuntItem;
}) {
  return (
    <form action={saveHuntItem} className="mt-4 grid gap-4">
      {item ? <input name="id" type="hidden" value={item.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          defaultValue={item?.code}
          label="QR 코드"
          name="code"
          placeholder="예: PENSION-011"
          required
        />
        <TextInput
          defaultValue={item?.title}
          label="제목"
          name="title"
          placeholder="보물 이름"
          required
        />
      </div>
      <TextArea
        defaultValue={item?.description}
        label="설명 / 힌트 / 장난"
        name="description"
      />
      <div className="grid gap-4 sm:grid-cols-4">
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          타입
          <select
            className="min-h-11 rounded-[8px] border border-slate-300 bg-white px-3 py-2 text-base"
            defaultValue={item?.type ?? "normal"}
            name="type"
          >
            {itemTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
        <TextInput
          defaultValue={item?.points ?? 0}
          label="점수"
          name="points"
          type="number"
        />
        <TextInput
          defaultValue={item?.tickets ?? 1}
          label="응모권"
          name="tickets"
          type="number"
        />
        <TextInput
          defaultValue={item?.sort_order ?? 0}
          label="정렬"
          name="sort_order"
          type="number"
        />
      </div>
      <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
        <input
          className="size-4 accent-emerald-600"
          defaultChecked={item?.is_active ?? true}
          name="is_active"
          type="checkbox"
        />
        활성화
      </label>
      <PrimaryButton className="sm:w-fit">
        {item ? "항목 저장" : "항목 만들기"}
      </PrimaryButton>
    </form>
  );
}

function DeleteItemForm({ item }: { item: HuntItem }) {
  return (
    <form
      action={deleteHuntItem}
      className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4"
    >
      <input name="id" type="hidden" value={item.id} />
      <p className="text-xs font-semibold leading-5 text-slate-500">
        {huntItemDeleteWarning}
      </p>
      <DeleteButton />
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

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex min-h-10 items-center justify-center rounded-[8px] border border-red-200 bg-red-50 px-4 py-2 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
      disabled={pending}
      type="submit"
    >
      {pending ? "삭제 중" : "삭제"}
    </button>
  );
}
