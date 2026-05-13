# Prompts

ModelMeter was built primarily through iterative AI-assisted development. This file documents the major prompt patterns and boundaries used during the project. The important distinction is that AI helped create the repository through review and correction passes, but runtime financial decisions are still deterministic.

## What Was Made With What

- **Codex / AI coding assistance:** application structure, React components, audit engine implementation, Supabase/Resend/PDF routes, tests, CI, and documentation drafts.
- **Human direction:** assignment interpretation, product priorities, review feedback, real error messages, API/setup details, and the decision to disclose AI usage honestly.
- **Deterministic TypeScript:** savings calculations, plan-fit checks, seat-efficiency analysis, overlap detection, and recommendation categories.
- **Anthropic API at runtime:** optional summary paragraph only, constrained by precomputed audit data.

## Product Direction Prompt

```text
Build a lightweight AI spend optimization utility for teams reviewing assistant subscriptions, coding tools, and API spend. The product should feel operational, financially believable, and fast. Avoid generic AI hype. Do not gate the audit before showing value.
```

Why it worked:

- It constrained the product to a utility workflow.
- It prioritized trust and speed over spectacle.
- It made lead capture secondary to value delivery.

## Implementation Prompt

```text
Implement the existing ModelMeter project as a Next.js App Router app with TypeScript, Tailwind, Supabase persistence, deterministic audit rules, shareable result URLs, lead capture, Resend email, Open Graph previews, and PDF export. Do not redesign from scratch. Keep the deterministic audit architecture.
```

How it was used:

- AI generated and edited most of the application code.
- Human review focused on whether behavior matched the assignment and whether the economics sounded believable.
- Follow-up prompts corrected issues instead of replacing the whole architecture.

## Audit Engine Design Prompt

```text
Design a deterministic audit engine for AI tooling spend. Inputs are team size, use case, selected tools, plans, seats, and monthly spend. Detect plan-fit issues, seat inefficiency, overlapping subscriptions, enterprise overkill, API spend control gaps, and annual-vs-monthly spend mismatches. Return findings with category, severity, estimated waste, and explanation. Do not use an LLM to decide savings.
```

Why it worked:

- It forced findings to be structured.
- It separated detection from presentation copy.
- It kept savings explainable and repeatable.

## Recommendation Explanation Prompt

```text
Given deterministic findings and calculated savings, write short operational recommendation copy. Explain why the finding matters, what action a billing owner should take, and what assumption drives projected savings. Do not invent vendor prices, usage data, confidence scores, or plan capabilities not present in the structured metadata.
```

Risk control:

- The prompt uses already computed findings.
- It forbids changing numbers.
- It asks for operational action rather than broad optimization language.

In the current implementation, this role is handled by deterministic copy branches in `lib/audit-engine.ts`.

## Audit Summary Prompt Used By `/api/audit-summary`

```text
Write a concise ~100-word audit summary for a startup founder or engineering manager.

Rules:
- Use only the deterministic audit data below.
- Do not invent pricing, tools, usage, benchmarks, confidence scores, or savings.
- Do not change any numbers.
- Make clear that savings are modeled estimates.
- Mention Credex only if monthly savings are over $500.
- Keep the tone operational and finance-friendly, not salesy.

Audit data:
Monthly spend: {monthlySpend}
Modeled monthly savings: {monthlySavings}
Modeled yearly savings: {yearlySavings}
Primary savings driver: {primarySavingsDriver}
Top recommendations:
- {tool}: {title}; {savings}/mo modeled savings; action: {optimizationAction}
```

Current implementation:

- `app/api/audit-summary/route.ts` calls Anthropic when `ANTHROPIC_API_KEY` is configured.
- `lib/audit-summary.ts` provides the exact prompt and deterministic fallback.
- API failures return fallback summary text rather than blocking audit creation.

## PDF / Report Prompt

```text
Create a procurement-friendly report structure for an AI spend audit. Include branding, timestamp, shareable report link, monthly and yearly savings, audit summary, savings concentration, savings table, recommendation cards, and assumptions. Keep the language restrained and suitable for finance review.
```

How it shaped the implementation:

- PDF output is not a screenshot.
- Each recommendation includes the assumption behind projected savings.
- The report avoids unsupported certainty.

## Final Disclosure Prompt

```text
Make the submission docs honest that the project was built primarily with AI assistance because of exam constraints. Keep the disclosure inside the required repository files and do not change frontend or backend behavior.
```

How it changed the repository:

- Updated README disclosure.
- Rewrote the devlog to use the required `Hours worked` format while keeping the small human time honest.
- Updated this prompt log and reflection to make AI usage explicit.
- Removed the extra disclosure file so the root documentation stays aligned with the assignment's required file list.

## Hallucination Controls

ModelMeter reduces hallucination risk by design:

- pricing metadata is structured in code
- official pricing references are documented in `PRICING_DATA.md`
- savings are calculated before any explanation text exists
- report copy uses modeled/estimated language
- unsupported tools are handled conservatively instead of inventing plan math

## What Did Not Work

Early prompt direction that asked for "AI-generated recommendations" produced language that sounded confident but was not tied tightly enough to pricing benchmarks. I moved that responsibility into deterministic code.

The other weak prompt pattern was asking for "startup-style" copy. That tended to create generic AI product language. The better constraint was "finance-friendly, operational, restrained, and tied only to the provided findings."
