import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ResultsDashboard } from "@/components/results-dashboard";
import { Button } from "@/components/ui/button";
import { getAuditById } from "@/lib/audits";

export const dynamic = "force-dynamic";

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

function ResultsError({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-[#f7f4ef] text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between py-3">
          <Link href="/" className="flex items-center gap-2" aria-label="ModelMeter home">
            <span className="flex size-8 items-center justify-center rounded-lg border border-stone-200 bg-white text-sm font-semibold text-teal-800 shadow-sm">
              M
            </span>
            <span className="text-sm font-semibold tracking-tight">ModelMeter</span>
          </Link>
          <Button asChild variant="outline" className="bg-background">
            <Link href="/">
              <ArrowLeft className="size-4" />
              New audit
            </Link>
          </Button>
        </header>

        <section className="flex flex-1 items-center py-12">
          <div className="w-full rounded-3xl border border-stone-200 bg-white p-6 shadow-[0_24px_70px_rgba(87,83,78,0.14)] sm:p-8">
            <div className="mb-5 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">
              Report unavailable
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
              We could not load this audit.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-stone-500">
              {message}
            </p>
            <Button asChild className="mt-6 bg-teal-700 text-white hover:bg-teal-800">
              <Link href="/">Generate a new audit</Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { result, error } = await getAuditById(id);

  if (error) {
    return (
      <ResultsError message="The report URL may be invalid, or Supabase could not complete the request. Please check the link and try again." />
    );
  }

  if (!result) {
    return (
      <ResultsError message="No saved ModelMeter report exists for this link. It may have been removed or the URL may have been copied incorrectly." />
    );
  }

  return <ResultsDashboard auditResult={result} shareUrl={`${getBaseUrl()}/results/${id}`} />;
}
