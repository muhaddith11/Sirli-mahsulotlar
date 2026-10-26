import { cn } from "@/lib/cn";

export const adminInput =
  "h-11 w-full rounded-[var(--radius-field)] border border-line bg-white px-3.5 text-sm outline-none transition placeholder:text-ink-3 focus:border-brand focus:ring-4 focus:ring-brand/15";

export function Field({
  label,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-semibold text-brand">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-ink-3">{hint}</span>
      ) : null}
    </label>
  );
}

export function Toggle({ name, label, hint, defaultChecked }: { name: string; label: string; hint?: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-field)] p-2 hover:bg-page">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[var(--color-brand)]"
      />
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {hint && <span className="block text-xs text-ink-3">{hint}</span>}
      </span>
    </label>
  );
}
