import { Card } from "@/components/ui";
import { getPrizes } from "@/lib/data";

import { PrizeForm, PrizeOrderList } from "./prize-order-list";

export const dynamic = "force-dynamic";

export default async function AdminPrizesPage() {
  const prizes = await getPrizes();
  const nextSortOrder =
    prizes.length > 0
      ? Math.max(...prizes.map((prize) => prize.sort_order)) + 10
      : 10;

  return (
    <div className="grid gap-5">
      <Card>
        <h2 className="text-xl font-black text-slate-950">새 상품</h2>
        <PrizeForm defaultSortOrder={nextSortOrder} />
      </Card>

      <PrizeOrderList
        key={prizes
          .map((prize) => `${prize.id}:${prize.sort_order}`)
          .join("|")}
        prizes={prizes}
      />
    </div>
  );
}
