import type { Metadata } from "next";
import { PromoCreateForm, PromoRowActions } from "@/components/admin/promo-manager";
import { Card, EmptyState, PageHeader } from "@/components/admin/ui";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Promokodlar" };

const dateFormat = new Intl.DateTimeFormat("ru-RU", { timeZone: "Asia/Tashkent", day: "2-digit", month: "2-digit", year: "numeric" });

export default async function PromoPage() {
  const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });
  const now = new Date();

  return (
    <>
      <PageHeader title="Promokodlar" description="Mijoz buyurtma berishda kodni kiritadi; chegirma mahsulotlar summasidan olinadi" />

      <Card className="mb-6 p-5">
        <h2 className="mb-4 font-bold">Yangi promokod</h2>
        <PromoCreateForm />
      </Card>

      {promos.length === 0 ? (
        <EmptyState>Hali promokodlar yo&apos;q</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-card)] bg-surface ring-1 ring-line">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold text-ink-3">
                <th className="px-4 py-3">Kod</th>
                <th className="px-4 py-3">Chegirma</th>
                <th className="px-4 py-3">Shart</th>
                <th className="px-4 py-3">Ishlatilgan</th>
                <th className="px-4 py-3">Muddat</th>
                <th className="px-4 py-3">Holat</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {promos.map((promo) => {
                const expired = (promo.endsAt && promo.endsAt < now) || (promo.maxUses != null && promo.usedCount >= promo.maxUses);
                const scheduled = promo.startsAt && promo.startsAt > now;
                const state = !promo.isActive ? "O'chirilgan" : expired ? "Tugagan" : scheduled ? "Kutilmoqda" : "Faol";
                const tone = !promo.isActive || expired ? "bg-page text-ink-3" : scheduled ? "bg-info-soft text-info" : "bg-success-soft text-success";
                return (
                  <tr key={promo.id}>
                    <td className="px-4 py-3 font-mono text-[13px] font-semibold">{promo.code}</td>
                    <td className="px-4 py-3 font-semibold tabular">
                      {promo.type === "PERCENT" ? `${promo.value}%` : formatPrice(promo.value)}
                    </td>
                    <td className="px-4 py-3 text-ink-2 tabular">{promo.minOrder ? `${formatPrice(promo.minOrder)} dan` : "—"}</td>
                    <td className="px-4 py-3 tabular">
                      {promo.usedCount}
                      {promo.maxUses != null && <span className="text-ink-3"> / {promo.maxUses}</span>}
                    </td>
                    <td className="px-4 py-3 text-ink-2 tabular">
                      {promo.startsAt || promo.endsAt
                        ? `${promo.startsAt ? dateFormat.format(promo.startsAt) : "…"} — ${promo.endsAt ? dateFormat.format(promo.endsAt) : "…"}`
                        : "Cheksiz"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-md px-2 py-0.5 text-xs font-semibold", tone)}>{state}</span>
                    </td>
                    <td className="px-4 py-3">
                      <PromoRowActions id={promo.id} code={promo.code} isActive={promo.isActive} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
