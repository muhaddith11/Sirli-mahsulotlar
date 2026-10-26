import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Props = {
  title: string;
  href?: string;
  linkLabel?: string;
  as?: "h1" | "h2";
};

export function SectionHeading({ title, href, linkLabel, as: Tag = "h2" }: Props) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4 md:mb-4">
      <Tag className="text-xl font-bold tracking-[-0.02em] md:text-2xl">{title}</Tag>
      {href && linkLabel && (
        <Link
          href={href}
          className="-mr-1 inline-flex shrink-0 items-center gap-0.5 rounded-md px-1 py-1 text-sm font-medium text-ink-2 hover:text-brand"
        >
          {linkLabel}
          <ChevronRight className="size-4" />
        </Link>
      )}
    </div>
  );
}
