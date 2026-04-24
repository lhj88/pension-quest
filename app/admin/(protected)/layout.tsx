import Link from "next/link";
import type { ReactNode } from "react";

import { logoutAdmin } from "@/app/admin/actions";
import { PageShell } from "@/components/ui";
import { requireAdmin } from "@/lib/admin-auth";

const navItems = [
  { href: "/admin/dashboard", label: "대시보드" },
  { href: "/admin/items", label: "QR 항목" },
  { href: "/admin/prizes", label: "상품" },
  { href: "/admin/draw", label: "추첨" },
  { href: "/admin/settings", label: "설정" },
  { href: "/admin/qr", label: "QR 출력" },
];

export default async function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();

  return (
    <PageShell>
      <header className="no-print mb-5 rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-emerald-700">Pension Quest</p>
            <h1 className="text-2xl font-black text-slate-950">관리자</h1>
          </div>
          <form action={logoutAdmin}>
            <button
              className="rounded-[8px] border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              type="submit"
            >
              로그아웃
            </button>
          </form>
        </div>
        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {navItems.map((item) => (
            <Link
              className="shrink-0 rounded-[8px] bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-emerald-100 hover:text-emerald-800"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </PageShell>
  );
}
