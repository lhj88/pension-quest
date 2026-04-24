import { updateSettings } from "@/app/admin/actions";
import { Card, PrimaryButton, StatusBadge } from "@/components/ui";
import { getAppConfig } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const config = await getAppConfig();

  return (
    <div className="grid gap-5">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-950">게임 설정</h2>
            <p className="mt-1 text-sm text-slate-600">
              QR 획득 가능 상태와 추첨 기본 옵션을 관리합니다.
            </p>
          </div>
          <StatusBadge status={config.game_status} />
        </div>

        <form action={updateSettings} className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            게임 상태
            <select
              className="min-h-11 rounded-[8px] border border-slate-300 bg-white px-3 py-2 text-base"
              defaultValue={config.game_status}
              name="game_status"
            >
              <option value="open">진행중 - QR 획득 허용</option>
              <option value="locked">잠금 - QR 획득 중지</option>
              <option value="draw">추첨 완료 - 결과 공개</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <input
              className="size-4 accent-emerald-600"
              defaultChecked={config.allow_duplicate_winners}
              name="allow_duplicate_winners"
              type="checkbox"
            />
            기본값: 중복 당첨 허용
          </label>
          <PrimaryButton className="sm:w-fit">설정 저장</PrimaryButton>
        </form>
      </Card>
    </div>
  );
}
