import QRCode from "qrcode";
import Image from "next/image";

import { Card, TypeBadge } from "@/components/ui";
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
          브라우저 인쇄 기능으로 저장하거나 출력하세요. 기준 URL은
          `NEXT_PUBLIC_APP_URL`입니다.
        </p>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ item, url, qrDataUrl }) => (
          <article
            className="break-inside-avoid rounded-[8px] border border-slate-300 bg-white p-4 text-center shadow-sm"
            key={item.id}
          >
            <Image
              alt={`${item.title} QR`}
              className="mx-auto size-52"
              height={208}
              unoptimized
              src={qrDataUrl}
              width={208}
            />
            <div className="mt-3 flex justify-center">
              <TypeBadge type={item.type} />
            </div>
            <h3 className="mt-2 text-lg font-black text-slate-950">
              {item.title}
            </h3>
            <p className="mt-1 text-xs font-mono text-slate-500">{item.code}</p>
            <p className="mt-2 break-all text-xs text-slate-500">{url}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
