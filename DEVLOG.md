## Day 1 — 2026-05-07
**Hours worked:** 0  
**What I did:** Read the assignment at a high level and decided not to start manually coding because I had exams and very limited time. I planned to use AI assistance heavily and be honest about that in the submission.  
**What I learned:** The assignment rewards shipping and judgment, but it also explicitly allows AI tools if usage is disclosed honestly.  
**Blockers / what I'm stuck on:** Exams limited the amount of candidate-directed build time I could spend.  
**Plan for tomorrow:** Use AI to help narrow the product concept and scaffold the core flow.

## Day 2 — 2026-05-08
**Hours worked:** 0.1  
**What I did:** Directed AI toward a focused product concept: a lightweight AI spend audit tool for founders, engineering managers, and finance/ops leads. I chose to keep the first screen as the utility itself rather than a long marketing page.  
**What I learned:** The useful product wedge is not "AI dashboard"; it is a fast second opinion on messy AI spend.  
**Blockers / what I'm stuck on:** I needed the implementation to avoid sounding like generic AI advice.  
**Plan for tomorrow:** Push the generated implementation toward deterministic audit rules and traceable pricing assumptions.

## Day 3 — 2026-05-09
**Hours worked:** 0.1  
**What I did:** Reviewed AI-generated frontend and product-flow iterations. I steered the UI toward a calmer SaaS utility style and asked for inputs around tools, plans, spend, seats, team size, and use case.  
**What I learned:** AI can generate polished-looking screens quickly, but the instructions have to be specific or the result starts to feel like a template.  
**Blockers / what I'm stuck on:** The app still needed financially believable recommendations instead of only polished visuals.  
**Plan for tomorrow:** Add structured pricing metadata and deterministic savings logic.

## Day 4 — 2026-05-10
**Hours worked:** 0.1  
**What I did:** Directed AI to implement the deterministic audit engine and keep LLMs out of the core financial math. I reviewed the main checks: plan fit, duplicated tools, oversized seats, enterprise overkill, API spend controls, and annual-vs-monthly spend mismatch.  
**What I learned:** The audit is only trustworthy if the savings can be traced back to a rule, benchmark, or price assumption.  
**Blockers / what I'm stuck on:** Some recommendation wording was still repetitive and needed more operational specificity.  
**Plan for tomorrow:** Add persistence and shareable result URLs.

## Day 5 — 2026-05-11
**Hours worked:** 0.05  
**What I did:** Used AI assistance to add Supabase persistence and dynamic `/results/[id]` pages. I checked the direction that public report data should not contain email or company identity details.  
**What I learned:** A saved report URL makes the project feel much closer to a real acquisition tool than a temporary calculator.  
**Blockers / what I'm stuck on:** Lead capture, transactional email, and PDF export still needed production-like handling.  
**Plan for tomorrow:** Add post-results lead capture, Resend email, social previews, and PDF export.

## Day 6 — 2026-05-12
**Hours worked:** 0.1  
**What I did:** Directed AI to add lead capture, Supabase `leads` schema, Resend email support, honeypot abuse protection, Open Graph previews, and PDF export. When the lead flow failed, I provided the actual Supabase error and corrected the schema path.  
**What I learned:** AI-generated code still needs real error feedback. A concrete example was the invalid `timestz` PostgreSQL type, which had to be corrected to `timestamptz`.  
**Blockers / what I'm stuck on:** The PDF needed to feel more readable and procurement-friendly.  
**Plan for tomorrow:** Compare the repo against the PDF requirements and finish the submission docs.

## Day 7 — 2026-05-13
**Hours worked:** 0.05  
**What I did:** Asked AI to read the assignment PDF, close missing documentation gaps, improve tests/CI coverage, refine the final disclosure, and avoid creating extra root-level files outside the required submission structure.  
**What I learned:** The safest submission is direct: AI-assisted build, deterministic audit math, real limitations called out, and no fake interviews.  
**Blockers / what I'm stuck on:** The remaining non-code blockers are real user interviews, the deployed URL, and the git-history requirement if the actual commit history does not meet five distinct days.  
**Plan for tomorrow:** Submit only after adding the live URL, completing real interviews, and confirming git history meets the assignment's automated checks.
