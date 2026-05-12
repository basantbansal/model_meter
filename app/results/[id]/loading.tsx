export default function LoadingResults() {
  return (
    <main className="min-h-screen bg-[#f7f4ef] text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg border border-stone-200 bg-white text-sm font-semibold text-teal-800 shadow-sm">
              M
            </span>
            <span className="text-sm font-semibold tracking-tight">ModelMeter</span>
          </div>
          <div className="h-9 w-28 rounded-full border border-stone-200 bg-white" />
        </header>

        <section className="py-7 sm:py-10">
          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-[0_24px_70px_rgba(87,83,78,0.14)] sm:p-8">
            <div className="h-5 w-28 rounded-full bg-stone-100" />
            <div className="mt-5 h-20 max-w-2xl rounded-2xl bg-stone-100" />
            <div className="mt-4 h-4 max-w-xl rounded-full bg-stone-100" />
          </div>
        </section>

        <section className="grid gap-5 pb-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="h-96 rounded-2xl border border-stone-200 bg-white shadow-sm" />
          <div className="h-64 rounded-2xl border border-stone-200 bg-white shadow-sm" />
        </section>
      </div>
    </main>
  );
}
