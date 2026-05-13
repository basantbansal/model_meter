import Link from "next/link";

import { AuditForm } from "@/components/audit-form";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f4ef] text-foreground">
      <div className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between py-3">
          <Link href="/" className="flex items-center gap-2" aria-label="ModelMeter home">
            <span className="flex size-8 items-center justify-center rounded-lg border border-stone-200 bg-white text-sm font-semibold text-teal-800 shadow-sm">
              M
            </span>
            <span className="text-sm font-semibold tracking-tight">ModelMeter</span>
          </Link>

          <span className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            Shareable reports
          </span>
        </header>

        <section className="py-9 sm:py-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center rounded-full border border-teal-100 bg-white/80 px-3 py-1.5 text-xs font-medium text-teal-800 shadow-sm">
              Spend audit for teams using AI every day
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
              Find hidden waste in your AI stack.
            </h1>
            <div className="mx-auto mt-6 grid max-w-xl grid-cols-3 gap-2 text-sm">
              {["Seat overlap", "Plan fit", "API spend"].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-stone-200 bg-white/75 px-3 py-2.5 text-stone-600 shadow-sm"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-3xl">
            <AuditForm />
          </div>
        </section>
      </div>
    </main>
  );
}
