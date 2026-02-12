# Critique Prompt — Fintech AI Strategic Command Simulator

**Objective:** I built an interactive strategy simulator to demonstrate my strategic thinking for a **Principal of Client & Product Solutions** role at a high-growth, AI-native fintech company. I need you to ruthlessly critique it so I can make it genuinely impressive to both the recruiter and the hiring team (who are deeply technical, AI-native fintech operators).

**The audience:**
1. **Recruiter** — Needs to immediately understand this person "gets it" and is a senior strategic operator, not a generic consultant
2. **Hiring manager / CTO / CPO** — AI-native fintech leaders who will spot shallow thinking, generic language, or unrealistic scenarios instantly. They've lived these problems.
3. **C-suite / Board** — May see this as a signal of how I'd present complex ideas

---

## What the simulator is

A React-based interactive simulation where you play as the Principal of Client & Product Solutions at an AI-native fintech company. Over 4 quarters, you manage a portfolio of enterprise clients (Tier 1 banks, payment processors, wealth management, insurance, lending) and make 18 strategic decisions that impact 5 KPIs: Client Satisfaction, Implementation Success, Product Influence, Revenue Pipeline, and Team Alignment.

Each decision has 4 options with genuine trade-offs, KPI impacts, and playbook analysis explaining the strategic reasoning. Random events occur between quarters. At the end, you get a scorecard and can review all decisions against the playbook.

---

## I need you to critique the following dimensions. Be specific and actionable.

### 1. SCENARIO AUTHENTICITY & DEPTH
- Do these scenarios feel like situations a **Principal-level** person at an **AI-native fintech** would actually face? Or do they read like MBA case studies?
- Is the fintech domain knowledge specific enough? Would a VP of Engineering at a company like Featurespace, Hawk AI, Pagaya, Zest AI, or Upstart read these and think "yes, this is real"?
- Are the regulatory references accurate and current (CFPB, OCC, model governance, disparate impact, explainability requirements)?
- Do any scenarios feel generic or interchangeable with non-fintech contexts? Flag them.
- Are there critical real-world scenarios missing that someone in this role would absolutely face? (e.g., model drift in production, client data sovereignty, SOC 2 / ISO 27001 implications, multi-tenancy vs. dedicated deployment, model validation & audit cycles, vendor risk assessments)

### 2. DECISION QUALITY & TRADE-OFFS
- For each of the 18 scenarios, do ALL four options represent genuinely viable strategies that experienced people would disagree on?
- Are there any "obviously correct" answers that would make the simulation feel shallow?
- Do the KPI impacts make strategic sense? (e.g., does prioritizing revenue appropriately trade off against client satisfaction or team alignment?)
- Are the trade-offs nuanced enough for a Principal-level audience, or do they feel like junior PM decisions?
- Would a Chief Product Officer or CTO look at these options and feel the tension, or shrug?

### 3. PLAYBOOK / STRATEGY GUIDE QUALITY
- Does the playbook analysis demonstrate **genuine strategic insight**, or does it read like generic business advice?
- Does it show the kind of thinking that separates a Principal from a Senior Director?
- Is the playbook opinionated enough? Does it take positions, or does it hedge everything?
- Does the analysis reference real fintech dynamics (procurement cycles, regulatory timelines, integration complexity, model validation requirements)?
- Would reading the playbook alone convince someone this person should be hired?

### 4. LANGUAGE & TONE
- Is the language specific to AI-native fintech, or could it be from any enterprise software context?
- Flag any generic consulting-speak, buzzwords, or filler language
- Does it use the right vocabulary? (e.g., model governance, feature engineering, inference latency, explainability, model cards, fairness metrics, champion-challenger frameworks, shadow deployments)
- Is the tone confident and principal-level, or does it feel like a junior person trying to sound senior?

### 5. STRATEGIC NARRATIVE ARC
- Does the 4-quarter arc tell a coherent story of a Principal building influence, delivering results, and shaping strategy?
- Does it escalate in complexity and stakes appropriately?
- Does Q4 feel like a genuine culmination, or just "more decisions"?
- Is there a clear through-line showing how early decisions compound into later strategic positioning?

### 6. KPI SYSTEM & GAME DESIGN
- Are the 5 KPIs the right ones? Are any missing? (e.g., time-to-value, NRR, logo retention, engineering velocity, technical debt)
- Does the scoring/grading system feel fair and meaningful?
- Is there enough replay value?
- Do random events add genuine strategic texture, or are they just noise?

### 7. WHAT'S MISSING THAT WOULD MAKE THIS EXCEPTIONAL?
- What would make a CTO say "I need to meet this person" instead of "that's a nice project"?
- Are there dimensions of the Principal role not covered? (e.g., cross-sell/upsell strategy, partner ecosystem, build-vs-buy for clients, model monitoring & MLOps, competitive intelligence)
- Should there be client personas with actual personality traits and decision-making styles (e.g., a risk-averse CISO vs. an innovation-hungry CDO)?
- Would adding industry benchmarks or real market data make scenarios more credible?
- Is the ending impactful enough? What would make someone want to share this?

### 8. RED FLAGS
- Is there anything that would make the hiring team think **negatively** about the candidate?
- Any oversimplifications that reveal lack of depth?
- Any scenarios where the "right" answer reveals a misunderstanding of how AI-native fintechs actually operate?
- Does anything feel self-congratulatory rather than genuinely insightful?

---

## FORMAT YOUR RESPONSE AS:

1. **Overall Impression** (2-3 sentences — gut reaction from a hiring manager's perspective)
2. **Strengths** (what's already working well)
3. **Critical Issues** (things that would undermine credibility — fix these first)
4. **Scenario-by-Scenario Review** (flag specific scenarios, options, or playbook text that need work, with specific rewrite suggestions)
5. **Missing Scenarios** (what should be added or replaced)
6. **Language Fixes** (specific phrases to cut or replace)
7. **Structural Recommendations** (game design, KPI, scoring changes)
8. **The "Wow Factor" Additions** (1-3 things that would elevate this from "impressive" to "I need to hire this person")

Be brutal. I'd rather fix real problems than get compliments on something mediocre.

---

*Attach the full simulator code (.jsx or .html) when sending this prompt.*
