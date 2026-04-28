import { resetParticipants, updateSettings } from "@/app/admin/actions";
import { Card, PrimaryButton, StatusBadge } from "@/components/ui";
import { getAppConfig } from "@/lib/data";

export const dynamic = "force-dynamic";

type AdminSettingsPageProps = {
  searchParams: Promise<{ reset?: string }>;
};

export default async function AdminSettingsPage({
  searchParams,
}: AdminSettingsPageProps) {
  const [config, params] = await Promise.all([getAppConfig(), searchParams]);

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

      <Card className="border-red-200 bg-red-50">
        <h2 className="text-xl font-black text-red-950">참가자 초기화</h2>
        <p className="mt-2 text-sm leading-6 text-red-800">
          테스트나 새 게임 시작 전에 참가자, QR 획득 기록, 추첨 결과를 모두 삭제합니다.
          QR 항목, 상품, 상품 순서, 관리자 설정은 유지하고 게임 상태는 진행중으로 되돌립니다.
        </p>

        {params.reset === "done" ? (
          <p className="mt-4 rounded-[8px] bg-white p-3 text-sm font-bold text-emerald-700">
            참가자 기록을 초기화했습니다.
          </p>
        ) : null}

        {params.reset === "confirm" ? (
          <p className="mt-4 rounded-[8px] bg-white p-3 text-sm font-bold text-red-700">
            초기화하려면 입력칸에 정확히 “초기화”라고 입력해 주세요.
          </p>
        ) : null}

        <form action={resetParticipants} className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm font-bold text-red-900">
            확인 문구
            <input
              autoComplete="off"
              className="min-h-11 rounded-[8px] border border-red-300 bg-white px-3 py-2 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
              name="confirmation"
              placeholder="초기화"
            />
          </label>
          <button
            className="min-h-12 rounded-[8px] bg-red-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 sm:w-fit"
            type="submit"
          >
            참가자 기록 초기화
          </button>
        </form>
      </Card>
    </div>
  );
}
