import QRCode from "qrcode";
import Image from "next/image";

import { Card } from "@/components/ui";
import { getAllHuntItems } from "@/lib/data";
import { getPublicAppUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function AdminQrPage() {
  const appUrl = getPublicAppUrl();
  const items = await getAllHuntItems();
  const cards = await Promise.all(
    items.map(async (item) => {
      const url = `${appUrl}/claim/${encodeURIComponent(item.code)}`;
      const qrDataUrl = await QRCode.toDataURL(url, {
        margin: 1,
        width: 320,
      });

      return { item, url, qrDataUrl };
    }),
  );

  return (
    <div className="grid gap-5">
      <Card className="no-print">
        <h2 className="text-xl font-black text-slate-950">QR 출력 카드</h2>
        <p className="mt-2 text-sm text-slate-600">
          브라우저 인쇄 기능으로 저장하거나 출력하세요. 출력 카드에는 QR과
          URL만 표시됩니다.
        </p>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ item, url, qrDataUrl }) => (
          <article
            className="break-inside-avoid rounded-[8px] border border-slate-300 bg-white p-4 text-center shadow-sm"
            key={item.id}
          >
            <Image
              alt="QR 코드"
              className="mx-auto size-52"
              height={208}
              unoptimized
              src={qrDataUrl}
              width={208}
            />
            <p className="mt-3 break-all font-mono text-xs text-slate-600">
              {url}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
