## Day 1 — 2026-05-08

**Hours worked:** 4

**What I did:**  
Read and analyzed the full Credex assignment requirements in depth. Researched the product/business model behind AI infrastructure credits and clarified the purpose of the audit tool. Chose the name “ModelMeter,” initialized a Next.js + TypeScript + Tailwind project, connected GitHub, and created all required repository documentation files.

**What I learned:**  
The assignment heavily emphasizes entrepreneurial thinking, believable audit logic, product polish, and thoughtful documentation — not just coding ability.

**Blockers / what I'm stuck on:**  
Still deciding the exact structure of the audit engine and planning the landing page/user flow.

**Plan for tomorrow:**  
Design the landing page and begin implementing the AI spend input form.


## Day 2 — 2026-05-09

**Hours worked:** 6

**What I did:**  
Built the first working frontend MVP flow for ModelMeter using Next.js, TypeScript, TailwindCSS, and shadcn/ui. Implemented the homepage audit flow directly on the landing page instead of separating it into a dedicated audit route to reduce friction and make the tool feel more utility-focused. Added dynamic multi-tool form interactions, searchable tool selection UX, and a mock results page with savings visualization and recommendation cards.

Refined the visual direction away from generic “AI startup” aesthetics toward a more minimal and trustworthy utility-product style inspired by products like iLovePDF and Linear.

Set up GitHub Actions CI workflow and ensured lint/build checks pass successfully.

**What I learned:**  
The assignment is less about building a technically complex AI system and more about designing believable recommendation logic, product clarity, and convincing UX. I also realized that deterministic rule engines are likely more appropriate than LLM-based decision making for financial recommendations.

**Blockers / what I'm stuck on:**  
Still designing the audit engine architecture. Currently thinking through how to structure pricing metadata and recommendation rules cleanly without turning the system into unmaintainable hardcoded logic.

**Plan for tomorrow:**  
Build the real audit engine starting with structured pricing metadata for Claude, ChatGPT, and Cursor. Replace static mock results with dynamically generated recommendations and savings calculations.



## Day 3 — 2026-05-10

**Hours worked:** 0.5

**What I did:**  
Implemented the first real deterministic audit engine for ModelMeter and replaced the earlier static mock recommendations with dynamically generated audit results. Added structured pricing metadata and recommendation evaluation logic focused on SaaS spend optimization patterns such as overlapping assistant subscriptions, oversized collaboration plans, and duplicated tooling spend.

Refined the recommendation wording to feel more operational and financially believable instead of overly AI-generated. Removed weaker pseudo-analytical elements like unsupported confidence scoring and shifted the product tone toward a more trustworthy finance/productivity style.

Also improved the results presentation with clearer savings concentration breakdowns and more grounded AI-generated summaries.

**What I learned:**  
The biggest challenge is designing recommendation logic that feels credible and operationally realistic without overcomplicating the system. Deterministic evaluation combined with AI-generated explanation layers feels significantly more trustworthy than allowing LLMs to make the core financial decisions themselves.

**Blockers / what I'm stuck on:**  
The recommendation engine still needs more nuanced differentiation between overlapping tools and workflows so that recommendations feel less repetitive across providers.

**Plan for tomorrow:**  
Integrate Supabase for storing audit results and generating shareable result URLs. Begin implementing lead capture and persistence flow.



## Day 4 — 2026-05-10

**Hours worked:** 0.5

**What I did:**  
Integrated Supabase persistence into ModelMeter and replaced the temporary static results route with dynamic shareable audit URLs. The audit flow now saves generated audit results, recommendations, savings calculations, and chart data into Supabase and redirects users to persistent `/results/[id]` pages.

Implemented dynamic report loading so audit results survive refreshes and can be shared publicly through unique URLs without requiring authentication. Kept sensitive lead-related information out of the public report payload and focused the shared pages only on optimization findings, savings data, and recommendations.

Also cleaned up the architecture around audit result types and database interactions to make the system feel more like a real SaaS utility instead of a frontend-only demo.

**What I learned:**  
Persistence and dynamic routing significantly change how “real” the product feels. The project now behaves much more like an actual SaaS workflow where generated reports can be revisited and shared instead of existing only in temporary frontend state.

**Blockers / what I'm stuck on:**  
Still need to implement lead capture, transactional email flow, and abuse protection. The recommendation engine could also become more nuanced in differentiating overlapping tool usage patterns between providers.

**Plan for tomorrow:**  
Implement lead capture flow with Supabase storage and transactional email support. Add basic abuse protection and start preparing the project for deployment.