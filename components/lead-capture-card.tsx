"use client";

import { useState } from "react";
import { MailCheck, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { fieldClass } from "@/components/tool-card";

type SubmitState = "idle" | "submitting" | "sent" | "saved" | "error";

export function LeadCaptureCard({
  auditId,
  teamSize,
  monthlySavings,
}: {
  auditId: string;
  teamSize: number;
  monthlySavings: number;
}) {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [submittedTeamSize, setSubmittedTeamSize] = useState(String(teamSize));
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setMessage("");

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auditId,
        email,
        companyName,
        role,
        teamSize: submittedTeamSize,
        website,
      }),
    }).catch(() => null);

    if (!response?.ok) {
      const payload = response
        ? ((await response.json().catch(() => null)) as { error?: string } | null)
        : null;
      setState("error");
      setMessage(payload?.error ?? "We could not save this contact right now.");
      return;
    }

    const payload = (await response.json()) as {
      emailStatus?: "sent" | "skipped" | "failed";
      emailMessage?: string;
      emailDebug?: string;
    };

    if (payload.emailStatus === "sent") {
      setState("sent");
      setMessage("Saved. A confirmation email is on the way.");
      return;
    }

    setState("saved");
    setMessage(
      payload.emailMessage ??
        "Saved. The report link is ready to share, but no confirmation email was sent.",
    );
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
        <MailCheck className="size-5" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight">Keep this report handy</h2>
      <p className="mt-2 text-sm leading-6 text-stone-500">
        {monthlySavings < 100
          ? "Add an email and we will keep you posted when new optimizations apply to this stack."
          : "Add an email to capture the audit and receive the shareable report link."}
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-stone-500">Email</span>
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={fieldClass}
            placeholder="you@company.com"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-stone-500">Company</span>
            <input
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              className={fieldClass}
              placeholder="Acme"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-stone-500">Role</span>
            <input
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className={fieldClass}
              placeholder="Finance lead"
            />
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-stone-500">Team size</span>
          <input
            type="number"
            min="1"
            inputMode="numeric"
            value={submittedTeamSize}
            onChange={(event) => setSubmittedTeamSize(event.target.value)}
            className={fieldClass}
          />
        </label>

        <label className="sr-only" aria-hidden="true">
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </label>

        <Button
          type="submit"
          disabled={state === "submitting" || state === "sent" || state === "saved"}
          className="h-11 w-full bg-teal-700 text-white hover:bg-teal-800"
        >
          <Send className="size-4" />
          {state === "submitting"
            ? "Saving..."
            : state === "sent" || state === "saved"
              ? "Report captured"
              : "Email report link"}
        </Button>
      </form>

      {message ? (
        <p
          className={`mt-3 text-xs font-medium ${
            state === "error" ? "text-red-600" : "text-teal-700"
          }`}
          role="status"
        >
          {message}
          {state === "saved" && message.includes("not configured")
            ? " Add RESEND_API_KEY to enable email delivery."
            : null}
        </p>
      ) : null}
    </section>
  );
}
