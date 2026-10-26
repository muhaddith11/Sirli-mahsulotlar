/** Sahifa yuklanayotganda: mahsulot panjarasi shaklidagi skelet */
export default function ShopLoading() {
  return (
    <div className="animate-pulse pb-6 pt-4 md:pt-6" aria-busy="true">
      <div className="mb-5 h-8 w-48 rounded-lg bg-line" />
      <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:gap-x-4 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i}>
            <div className="aspect-[4/5] rounded-[var(--radius-card)] bg-line" />
            <div className="mt-3 h-4 w-2/3 rounded bg-line" />
            <div className="mt-2 h-3 w-full rounded bg-line/70" />
            <div className="mt-3 h-9 rounded-[var(--radius-field)] bg-line/70" />
          </div>
        ))}
      </div>
    </div>
  );
}
