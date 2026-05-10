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
Refined the frontend UX and visual direction for ModelMeter. Reworked the product flow to keep the audit form directly on the homepage instead of using a separate audit route in order to reduce friction and make the experience feel more like a utility-focused SaaS product.

Improved the results page by adding a savings visualization, structured breakdown tables, and more compact recommendation sections. Spent time evaluating how the audit engine should be structured and decided against using a fully LLM-driven recommendation system after reviewing the assignment requirements more carefully.

The current direction is moving toward a deterministic pricing/rules engine with AI only used for generating human-readable summaries.

**What I learned:**  
The hardest part of the project is not frontend implementation but designing recommendation logic that feels believable, financially defensible, and trustworthy without becoming overly hardcoded or “AI magic.”

**Blockers / what I'm stuck on:**  
Still thinking through the cleanest structure for pricing metadata and recommendation evaluation logic.

**Plan for tomorrow:**  
Start implementing the real audit engine and connect Supabase for storing audit results and generating shareable result URLs.