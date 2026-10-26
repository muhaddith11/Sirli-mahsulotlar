import { Store, Truck, Wallet } from "lucide-react";
import type { Dictionary } from "@/i18n";

/** Yetkazib berish, olib ketish va to'lov — faqat tasdiqlangan faktlar */
export function ServiceStrip({ t }: { t: Dictionary }) {
  const items = [
    { icon: Truck, title: t.home.deliveryTitle, text: t.home.deliveryText },
    { icon: Store, title: t.home.pickupTitle, text: t.home.pickupText },
    { icon: Wallet, title: t.home.payTitle, text: t.home.payText },
  ];

  return (
    <ul className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-3 md:gap-0 md:divide-x md:divide-line md:overflow-visible md:rounded-[var(--radius-card)] md:bg-surface md:px-0 md:py-4">
      {items.map(({ icon: Icon, title, text }) => (
        <li
          key={title}
          className="flex shrink-0 items-center gap-3 rounded-[var(--radius-card)] bg-surface py-3 pl-3 pr-4 md:rounded-none md:bg-transparent md:px-6 md:py-0"
        >
          <Icon className="size-6 shrink-0 text-brand" strokeWidth={1.75} />
          <span>
            <span className="block whitespace-nowrap text-sm font-semibold leading-tight">{title}</span>
            <span className="block whitespace-nowrap text-xs text-ink-2">{text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
