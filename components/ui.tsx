import type { ReactNode } from "react";

import { gameStatusLabel, itemTypeLabel } from "@/lib/labels";
import type { GameStatus, HuntItemType } from "@/types/domain";

export function cx(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-5 py-6 sm:px-8">
      {children}
    </main>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cx(
        "rounded-[8px] border border-slate-200 bg-white/90 p-5 shadow-sm",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <Card className="p-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </Card>
  );
}

export function PrimaryButton({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      className={cx(
        "inline-flex min-h-12 items-center justify-center rounded-[8px] bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200",
        className,
      )}
      type="submit"
    >
      {children}
    </button>
  );
}

export function SecondaryLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      className={cx(
        "inline-flex min-h-11 items-center justify-center rounded-[8px] border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-slate-50",
        className,
      )}
      href={href}
    >
      {children}
    </a>
  );
}

export function TextInput({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <input
        className="min-h-11 rounded-[8px] border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        defaultValue={defaultValue}
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
      />
    </label>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <textarea
        className="min-h-24 rounded-[8px] border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        defaultValue={defaultValue}
        name={name}
        placeholder={placeholder}
      />
    </label>
  );
}

export function TypeBadge({ type }: { type: HuntItemType }) {
  const className: Record<HuntItemType, string> = {
    normal: "bg-sky-100 text-sky-800",
    bonus: "bg-amber-100 text-amber-900",
    blank: "bg-slate-100 text-slate-700",
    mission: "bg-fuchsia-100 text-fuchsia-800",
  };

  return (
    <span
      className={cx(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
        className[type],
      )}
    >
      {itemTypeLabel(type)}
    </span>
  );
}

export function StatusBadge({ status }: { status: GameStatus }) {
  const className: Record<GameStatus, string> = {
    open: "bg-emerald-100 text-emerald-800",
    locked: "bg-orange-100 text-orange-800",
    draw: "bg-indigo-100 text-indigo-800",
  };

  return (
    <span
      className={cx(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
        className[status],
      )}
    >
      {gameStatusLabel(status)}
    </span>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[8px] border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <p className="font-bold text-slate-800">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}
