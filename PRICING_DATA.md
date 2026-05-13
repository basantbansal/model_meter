# Pricing Data

Last reviewed: May 12, 2026.

ModelMeter uses pricing data as audit benchmarks, not as a live billing source. The app stores structured plan metadata in `lib/pricing.ts` for providers where public per-seat pricing is stable enough to support deterministic recommendations.

## Implementation Coverage

Fully structured in the audit engine:

- Cursor
- Claude
- ChatGPT
- GitHub Copilot

Form-supported but conservative/contextual:

- Gemini
- OpenAI API
- Anthropic API
- Windsurf

For contextual tools, the audit can still flag overlap, workflow fit, and spend ownership issues, but it avoids precise plan-rightsizing math when public per-seat metadata is incomplete or usage-based.

## Source Policy

Every pricing number below is tied to an official vendor page. If a vendor changes packaging, update `lib/pricing.ts` and rerun audit scenarios.

## Cursor

Official source: https://cursor.com/pricing

Structured plans:

- Hobby: $0/user/month — https://cursor.com/pricing — verified 2026-05-13
- Pro: $20/user/month — https://cursor.com/pricing — verified 2026-05-13
- Pro+: $60/user/month — https://cursor.com/pricing — verified 2026-05-13
- Business / Teams: $40/user/month — https://cursor.com/pricing — verified 2026-05-13
- Enterprise: custom — https://cursor.com/pricing — verified 2026-05-13

| Plan | ModelMeter monthly benchmark | Assumption |
| --- | ---: | --- |
| Hobby | $0 | Individual light/free usage |
| Pro | $20/user | Individual coding subscription |
| Pro+ | $60/user | Higher-usage individual coding subscription |
| Business / Teams | $40/user | Team workspace with admin/collaboration features. The UI supports the assignment's Business wording and Cursor's Teams wording. |
| Enterprise | Custom | Enterprise pricing is not modeled as a public fixed benchmark |

Audit use:

- strong coding workflow fit
- solo developer handling
- team plan overhead detection
- high spend versus plan benchmark reconciliation

## Claude

Official source: https://claude.com/pricing

Structured plans:

- Free: $0/user/month — https://claude.com/pricing — verified 2026-05-13
- Pro: $20/user/month — https://claude.com/pricing — verified 2026-05-13
- Max: $100/user/month — https://claude.com/pricing — verified 2026-05-13
- Team: $25/user/month — https://claude.com/pricing — verified 2026-05-13
- Enterprise: custom — https://claude.com/pricing — verified 2026-05-13

| Plan | ModelMeter monthly benchmark | Assumption |
| --- | ---: | --- |
| Free | $0 | Individual light/free usage |
| Pro | $20/user | Individual subscription |
| Max | $100/user | Higher-usage individual subscription |
| Team | $25/user | Team workspace benchmark |
| Enterprise | Custom | Custom/enterprise pricing is not modeled as fixed per-seat spend |

Audit use:

- general assistant overlap
- team plan fit
- premium individual tier review
- enterprise overkill checks for smaller teams

## ChatGPT

Official sources:

- https://openai.com/chatgpt/pricing/
- https://help.openai.com/en/articles/6950777-chatgpt-plus
- https://help.openai.com/en/articles/9793128-what-is-chatgpt-pro/
- https://help.openai.com/en/articles/8792828

Structured plans:

- Free: $0/user/month — https://openai.com/chatgpt/pricing/ — verified 2026-05-13
- Plus: $20/user/month — https://help.openai.com/en/articles/6950777-chatgpt-plus — verified 2026-05-13
- Pro: $200/user/month — https://help.openai.com/en/articles/9793128-what-is-chatgpt-pro/ — verified 2026-05-13
- Team / Business: $25/user/month — https://openai.com/chatgpt/pricing/ — verified 2026-05-13
- Enterprise: custom — https://openai.com/chatgpt/pricing/ — verified 2026-05-13

| Plan | ModelMeter monthly benchmark | Assumption |
| --- | ---: | --- |
| Free | $0 | Individual light/free usage |
| Plus | $20/user | Individual paid subscription |
| Pro | $200/user | High-usage individual subscription |
| Team / Business | $25/user | Monthly business/team workspace benchmark. The UI supports both the assignment wording and current product wording. |
| Enterprise | Custom | Enterprise pricing is not modeled as a public fixed benchmark |

Audit use:

- general assistant overlap
- business workspace plan fit
- high individual Pro spend review
- team-size and collaboration overhead checks

Note: ChatGPT Business pricing has changed over time. ModelMeter uses the current public monthly Business benchmark, not older Team/Business pricing.

## GitHub Copilot

Official sources:

- https://github.com/features/copilot/plans
- https://docs.github.com/copilot/concepts/billing/billing-for-enterprises

Structured plans:

- Free: $0/user/month — https://github.com/features/copilot/plans — verified 2026-05-13
- Pro / Individual: $10/user/month — https://github.com/features/copilot/plans — verified 2026-05-13
- Pro+: $39/user/month — https://github.com/features/copilot/plans — verified 2026-05-13
- Business: $19/user/month — https://github.com/features/copilot/plans — verified 2026-05-13
- Enterprise: $39/user/month — https://docs.github.com/copilot/concepts/billing/billing-for-enterprises — verified 2026-05-13

| Plan | ModelMeter monthly benchmark | Assumption |
| --- | ---: | --- |
| Free | $0 | Individual limited usage |
| Pro | $10/user | Individual coding assistant |
| Pro+ | $39/user | Higher-usage individual coding assistant |
| Business | $19/user | Organization seat benchmark |
| Enterprise | $39/user | Enterprise per-seat benchmark |

Audit use:

- coding assistant overlap
- business/enterprise plan fit
- seat efficiency
- coding-focused workflow checks

## Gemini

Official sources:

- https://one.google.com/about/google-ai-plans/
- https://one.google.com/about/plans
- https://workspace.google.com/solutions/ai/
- https://ai.google.dev/gemini-api/docs/pricing

Current implementation:

- Gemini is selectable in the form.
- It is treated conservatively in the deterministic engine because Google's Gemini packaging spans consumer plans, Workspace AI bundles, and usage-based API pricing.
- The engine can flag overlap and workflow issues, but does not currently recommend specific Gemini plan downgrades.

Supported form plans:

- Free: $0/user/month benchmark — https://one.google.com/about/google-ai-plans/ — verified 2026-05-13
- Pro: consumer plan benchmark documented through Google AI plans — https://one.google.com/about/google-ai-plans/ — verified 2026-05-13
- Ultra: consumer plan benchmark documented through Google AI plans — https://one.google.com/about/google-ai-plans/ — verified 2026-05-13
- API: usage-based — https://ai.google.dev/gemini-api/docs/pricing — verified 2026-05-13

Future metadata should separate consumer Gemini plans, Workspace seats, and Gemini API usage.

## OpenAI API

Official source: https://openai.com/api/pricing/

Current implementation:

- OpenAI API is selectable in the form.
- It is treated as usage-driven spend rather than a per-seat subscription.
- The engine focuses on budget ownership, workload tagging, and API provider overlap.

Supported form plans:

- Pay as you go: usage-based — https://openai.com/api/pricing/ — verified 2026-05-13
- Scale tier: usage/custom capacity — https://openai.com/api/pricing/ — verified 2026-05-13
- Enterprise: custom — https://openai.com/api/pricing/ — verified 2026-05-13

Benchmark assumption:

- no fixed monthly seat price
- spend should be reviewed by workload, model family, environment, and owner
- enterprise/scale arrangements are treated as custom

## Anthropic API

Official source: https://docs.anthropic.com/en/docs/about-claude/pricing

Current implementation:

- Anthropic API is selectable in the form.
- It is handled as usage-based spend, not fixed seat spend.
- Recommendations focus on ownership, budget caps, and overlap with other API providers.

Supported form plans:

- Build: usage-based — https://docs.anthropic.com/en/docs/about-claude/pricing — verified 2026-05-13
- Scale: usage/custom capacity — https://docs.anthropic.com/en/docs/about-claude/pricing — verified 2026-05-13
- Enterprise: custom — https://docs.anthropic.com/en/docs/about-claude/pricing — verified 2026-05-13

Benchmark assumption:

- no fixed monthly seat price
- model/token pricing varies by workload
- enterprise arrangements are treated as custom

## Maintenance Notes

Before using ModelMeter outside the assignment context:

1. Refresh official pricing URLs.
2. Update `lib/pricing.ts`.
3. Re-run scenario checks for solo users, small teams, coding teams, API-heavy teams, and enterprise-plan inputs.
4. Confirm report wording still matches actual modeled assumptions.
