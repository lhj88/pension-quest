import { savePrize } from "@/app/admin/actions";
import { Card, PrimaryButton, TextArea, TextInput } from "@/components/ui";
import { getPrizes } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminPrizesPage() {
  const prizes = await getPrizes();

  return (
    <div className="grid gap-5">
      <Card>
        <h2 className="text-xl font-black text-slate-950">새 상품</h2>
        <PrizeForm />
      </Card>

      <div className="grid gap-3">
        {prizes.map((prize) => (
          <Card key={prize.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-slate-950">
                  {prize.name}
                </h3>
                <p className="text-sm text-slate-600">{prize.description}</p>
              </div>
              <p className="text-sm font-bold text-slate-600">
                {prize.quantity}개 · {prize.is_active ? "활성" : "비활성"}
              </p>
            </div>
            <PrizeForm prize={prize} />
          </Card>
        ))}
      </div>
    </div>
  );
}

function PrizeForm({
  prize,
}: {
  prize?: {
    id: string;
    name: string;
    description: string;
    quantity: number;
    is_active: boolean;
  };
}) {
  return (
    <form action={savePrize} className="mt-4 grid gap-4">
      {prize ? <input name="id" type="hidden" value={prize.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
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
