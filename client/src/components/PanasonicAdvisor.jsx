import { useState, useEffect } from "react";

const C = {
  bg: "#08080A",
  surface: "#111114",
  surfaceAlt: "#16161A",
  border: "#222228",
  text: "#E4E2DC",
  textMuted: "#908E86",
  textDim: "#58564F",
  accent: "#D4A843",
  accentDim: "#D4A84320",
  red: "#D45443",
  redDim: "#D4544318",
  green: "#5AAA6A",
  greenDim: "#5AAA6A18",
  blue: "#5488CC",
  blueDim: "#5488CC18",
};

const QUESTIONS = [
  {
    id: "structure",
    label: "How to Structure This",
    question: "How should Panasonic structure its AI transformation given the new CAIO, 8 operating companies, and Blue Yonder operating independently?",
    answer: [
      { type: "bold", text: "The core problem: Panasonic doesn't have one AI transformation — it has six, running at different speeds, in different cultures, with different definitions of success." },
      { type: "p", text: "The new CAIO (Sakakibara) needs to resist the instinct to centralize everything. That's the Japanese corporate default — consolidate, create a center of excellence, issue guidelines. It will fail here because Blue Yonder is 5 years ahead, Connect just got its first American CEO, and Energy is making money from AI infrastructure without any help from headquarters." },
      { type: "heading", text: "The structure that works:" },
      { type: "item", label: "Federated AI governance, not centralized AI control", text: "The CAIO sets standards, shared infrastructure (data platforms, evaluation frameworks, vendor relationships like Anthropic), and a common language for measuring AI value. Operating companies keep execution autonomy." },
      { type: "item", label: "Blue Yonder as the internal benchmark, not a silo", text: "Don't integrate Blue Yonder — learn from it. Their SADA Loop architecture, their 5 AI agents, their $2B tech stack rebuild are a playbook. Create a formal mechanism where Blue Yonder's learnings flow inward. Exchange programs, shared architecture reviews, joint pilot design." },
      { type: "item", label: "Kill the PX Ambassador model", text: "56 volunteers for 180,000 people is theater. Replace with embedded AI leads — one per operating company, reporting dually to the CAIO and the business CEO. Give them budget authority and P&L accountability." },
      { type: "item", label: "90-day proof cycles", text: "No more 18-month transformation roadmaps. Each operating company commits to one AI use case per quarter with a measurable KPI. The CAIO's job is sequencing and resource allocation across these cycles, not writing strategy decks." },
      { type: "flag", text: "The biggest structural risk: the 'Business CEO' mechanism (operating company presidents as Holdings executive officers) is being deployed simultaneously. If the CAIO and the business CEOs clash on AI investment priorities, there's no established precedent for who wins. Define this before it happens." },
    ],
  },
  {
    id: "blockers",
    label: "Likely Blockers",
    question: "What are the 3 most likely blockers that will stall Panasonic Go in the next 18 months?",
    answer: [
      { type: "heading", text: "Blocker #1: The Well talent exodus (next 3 weeks)" },
      { type: "p", text: "250 Silicon Valley employees recruited from Google, Fitbit, Nike, and Waymo are about to lose their organizational home. These people joined a 'hyper-growth startup,' not a Japanese conglomerate. The moment Well HQ dissolves, every one of them updates their LinkedIn. Matsuoka joining the Analog Devices board in January is a leading indicator. If she leaves, the signal to the rest of the team is unmistakable." },
      { type: "bold", text: "Why it's hard to fix: You can't retain startup talent by reassigning them to a corporate CAIO structure. The incentive mismatch is fundamental." },
      { type: "heading", text: "Blocker #2: The adoption canyon (ongoing)" },
      { type: "p", text: "0.46 uses per employee per day at Connect — the most technically advanced operating company. At group scale, the number is almost certainly lower. PX-AI is deployed. It is not adopted. And the 12,000 job cuts make it worse: the rational response to 'learn this AI tool' when your division is being cut is 'why would I train my replacement?'" },
      { type: "bold", text: "Why it's hard to fix: Adoption requires changed workflows, not available tools. Nobody's job description has been rewritten to assume AI as a core input. Until it has, PX-AI is optional — and optional tools die." },
      { type: "heading", text: "Blocker #3: The revenue definition problem (FY2027)" },
      { type: "p", text: "The 30% AI revenue target has no published breakdown. Is Energy selling batteries to data centers 'AI revenue'? Is a factory using predictive maintenance 'AI-driven'? When the target is undefined, every business unit will either claim everything counts (to hit the number) or claim nothing counts (to avoid accountability). Both are toxic." },
      { type: "bold", text: "Why it's hard to fix: Defining 'AI revenue' requires Kusumi to make a political choice. A narrow definition shows the company is behind. A broad definition makes the target meaningless. Neither is comfortable." },
      { type: "flag", text: "The meta-blocker: all three are hitting simultaneously within 18 months. Any one is manageable. The combination is what creates the risk of stall — leadership attention gets split across firefighting instead of building." },
    ],
  },
  {
    id: "culture",
    label: "Cultural Barriers",
    question: "How does Panasonic overcome a culture where 'change has not yet taken root' and the 250-year plan creates permission to wait?",
    answer: [
      { type: "bold", text: "The 250-year plan is both Panasonic's greatest asset and its most sophisticated defense mechanism against urgency." },
      { type: "p", text: "When your mission spans 250 years, everything feels early. 'We're in the fifth phase' sounds like progress, but it's also a way to defer hard decisions — there's always another phase. Kusumi knows this. His 30-year stagnation admission is a direct attack on the complacency the plan enables." },
      { type: "heading", text: "What actually moves culture:" },
      { type: "item", label: "Make the crisis visible, not abstract", text: "Kusumi's '30 years of stagnation' line is powerful — but it's at the CEO level. Does the factory floor in Osaka know that Hitachi's Lumada drives 41% of revenue while Panasonic Go is at ~10%? Does the Connect team in Newark know that their 97% profit growth is subsidizing loss-making TVs? Make the competitive gap a dashboard, not a speech." },
      { type: "item", label: "Use the 250-year plan as an accelerant, not a brake", text: "Reframe: 'If Matsushita were alive today, would he wait 10 years to adopt the most transformative technology since electricity? His Tap Water Philosophy was about making abundance accessible — AI is the modern version.' Turn the founder into an argument for speed, not patience." },
      { type: "item", label: "Change the assigned seating", text: "Former Connect CEO Higuchi found assigned seating by rank at internal meetings and banned it. That's not a trivial anecdote — it's a symbol. Every company has 'assigned seating' equivalents: approval chains, title hierarchies, consensus rituals. Identify the top 5 cultural artifacts that slow decisions and eliminate them publicly. Kusumi asking people to drop titles was this instinct — but 'most people didn't like it.' He needs to insist, not ask." },
      { type: "item", label: "Create defectors, not converts", text: "Don't try to change the whole culture. Find the 500 people (out of 180,000) who already think differently and give them disproportionate authority, visibility, and resources. The 550 PX Contest entries are a talent signal — somewhere in those submissions are your transformation leaders. Promote three of them into roles that make the rest of the company pay attention." },
      { type: "flag", text: "The hardest truth: Kusumi took a 40% pay cut. That's a leadership signal. But cultural change in a 108-year-old Japanese conglomerate with a 250-year plan requires more than signals — it requires consequences. What happens to the operating company CEO who doesn't hit AI adoption targets? If the answer is 'nothing,' the culture won't change." },
    ],
  },
  {
    id: "failure",
    label: "Why This Fails",
    question: "Make the case that Panasonic Go fails. What's the most likely failure mode?",
    answer: [
      { type: "bold", text: "The most likely failure mode: Panasonic Go becomes a branding exercise that reorganizes the org chart without changing how the company creates value." },
      { type: "p", text: "Here's the scenario:" },
      { type: "item", label: "Phase 1 — Announcement momentum (CES 2025, done)", text: "Big keynote, Anthropic partnership, Panasonic Go banner. Stock rises 40%. Analysts upgrade. The narrative works." },
      { type: "item", label: "Phase 2 — Structural rearrangement (now)", text: "New CAIO, dissolved Well, Business CEO mechanism, 12,000 cuts. This looks like transformation. But organizational restructuring is the part of transformation that executives are most comfortable with — it's moving boxes on an org chart. It doesn't require any customer to experience anything different." },
      { type: "item", label: "Phase 3 — The plateau (late 2026)", text: "The CAIO discovers that operating company CEOs protect their budgets. Blue Yonder continues operating independently because integration adds friction to their best-in-class product. PX-AI usage stays below 1 use/employee/day. The 30% target gets pushed to 'long-term aspiration.' CES 2027 showcases more demos." },
      { type: "item", label: "Phase 4 — The narrative pivot (2027-2028)", text: "Revenue stays flat. The restructuring costs are absorbed. The company claims 'AI-driven' improvements in operating margin from automation. But organic growth from AI-native products and services never materializes at scale. Panasonic Go becomes what 'Panasonic Transformation (PX)' was — a program name, not a business result." },
      { type: "heading", text: "Why this specific failure mode is most likely:" },
      { type: "p", text: "Because it's exactly what happened before. PX launched in 2021. It progressed through phases (PX ZERO → PX 1.0 → PX 2.0). It deployed tools, created ambassadors, ran contests, and established governance forums. Five years later, Kusumi is standing on a stage admitting 30 years of stagnation. PX didn't fail dramatically — it succeeded incrementally. And incremental success in a company growing 0% per year is just well-organized stagnation." },
      { type: "flag", text: "The counterargument: Blue Yonder is real ($1.42B, 25B daily predictions). Energy's data center pivot is real (47% profit growth). Connect's 97% profit growth is real. Panasonic has genuine AI assets — the question is whether the corporate organism can compose them into a growth story, or whether they remain isolated bright spots inside a flat conglomerate." },
    ],
  },
  {
    id: "well",
    label: "Well Dissolution",
    question: "Panasonic Well is being dissolved in 3 weeks. How do you prevent a talent exodus and preserve the Anthropic partnership?",
    answer: [
      { type: "bold", text: "You probably can't prevent all departures. The question is: which 50 people absolutely cannot leave, and what do they need to stay?" },
      { type: "p", text: "The 250-person Well team was recruited under a specific promise: work at a Silicon Valley startup, not a Japanese conglomerate. They took below-FAANG comp for equity-like upside and creative freedom. That contract is being broken. No restructuring memo fixes this." },
      { type: "heading", text: "Triage — the first 72 hours after dissolution:" },
      { type: "item", label: "Map the 50 irreplaceable people", text: "Engineers who built the Anthropic integration, the Umi product leads, anyone with direct Anthropic relationships. These people have offers waiting — Google, Anthropic itself, any AI startup. Personal conversations with Sakakibara or Kusumi, not HR form letters." },
      { type: "item", label: "Create a 'founding team' identity for what comes next", text: "Don't reassign Well people into existing operating company structures. Create a new unit under the CAIO — call it the AI Products Lab, whatever — and staff it with the best Well talent. They need to feel like they're building something, not being absorbed." },
      { type: "item", label: "Retention packages that match the market", text: "These people can walk to Anthropic, Google DeepMind, or any funded AI startup tomorrow. Panasonic's comp structure probably can't match. But a 2-year retention bonus tied to shipping the first AI-native product is a conversation starter." },
      { type: "heading", text: "The Anthropic partnership:" },
      { type: "p", text: "This is the most urgent governance question. The Anthropic relationship was announced as a 'global strategic partnership' with Daniela Amodei on stage. It covers consumer (Umi) and enterprise (Claude across the group). If Matsuoka was the relationship owner and she's disengaging, who becomes the single point of contact? Anthropic needs to know — partnerships die from ambiguity, not from conflict." },
      { type: "flag", text: "Watch Matsuoka's next move closely. She joined the Analog Devices board in January. If she takes an operational role elsewhere before June, expect 30-40% of the senior Well team to follow within 90 days. Her departure would also signal to Anthropic that their executive champion inside Panasonic is gone." },
    ],
  },
  {
    id: "adoption",
    label: "Adoption Gap",
    question: "PX-AI has 180,000 users but 0.46 uses/employee/day. How do you close the gap between deployment and actual transformation?",
    answer: [
      { type: "bold", text: "Stop measuring access. Start measuring changed workflows." },
      { type: "p", text: "0.46 uses/employee/day at Connect (the best case) means the average employee interacts with AI less than once per day — and that's a query to a chatbot, not a transformed process. Most employees tried it, found it mildly useful for writing emails, and went back to their existing tools. This is the 'enterprise chatbot plateau' that every large company hits." },
      { type: "heading", text: "Three things that actually move adoption:" },
      { type: "item", label: "Rewrite 10 job descriptions to require AI", text: "Pick 10 high-visibility roles across 3 operating companies. Rewrite their job descriptions so that AI usage is a core competency, not optional enrichment. 'Uses AI tools to generate first-draft analysis for all client deliverables' — not 'has access to PX-AI.' When AI is in the job spec, adoption follows because performance reviews follow." },
      { type: "item", label: "Kill a process, don't add a tool", text: "The reason PX-AI gets 0.46 uses/day is that it was deployed alongside existing workflows, not instead of them. Find 5 manual processes that take >2 hours/week across thousands of employees. Replace them entirely with AI-native workflows. Not 'use PX-AI to help with expense reports' — 'expense reports are now submitted through this AI system, the old form is gone.' Removal creates adoption faster than addition." },
      { type: "item", label: "Publish internal league tables", text: "Which operating company has the highest AI adoption? Which department? Which team? Panasonic's culture is competitive between units. Use it. Publish monthly adoption metrics by business unit with the CAIO's commentary. The operating company CEO whose division is last will react. That's the point." },
      { type: "flag", text: "The 12,000 job cuts make all of this harder. Telling employees to deeply adopt the AI tool while simultaneously cutting their colleagues is asking people to trust an institution that is actively reducing trust. The messaging has to be honest: 'We are cutting roles that AI will replace. We are investing in people who learn to work with AI. These are the same decision.' Silence on this connection is the worst option — people will draw the conclusion anyway." },
    ],
  },
  {
    id: "blueyonder",
    label: "Blue Yonder Problem",
    question: "Blue Yonder is the most advanced AI asset but operates independently. How should Panasonic learn from it without destroying what makes it work?",
    answer: [
      { type: "bold", text: "Blue Yonder works because it's independent. The moment Panasonic tries to 'integrate' it, you get the worst of both worlds — slower Blue Yonder and a parent company that still can't build AI products." },
      { type: "p", text: "Duncan Angove spent 3 years and $2 billion rebuilding the tech stack. They launched 5 AI agents with autonomous decision-making. They make 25 billion predictions daily. They have their own customers, brand, and culture. This is not an underperforming subsidiary that needs fixing — it's the proof point that Panasonic's AI ambition is achievable." },
      { type: "heading", text: "The learning model:" },
      { type: "item", label: "Architecture exchanges, not integration", text: "Blue Yonder's SADA Loop (See, Analyze, Decide, Act) and their approach to domain-specific fine-tuned LLMs are directly transferable to manufacturing, energy, and corporate functions. Create quarterly architecture review sessions where Blue Yonder's engineering team presents patterns, and operating companies identify where they apply. No shared codebase required." },
      { type: "item", label: "Rotation program for the CAIO's team", text: "Send 5-10 engineers from the new CAIO organization to embed at Blue Yonder for 90-day rotations. They learn how AI products are built at scale, then return to apply those patterns in their operating companies. Blue Yonder gets free engineering help on their roadmap." },
      { type: "item", label: "Joint customer pilots", text: "Blue Yonder serves 23 of the top 25 retailers. These are also Panasonic hardware customers. Create joint solutions — Blue Yonder's supply chain AI + Panasonic Connect's warehouse hardware + Panasonic Industry's sensors. This is where the '30% AI revenue' actually lives: integrated solutions that neither company can sell alone." },
      { type: "heading", text: "The IPO question:" },
      { type: "p", text: "The announced 2022 IPO never happened. This is actually the right call for now — keeping Blue Yonder gives Panasonic its best AI asset and its best internal learning lab. But if Panasonic can't figure out how to learn from Blue Yonder within 2 years, then the IPO argument gets stronger: unlock the value, return capital, and admit the conglomerate model doesn't work for AI." },
    ],
  },
  {
    id: "caio",
    label: "CAIO First 90 Days",
    question: "Sakakibara is the first CAIO, coming from one operating company. How does he establish authority across all operating companies in his first 90 days?",
    answer: [
      { type: "bold", text: "He has exactly one advantage: he's the first. There's no precedent for the role, which means he gets to define it. But if he spends the first 90 days writing strategy documents, he loses." },
      { type: "heading", text: "Days 1-30: Listening tour with teeth" },
      { type: "p", text: "Meet every operating company CEO one-on-one. Not to present Panasonic Go strategy — they've all seen the slides. Instead: 'What's the one AI initiative that would change your business this year? What's stopping you? What do you need from me?' Write down the answers. Publish a summary to Kusumi and the board. This creates immediate accountability — every operating company CEO knows their answer is on record." },
      { type: "heading", text: "Days 30-60: Pick two wins and fund them" },
      { type: "p", text: "From the listening tour, identify 2 high-impact, high-feasibility AI projects across different operating companies. Fund them from a central CAIO budget (he needs to negotiate this with Kusumi before day 1). These projects should be deliverable in 90 days. One should be customer-facing. One should save measurable cost. The CAIO's credibility comes from shipped results, not governance frameworks." },
      { type: "heading", text: "Days 60-90: Establish the operating model" },
      { type: "p", text: "Now — after demonstrating value — propose the ongoing governance model. Embedded AI leads per operating company (not ambassadors), quarterly AI investment reviews, shared infrastructure decisions, talent rotation policies. The order matters: demonstrate, then govern. Not the reverse." },
      { type: "item", label: "The one thing he must NOT do", text: "Create a CAIO 'office' with a large central team that produces strategy documents and governance frameworks. This is the reflex. It will be resisted by every operating company. He should stay small (10-15 people), move fast, and measure himself by operating company results, not by the quality of his strategy deck." },
      { type: "flag", text: "The political trap: Sakakibara comes from Connect. Connect is the strongest performing division. Every other operating company will assume he'll favor Connect. His first funded project should be in a non-Connect operating company. The signal matters more than the project." },
    ],
  },
  {
    id: "revenue",
    label: "The 30% Question",
    question: "The 30% AI revenue target by 2035 has no published pathway. How would you build the roadmap?",
    answer: [
      { type: "bold", text: "30% of \u00A58.5 trillion = \u00A52.55 trillion (~$17 billion) in AI-driven revenue by 2035. Today, the only clearly measurable AI revenue is Blue Yonder at $1.42 billion. The gap is enormous." },
      { type: "heading", text: "First: define what counts" },
      { type: "p", text: "This is the political decision Kusumi has to make. Three possible definitions, each with different implications:" },
      { type: "item", label: "Narrow: AI-native products and services", text: "Blue Yonder SaaS, Umi (if it launches), AI agents, software products with AI at the core. This is the honest definition. It puts the number at maybe 5-8% today. The gap is visible and motivating." },
      { type: "item", label: "Medium: AI-enabled solutions", text: "Hardware + software bundles where AI is the differentiator. Smart factory solutions, AI-powered warehouse systems, predictive energy storage. This is defensible and probably the right answer. Gets you to maybe 12-15%." },
      { type: "item", label: "Broad: Revenue from AI-adjacent businesses", text: "Batteries sold to AI data centers, MEGTRON boards in AI servers, any product where AI is in the customer's value chain. This is tempting because Energy's 47% growth looks like AI revenue. But it makes the target meaningless — selling copper wire to a data center is not an AI business." },
      { type: "heading", text: "Then: the unit-by-unit build" },
      { type: "item", label: "Blue Yonder: $1.4B \u2192 $3-4B", text: "SaaS growth at 10.4%, accelerate via acquisitions (already doing this: One Network, Optoro). AI agents expand TAM. Achievable." },
      { type: "item", label: "Connect: $0 \u2192 $1-2B in AI solutions", text: "Bundled hardware + Blue Yonder software + AI services for retail/logistics. Joint offerings. This is the integration revenue." },
      { type: "item", label: "Energy: redefine the unit", text: "AI data center storage as a dedicated P&L. \u00A5100B AI component target by FY2031 is already stated." },
      { type: "item", label: "Well / AI Products: $0 \u2192 ???", text: "This was supposed to be the consumer AI play. With Well dissolved, the pathway is unclear. Umi's status is unknown." },
      { type: "flag", text: "The honest math: even with aggressive growth, Panasonic gets to maybe 18-22% by 2035 under the 'medium' definition. 30% requires either a major acquisition, a breakthrough consumer AI product, or a very generous definition of 'AI-driven.' Kusumi should be challenged on which one he's planning for." },
    ],
  },
  {
    id: "quickwins",
    label: "Quick Wins",
    question: "What are 3 things Panasonic could do in the next 90 days that would signal this transformation is real, not theater?",
    answer: [
      { type: "heading", text: "Quick Win #1: Ship one AI product to an external customer" },
      { type: "p", text: "Not a demo. Not a CES showcase. Not an internal tool. One AI-powered product or service that a customer pays for, that didn't exist 90 days ago. Blue Yonder's 5 AI agents are already there — extend one of them to a Panasonic Connect customer as a joint offering. The signal: we sell AI products now, not just hardware with AI marketing." },
      { type: "heading", text: "Quick Win #2: Publish the PX-AI adoption dashboard externally" },
      { type: "p", text: "Put the real numbers in the investor presentation. Not '180,000 employees have access' — the actual usage rates, by operating company, with trends. This is terrifying for most companies. That's exactly why it works as a signal. Kusumi has already shown willingness to be candid about 30 years of stagnation. Extend that candor to AI adoption metrics. Investors and analysts will respect the honesty, and it creates internal pressure to improve the numbers." },
      { type: "heading", text: "Quick Win #3: Name the Well successor before Well dies" },
      { type: "p", text: "Before March 31 — not after — announce exactly where the Well capabilities land: which team, which leader, which mandate, which budget. The 250 Well employees need to know their new organizational home before the old one disappears, not after. And the Anthropic partnership needs a named executive owner, announced publicly, so Anthropic's leadership team knows who to call on April 1." },
      { type: "flag", text: "The meta-signal: all three of these are uncomfortable. That's how you distinguish real transformation from theater. Theater is CES keynotes and partnership announcements. Transformation is shipping products, publishing real numbers, and making hard organizational decisions in public." },
    ],
  },
  {
    id: "hitachi",
    label: "Hitachi Gap",
    question: "Hitachi's Lumada drives 41% of revenue. Panasonic Go is at ~10%. Can the gap be closed?",
    answer: [
      { type: "bold", text: "The honest answer: Panasonic cannot replicate Hitachi's path. Lumada started in 2016 with a unified platform strategy. Panasonic is starting in 2025 with a fragmented conglomerate. But Panasonic has assets Hitachi didn't have." },
      { type: "heading", text: "Why copying Hitachi won't work:" },
      { type: "p", text: "Lumada succeeded because Hitachi had a simpler organizational structure, a head start of nearly a decade, and a CEO (Toshiaki Higashihara) who spent 7 years single-mindedly pivoting the company from infrastructure to digital. He divested the semiconductor business, sold Hitachi Metals, and reshaped the portfolio ruthlessly. Panasonic's operating company structure, with 8 quasi-independent units, makes this kind of top-down portfolio reshaping much harder." },
      { type: "heading", text: "What Panasonic has that Hitachi didn't:" },
      { type: "item", label: "Blue Yonder", text: "Hitachi built Lumada from scratch. Panasonic bought a market-leading AI platform for $8.5B. Blue Yonder's $1.42B in revenue is a foundation Hitachi didn't have at its equivalent stage." },
      { type: "item", label: "Anthropic partnership", text: "Hitachi partners with OpenAI and Google Cloud. Panasonic has a deeper, more exclusive relationship with Anthropic — named a 'global strategic partnership' with the President on stage. If managed well, this is a differentiated technology relationship." },
      { type: "item", label: "1 billion customer touchpoints", text: "Panasonic products are in over a billion homes. This is a data and distribution advantage that no amount of AI R&D can replicate. The question is whether Panasonic can build AI-powered services on top of this installed base." },
      { type: "heading", text: "The realistic play:" },
      { type: "p", text: "Don't try to build Lumada. Instead, build 3-4 domain-specific AI platforms: Blue Yonder (supply chain, already exists), an energy/infrastructure AI platform (data center services), a manufacturing AI platform (smart factory), and a consumer AI offering (Umi or its successor). Each can reach \u00A5200-500B independently. Combined, they approach the 30% target without requiring a single unified platform that the organizational structure won't support." },
      { type: "flag", text: "The deepest Hitachi lesson isn't about technology — it's about portfolio discipline. Hitachi divested businesses to fund the transformation. Panasonic is cutting 12,000 people and closing TV factories, but hasn't divested a major business unit. Until it does, the transformation is additive — and additive transformations in flat-revenue companies are a resource allocation knife fight." },
    ],
  },
  {
    id: "jobcuts",
    label: "Cuts + AI Paradox",
    question: "How do you deploy AI transformation while simultaneously cutting 12,000 jobs?",
    answer: [
      { type: "bold", text: "You can't pretend these are separate initiatives. Every employee sees them as the same thing: 'AI is replacing us.'" },
      { type: "p", text: "Kusumi took a 40% pay cut when the cuts were announced. That's a credibility signal. But the messaging from Panasonic so far treats the restructuring (cost reduction) and Panasonic Go (growth investment) as parallel tracks. Employees don't experience them as parallel — they experience them as 'the company is firing people and investing in robots.'" },
      { type: "heading", text: "The only honest approach:" },
      { type: "item", label: "Separate clearly which jobs AI replaces and which it transforms", text: "The 12,000 cuts are in 'sales and indirect departments, headquarters, and loss-making businesses.' Say that explicitly: these roles are being eliminated because the businesses they support are no longer viable — TVs, kitchen appliances. Don't let employees assume every job is at risk." },
      { type: "item", label: "Create visible redeployment paths", text: "For every 100 jobs cut, show 20-30 new roles created in AI-related functions. Retraining programs with guaranteed placement for people who complete them. Not a vague 'upskilling initiative' — specific job titles, specific teams, specific start dates." },
      { type: "item", label: "Sequence the cuts before the AI push", text: "Finish the restructuring — complete the cuts, close the factories, absorb the \u00A5180B charge — before asking the remaining employees to embrace AI transformation. Asking people to adopt new tools while their colleagues are being walked out is asking them to trust during a trust-destroying event. Let the wound close first." },
      { type: "item", label: "Make the surviving divisions visibly invest in people", text: "Connect, Energy, and Industry are growing. Announce hiring in these divisions at the same time as cuts in Lifestyle. The narrative becomes 'we're shifting investment from declining businesses to growing ones' — not 'we're cutting costs.'" },
      { type: "flag", text: "The uncomfortable truth: Panasonic probably can't do sequencing — the \u00A5600B profit target requires both the cost savings from cuts AND the revenue growth from AI, simultaneously. This means employees will experience the paradox directly. The only thing worse than the paradox is pretending it doesn't exist." },
    ],
  },
];

function AnswerBlock({ item }) {
  if (item.type === "bold") return (
    <div style={{ fontSize: 14, fontWeight: 700, color: C.text, lineHeight: 1.7, margin: "14px 0" }}>{item.text}</div>
  );
  if (item.type === "p") return (
    <div style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.75, margin: "10px 0" }}>{item.text}</div>
  );
  if (item.type === "heading") return (
    <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: 2, marginTop: 20, marginBottom: 10, textTransform: "uppercase" }}>{item.text}</div>
  );
  if (item.type === "item") return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 6,
      padding: "12px 16px",
      margin: "8px 0",
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{item.label}</div>
      <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.65 }}>{item.text}</div>
    </div>
  );
  if (item.type === "flag") return (
    <div style={{
      background: C.redDim,
      border: `1px solid ${C.red}25`,
      borderLeft: `3px solid ${C.red}`,
      borderRadius: "0 6px 6px 0",
      padding: "12px 16px",
      margin: "16px 0",
    }}>
      <span style={{ color: C.red, fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: 1.5, fontWeight: 700 }}>&#9888; KEY RISK</span>
      <div style={{ fontSize: 13, color: C.text, lineHeight: 1.65, marginTop: 6 }}>{item.text}</div>
    </div>
  );
  return null;
}

export default function PanasonicAdvisor() {
  const [activeQ, setActiveQ] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);

  return (
    <div style={{
      background: C.bg,
      minHeight: "100vh",
      fontFamily: "'Newsreader', 'Georgia', serif",
      color: C.text,
      opacity: loaded ? 1 : 0,
      transition: "opacity 0.5s ease",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${C.border}`,
        padding: "20px 28px 16px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: 3, color: C.accent, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", marginBottom: 6 }}>
              Transformation Strategy Advisor
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, margin: 0, lineHeight: 1.2 }}>
              Panasonic Go — Strategic Questions
            </h1>
            <div style={{ fontSize: 14, color: C.textMuted, fontStyle: "italic", marginTop: 6 }}>
              12 questions a transformation leader should be asking right now
            </div>
          </div>
          <div style={{ fontSize: 10, color: C.textDim, fontFamily: "'JetBrains Mono', monospace", textAlign: "right" }}>
            humaninthelead.ai<br/>Public data only
          </div>
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 100px)" }}>
        {/* Left: question nav */}
        <div style={{
          width: 240,
          borderRight: `1px solid ${C.border}`,
          padding: "16px 0",
          flexShrink: 0,
          overflowY: "auto",
        }}>
          {QUESTIONS.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setActiveQ(i)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                background: activeQ === i ? C.accentDim : "transparent",
                border: "none",
                borderLeft: activeQ === i ? `3px solid ${C.accent}` : "3px solid transparent",
                padding: "10px 16px 10px 14px",
                color: activeQ === i ? C.accent : C.textMuted,
                fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace",
                cursor: "pointer",
                transition: "all 0.12s",
                letterSpacing: 0.2,
              }}
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Right: content */}
        <div style={{ flex: 1, padding: "24px 32px", overflowY: "auto" }}>
          {activeQ === null ? (
            <div>
              <div style={{
                fontSize: 15,
                color: C.textMuted,
                lineHeight: 1.8,
                marginBottom: 28,
                maxWidth: 580,
              }}>
                Pick a strategic question from the left. Each one is grounded in the Panasonic Go research — business units, leadership, financials, cultural dynamics, and peer benchmarks.
              </div>

              {/* Stat bar */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                marginBottom: 28,
              }}>
                {[
                  { v: "\u00A58.5T", l: "Revenue (flat)", c: C.textMuted },
                  { v: "30%", l: "AI target by 2035", c: C.accent },
                  { v: "12,000", l: "Jobs cut", c: C.red },
                  { v: "18 mo", l: "Critical window", c: C.red },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: "center", padding: "16px 8px" }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: s.c, fontFamily: "'JetBrains Mono', monospace" }}>{s.v}</div>
                    <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>{s.l}</div>
                  </div>
                ))}
              </div>

              {/* Grid of all questions */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}>
                {QUESTIONS.map((q, i) => (
                  <button
                    key={q.id}
                    onClick={() => setActiveQ(i)}
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                      borderRadius: 8,
                      padding: "14px 16px",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>{q.label}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>{q.question}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {/* Question */}
              <div style={{
                fontSize: 18,
                fontWeight: 700,
                lineHeight: 1.5,
                marginBottom: 24,
                color: C.text,
                maxWidth: 640,
              }}>
                {QUESTIONS[activeQ].question}
              </div>

              {/* Answer */}
              <div style={{ maxWidth: 660 }}>
                {QUESTIONS[activeQ].answer.map((item, i) => (
                  <AnswerBlock key={i} item={item} />
                ))}
              </div>

              {/* Navigate */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 32,
                paddingTop: 16,
                borderTop: `1px solid ${C.border}`,
              }}>
                <button
                  onClick={() => setActiveQ(activeQ > 0 ? activeQ - 1 : QUESTIONS.length - 1)}
                  style={{
                    background: "transparent",
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    padding: "8px 16px",
                    color: C.textMuted,
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                    cursor: "pointer",
                  }}
                >
                  &larr; {QUESTIONS[activeQ > 0 ? activeQ - 1 : QUESTIONS.length - 1].label}
                </button>
                <button
                  onClick={() => setActiveQ(activeQ < QUESTIONS.length - 1 ? activeQ + 1 : 0)}
                  style={{
                    background: "transparent",
                    border: `1px solid ${C.accent}40`,
                    borderRadius: 6,
                    padding: "8px 16px",
                    color: C.accent,
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                    cursor: "pointer",
                  }}
                >
                  {QUESTIONS[activeQ < QUESTIONS.length - 1 ? activeQ + 1 : 0].label} &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: `1px solid ${C.border}`,
        padding: "12px 28px",
        display: "flex",
        justifyContent: "space-between",
      }}>
        <div style={{ fontSize: 10, color: C.textDim }}>
          Built by Christian Spetz — <span style={{ color: C.accent }}>humaninthelead.ai</span>
        </div>
        <div style={{ fontSize: 9, color: C.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
          Based on public information only
        </div>
      </div>
    </div>
  );
}
