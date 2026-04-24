import { redirect } from "next/navigation";

import { loginAdmin } from "@/app/admin/actions";
import { Card, PageShell, PrimaryButton } from "@/components/ui";
import { isAdminSessionValid } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type AdminLoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  if (await isAdminSessionValid()) {
    redirect("/admin/dashboard");
  }

  const params = await searchParams;

  return (
    <PageShell>
      <div className="grid flex-1 content-center py-8">
        <Card className="mx-auto w-full max-w-md">
          <p className="text-sm font-bold text-emerald-700">관리자</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">
            운영자 로그인
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            `ADMIN_PASSWORD`로 설정한 비밀번호를 입력하세요.
          </p>
          {params.error ? (
            <p className="mt-4 rounded-[8px] bg-red-50 p-3 text-sm font-bold text-red-700">
              비밀번호를 확인해 주세요.
            </p>
          ) : null}
          <form action={loginAdmin} className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              비밀번호
              <input
                className="min-h-12 rounded-[8px] border border-slate-300 px-4 text-base outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                name="password"
                required
                type="password"
              />
            </label>
            <PrimaryButton>로그인</PrimaryButton>
          </form>
        </Card>
      </div>
    </PageShell>
  );
}
