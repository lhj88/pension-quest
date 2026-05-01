"use client";

export function CloseClaimButton() {
  return (
    <button
      className="claim-close-reveal inline-flex min-h-12 items-center justify-center rounded-[8px] bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
      onClick={() => {
        window.close();

        window.setTimeout(() => {
          if (!window.closed) {
            window.location.assign("/");
          }
        }, 120);
      }}
      type="button"
    >
      닫기
    </button>
  );
}
