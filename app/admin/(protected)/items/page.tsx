import { saveHuntItem } from "@/app/admin/actions";
import { Card, PrimaryButton, TextArea, TextInput, TypeBadge } from "@/components/ui";
import { getAllHuntItems } from "@/lib/data";
import type { HuntItemType } from "@/types/domain";

export const dynamic = "force-dynamic";

const itemTypes: Array<{ value: HuntItemType; label: string }> = [
  { value: "normal", label: "일반" },
  { value: "bonus", label: "보너스" },
  { value: "blank", label: "꽝" },
  { value: "mission", label: "미션" },
];

export default async function AdminItemsPage() {
  const items = await getAllHuntItems();

  return (
    <div className="grid gap-5">
      <Card>
        <h2 className="text-xl font-black text-slate-950">새 QR 항목</h2>
        <ItemForm />
      </Card>

      <div className="grid gap-3">
        {items.map((item) => (
          <Card className="grid gap-4" key={item.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <TypeBadge type={item.type} />
                  <span className="text-xs font-bold text-slate-500">
                    {item.code}
                  </span>
                </div>
                <h3 className="mt-1 text-lg font-black text-slate-950">
                  {item.title}
                </h3>
              </div>
              <span className="text-sm font-bold text-slate-600">
                {item.is_active ? "활성" : "비활성"}
              </span>
            </div>
            <ItemForm item={item} />
          </Card>
        ))}
      </div>
    </div>
  );
}

function ItemForm({
  item,
}: {
  item?: {
    id: string;
    code: string;
    title: string;
    description: string;
    type: HuntItemType;
    points: number;
    tickets: number;
    is_active: boolean;
    sort_order: number;
  };
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
        label="설명 / 힌트 / 미션"
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
          defaultValue={item?.points ?? 10}
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
