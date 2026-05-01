import { Card } from "@/components/ui";
import { getAllHuntItems } from "@/lib/data";

import { HuntItemOrderList, ItemForm } from "./hunt-item-order-list";

export const dynamic = "force-dynamic";

export default async function AdminItemsPage() {
  const items = await getAllHuntItems();

  return (
    <div className="grid gap-5">
      <Card>
        <h2 className="text-xl font-black text-slate-950">새 QR 항목</h2>
        <ItemForm />
      </Card>

      <HuntItemOrderList items={items} />
    </div>
  );
}
