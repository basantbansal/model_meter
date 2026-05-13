# Architecture

ModelMeter is a small Next.js SaaS-style utility. The core path is: collect spend inputs, run deterministic audit rules, save the report, and make it easy to share or export.

## Build Process Disclosure

The repository was built primarily with iterative AI pair-programming. The candidate supplied the assignment context, product constraints, review feedback, real error messages, and final direction. AI assistance generated or edited most implementation and documentation files across multiple review and correction passes.

This does not change the runtime architecture: the audit engine itself is deterministic TypeScript, and the optional LLM route is limited to summary prose from precomputed results.

## System Diagram

```mermaid
flowchart TD
  A[Visitor opens homepage] --> B[Audit form]
  B --> C[Client-side deterministic audit engine]
  C --> D[/api/audit-summary]
  D -->|Anthropic configured| E[LLM summary only]
  D -->|Failure or missing key| F[Templated fallback summary]
  E --> G[Supabase audits insert]
  F --> G
  G --> H[/results/[id]]
  H --> I[Results dashboard]
  I --> J[/api/leads]
  J --> K[Supabase leads insert]
  J --> L[Resend confirmation email]
  I --> M[/api/reports/[id]/pdf]
  I --> N[Dynamic OG/Twitter preview]
```

## Data Flow

1. The user enters tools, plans, seats, monthly spend, team size, and use case.
2. `lib/audit-engine.ts` normalizes the input and evaluates each tool.
3. Findings are created with category, severity, detail, estimated waste, and score impact.
4. Projected spend and savings are calculated from deterministic rules.
5. `/api/audit-summary` generates a short summary through Anthropic if configured, otherwise returns a fallback summary.
6. `lib/audits.ts` stores the complete report in Supabase.
7. `/results/[id]` reloads the stored report and renders the dashboard.
8. Lead capture and PDF export happen from the saved report page.

## Frontend Architecture

- `app/page.tsx`: audit entry page
- `components/audit-form.tsx`: persisted form state and audit submission
- `components/tool-card.tsx`: tool/plan/spend/seat row UI
- `app/results/[id]/page.tsx`: dynamic report loading and metadata
- `components/results-dashboard.tsx`: hero, chart, table, summary, lead capture, export, Credex CTA
- `components/results-card.tsx`: per-tool recommendation and savings assumptions

The UI is intentionally compact and operational. It should feel like a utility a founder or finance lead can use quickly, not a generic AI landing page.

## Deterministic Audit Engine

`lib/audit-engine.ts` is the financial decision layer. It checks:

- team-size fit
- workflow/use-case fit
- cheaper same-vendor plan fit
- premium tier overuse
- seat count exceeding team size
- overlapping coding assistants
- overlapping general-purpose assistants
- API spend ownership and budget gaps
- enterprise feature overkill
- monthly-vs-annual spend normalization
- solo developer edge cases

Plan metadata lives in `lib/pricing.ts`. Each structured plan records price, team-size range, collaboration/admin features, security controls, ideal use cases, coding focus, and usage intensity.

## Why Not LLM-Driven Savings

The app makes financial claims. A finance-literate reviewer should be able to ask "why is this $55/month?" and trace the answer to a plan benchmark, seat count, or explicit finding.

An LLM-only auditor would be persuasive but difficult to verify. ModelMeter instead uses deterministic math for all savings and plan decisions. The LLM is allowed only to summarize precomputed findings in plain language.

## Summary Generation

The assignment requires an AI-generated personalized summary. ModelMeter implements that as a bounded server route:

- input: already computed audit result
- output: ~100-word summary
- provider: Anthropic Messages API when configured
- fallback: deterministic summary from `lib/audit-summary.ts`

The prompt forbids changing numbers, inventing pricing, or adding recommendations.

## Persistence

Supabase stores:

- `audits`: report input, findings, recommendations, chart data, summary, and savings totals
- `leads`: email, optional company/role/team size, linked audit ID, and email delivery status

Reports are public by UUID. Lead details are never embedded in public report payloads.

## Shareable Reports

`/results/[id]` is server-rendered and dynamic. It handles missing reports with a styled fallback. It also defines dynamic Open Graph and Twitter metadata, plus generated preview images, so shared reports look credible in Slack, Discord, LinkedIn, and Twitter/X.

## Lead Capture

Lead capture happens after the report is visible. `/api/leads` validates input, checks a honeypot, loads the audit, sends a Resend confirmation email, and stores the lead with `email_status`.

High-savings reports surface Credex as a consultation/credits option.

## PDF Export

`/api/reports/[id]/pdf` uses `pdf-lib` on the server. The report includes branding, timestamp, report link, savings summary, audit summary, savings bars, savings table, recommendation cards, and assumptions. This avoids blurry screenshot exports and keeps the PDF readable.

## Stack Choice

- **Next.js App Router:** routes, metadata, and API endpoints in one deployable app.
- **TypeScript:** explicit audit and database shapes.
- **Tailwind/shadcn-style UI:** fast custom UI without a prebuilt admin template.
- **Supabase:** persistence and RLS with low setup overhead.
- **Resend:** small transactional email integration.
- **pdf-lib:** predictable server-side PDF output.

## Scaling To 10k Audits/Day

If this had to handle 10k audits/day, I would change:

- move audit creation and email sending behind a queue
- add rate limiting to lead and audit endpoints
- use a Supabase service role only on server routes instead of client inserts
- add observability for audit failures, email failures, and PDF generation
- cache pricing metadata and OG images more intentionally
- add a private admin/CRM export path for leads
- add unit and integration tests around Supabase/Resend failure paths

The current version is scoped for a polished assignment MVP, not large-volume operations.
