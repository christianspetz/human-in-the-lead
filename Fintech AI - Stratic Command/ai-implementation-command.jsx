import { useState, useEffect, useCallback, useRef } from "react";

const CLIENTS = {
  banking: { name: "Meridian National Bank", vertical: "Banking", tier: "Tier 1", revenue: "$4.2M ARR", logo: "🏦", desc: "Top-20 US bank, 18M retail accounts. Exploring AI for fraud detection, credit decisioning, and customer service automation." },
  payments: { name: "VelocityPay", vertical: "Payments", tier: "Tier 1", revenue: "$2.8M ARR", logo: "⚡", desc: "High-growth payment processor handling 2B+ transactions/year. Needs real-time AI risk scoring and merchant analytics." },
  wealth: { name: "Apex Wealth Advisors", vertical: "Wealth Management", tier: "Tier 2", revenue: "$1.9M ARR", logo: "📈", desc: "RIA platform serving 400+ advisors. Wants AI-driven portfolio optimization and client engagement scoring." },
  insurance: { name: "Sentinel Insurance Group", vertical: "Insurance", tier: "Tier 1", revenue: "$3.1M ARR", logo: "🛡️", desc: "P&C carrier, $12B GWP. Focused on AI claims automation, underwriting models, and catastrophe risk prediction." },
  lending: { name: "CreditForge", vertical: "Lending", tier: "Tier 2", revenue: "$2.1M ARR", logo: "🔑", desc: "Digital lending platform, $8B originations. Needs AI credit scoring, adverse action explainability, and portfolio monitoring." },
};

const PORTFOLIOS = [
  { id: "alpha", name: "Enterprise Growth", clients: ["banking", "payments", "insurance"], desc: "High-revenue, high-complexity. Maximum enterprise exposure with demanding stakeholders." },
  { id: "beta", name: "Vertical Expansion", clients: ["banking", "wealth", "lending"], desc: "Credit-adjacent verticals with regulatory overlap. Strong product synergy potential." },
  { id: "gamma", name: "Platform Scale", clients: ["payments", "insurance", "lending"], desc: "Transaction-heavy portfolio. Scalability and real-time processing are paramount." },
];

const RANDOM_EVENTS = [
  { title: "Client Escalation", desc: "Your largest client's EVP of Technology emails the CEO directly, bypassing you, to complain about implementation delays. The CEO forwards it to you with 'Please handle.'", impact: { clientSat: -8, teamAlign: -5 }, icon: "🚨" },
  { title: "Competitor Acquisition", desc: "Your top competitor just acquired a compliance-AI startup. Three of your clients' procurement teams are requesting 'competitive landscape updates' — a buying signal that they're evaluating alternatives.", impact: { clientSat: -5, revenue: -3 }, icon: "⚔️" },
  { title: "Product Breakthrough", desc: "Your ML team achieves a 40% reduction in false positive rates on transaction monitoring. This is genuinely industry-leading. No one outside the company knows yet.", impact: { productInfluence: +5, implSuccess: +3 }, icon: "🧪" },
  { title: "Regulatory Shift", desc: "The OCC issues new guidance on AI model governance in banking, requiring explainability documentation for all AI-driven credit decisions. Two of your implementations are affected.", impact: { implSuccess: -6, clientSat: -4 }, icon: "⚖️" },
  { title: "Key Hire Departure", desc: "Your lead solutions architect — the one who knows every client's infrastructure — just gave two weeks' notice. They're going to a competitor.", impact: { teamAlign: -10, implSuccess: -5 }, icon: "🚪" },
  { title: "Surprise Budget Unlock", desc: "One of your clients just closed a strong quarter and their CFO has approved accelerated AI spend. They want to triple their implementation scope for next quarter.", impact: { revenue: +8, clientSat: +3 }, icon: "💰" },
  { title: "Industry Recognition", desc: "A major fintech analyst firm wants to feature your company's implementation methodology in their annual report. They need a client willing to be a reference.", impact: { productInfluence: +5 }, icon: "🏆" },
  { title: "Data Breach Scare", desc: "A fintech company in your space (not you) suffers a major data breach. Your clients' CISOs are now demanding emergency security reviews of all AI integrations.", impact: { clientSat: -6, implSuccess: -4 }, icon: "🔒" },
];

const QUARTERS = [
  {
    name: "Q1",
    title: "Onboarding & Discovery",
    subtitle: "Establish relationships, assess technical landscapes, set the foundation.",
    scenarios: [
      {
        id: "q1s1",
        title: "The Custom Build Request",
        context: "Your Tier 1 banking client's Chief Digital Officer pulls you aside after a roadmap presentation. They want a custom AI solution for real-time sanctions screening that would take your product in a fundamentally new direction — moving from batch processing to streaming inference. It's a $1.8M expansion opportunity, but your platform wasn't designed for this.",
        options: [
          { label: "Accept the Custom Build", desc: "Commit to building it. The revenue is significant and it deepens the relationship. You'll need to pull 3 engineers off the core roadmap for 2 quarters.", impact: { revenue: +12, productInfluence: -5, teamAlign: -8, clientSat: +6, implSuccess: -4 }, playbook: "High risk. Custom builds create technical debt and set precedents. Other clients will expect the same treatment. Revenue is real but margin-destructive." },
          { label: "Redirect to Existing Capabilities", desc: "Show them how your current batch processing with near-real-time webhooks can meet 90% of their requirements. Position the gap as a future roadmap item.", impact: { revenue: -3, productInfluence: +2, teamAlign: +5, clientSat: -4, implSuccess: +6 }, playbook: "Efficient but risks being perceived as inflexible. Works if your existing capability genuinely meets their SLA. Document the gap for product." },
          { label: "Propose Co-Development Partnership", desc: "Structure a joint development agreement where they fund 60% of the build, you retain IP, and it becomes a platform capability. Requires legal, longer timeline, executive buy-in on both sides.", impact: { revenue: +5, productInfluence: +10, teamAlign: +2, clientSat: +2, implSuccess: -2 }, playbook: "Strategically optimal but execution-heavy. Co-development only works with a client who has patience and a genuine partnership mindset. Get the terms right." },
          { label: "Bring Engineering to the Table", desc: "Arrange a technical deep-dive between your engineering leads and their architecture team. Let the engineers scope it together before making any commitment.", impact: { revenue: +2, productInfluence: +4, teamAlign: +8, clientSat: +3, implSuccess: +3 }, playbook: "Strong move. Engineers talking to engineers often uncovers that the actual need is simpler than the exec framing. Builds trust across organizations." },
        ],
      },
      {
        id: "q1s2",
        title: "The Skeptical CTO",
        context: "Your biggest client's CTO, a 25-year banking technology veteran, is openly skeptical about AI accuracy in their fraud detection workflow. In a steering committee meeting, she says: 'I've seen three AI vendors come through here. The models work in the lab and fail in production. Show me why you're different.' The room goes quiet. Your client champion (the VP of Digital) looks nervous.",
        options: [
          { label: "Propose a Shadow Deployment", desc: "Suggest running your AI model alongside their existing rules engine for 90 days. No production impact, full transparency on comparative performance. Let the data speak.", impact: { clientSat: +8, implSuccess: +5, revenue: -2, productInfluence: +3, teamAlign: +2 }, playbook: "Best practice for skeptical stakeholders. Shadow deployments are low-risk proof points. The 90-day timeline is long but builds genuine trust. Make sure you're measuring the right metrics." },
          { label: "Present Case Studies & Benchmarks", desc: "Share anonymized results from similar implementations — false positive reduction rates, processing time improvements, and audit findings. Frame it as evidence, not a pitch.", impact: { clientSat: +3, implSuccess: +2, revenue: +1, productInfluence: +1, teamAlign: 0 }, playbook: "Necessary but insufficient alone. Case studies help but a technical CTO wants to see performance on THEIR data. Use this as a complement to, not a substitute for, a proof-of-concept." },
          { label: "Invite Her to Your R&D Lab", desc: "Offer an exclusive half-day at your R&D facility. Let her meet your ML team, see the training pipeline, review model governance. Make it technical, not commercial.", impact: { clientSat: +6, implSuccess: +3, revenue: 0, productInfluence: +6, teamAlign: +4 }, playbook: "High-impact relationship move. Technical leaders respect transparency. This also gives your ML team direct access to her domain expertise. Expensive in time but high-ROI." },
          { label: "Acknowledge the Concern Directly", desc: "Say: 'You're right to be skeptical. Most AI in fraud detection underperforms because vendors optimize for demo metrics, not production realities. Here's what we do differently...' Then walk through your model monitoring and drift detection framework.", impact: { clientSat: +5, implSuccess: +4, revenue: +2, productInfluence: +2, teamAlign: +1 }, playbook: "Emotionally intelligent. Validating her concern disarms the room. But you need to back it up with substance — the 'here's what we do differently' better be genuinely different." },
        ],
      },
      {
        id: "q1s3",
        title: "The Impossible Timeline",
        context: "Your sales team closed a deal with a payment processor that includes a 12-week implementation timeline for real-time risk scoring integration. Your engineering lead just told you it's a 20-week effort minimum — the client's API gateway is a custom-built legacy system that requires significant adapter work. The client's go-live date is tied to a regulatory deadline. Sales is already celebrating the commission.",
        options: [
          { label: "Negotiate a Phased Approach", desc: "Go back to the client with a proposal: Phase 1 (12 weeks) delivers core risk scoring via a simplified integration path. Phase 2 (8 weeks) completes the full API gateway integration. Be transparent about what each phase delivers.", impact: { clientSat: +2, implSuccess: +7, revenue: +1, teamAlign: +6, productInfluence: +1 }, playbook: "The professional answer. Phased delivery protects your team while keeping the client's regulatory deadline. The key is making Phase 1 genuinely valuable, not a half-baked MVP." },
          { label: "Commit and Surge Resources", desc: "Pull engineers from other projects, bring in contractors, run extended sprints. Meet the 12-week deadline. Deal with the burnout and project disruption later.", impact: { clientSat: +6, implSuccess: -3, revenue: +4, teamAlign: -10, productInfluence: -3 }, playbook: "Dangerous. Hero culture wins short-term but destroys team morale and other client timelines. If you do this, you'll spend Q2 cleaning up the damage." },
          { label: "Escalate to CRO", desc: "Bring the timeline gap to the Chief Revenue Officer. Frame it as: 'Sales made a commitment engineering can't deliver. We need to either renegotiate or significantly increase resourcing. Here's the cost of each option.'", impact: { clientSat: -2, implSuccess: +3, revenue: -1, teamAlign: +4, productInfluence: +2 }, playbook: "Mature move that addresses the systemic issue (sales-engineering misalignment). But be careful — you need to come with solutions, not just problems. CROs don't like being the arbitrator." },
          { label: "Find a Technical Shortcut", desc: "Your team has an experimental middleware layer that could bypass the legacy API gateway issue. It's not fully tested in production, but it could shave 6 weeks off the timeline. Higher risk, but potentially a win-win.", impact: { clientSat: +4, implSuccess: -5, revenue: +3, teamAlign: -2, productInfluence: +3 }, playbook: "High-variance play. If it works, you're a genius. If it fails in production, you've created a crisis. Acceptable only if you have a solid rollback plan and the client understands the risk." },
        ],
      },
      {
        id: "q1s4",
        title: "The Competitor Feature",
        context: "Your top client just sent you a link to your competitor's press release. They've launched 'InstantExplain' — an AI explainability layer for credit decisions that generates plain-language adverse action notices automatically. Your client's head of lending writes: 'When will you have this? Our compliance team is very interested.' Your product team has this on the H2 roadmap, but it's 6+ months away.",
        options: [
          { label: "Accelerate the Roadmap", desc: "Go to your CPO and make the case to pull explainability forward. Use the client request as ammunition. Risk: other roadmap items get deprioritized.", impact: { clientSat: +5, productInfluence: +8, revenue: +2, teamAlign: -4, implSuccess: -2 }, playbook: "This is exactly how client-facing leaders should influence roadmaps — with concrete demand signals. But be honest about what gets delayed. Don't just add; explicitly trade off." },
          { label: "Downplay and Differentiate", desc: "Respond with: 'We've evaluated approaches like InstantExplain. Our architecture takes a fundamentally different approach to explainability that's more robust for regulatory scrutiny. Let me walk you through our roadmap.' Buy time by emphasizing your strengths.", impact: { clientSat: -2, productInfluence: +1, revenue: 0, teamAlign: +2, implSuccess: +1 }, playbook: "Risky if the client sees through it. Only works if you genuinely have a differentiated approach. If you're just stalling, it'll erode trust when they find out." },
          { label: "Partner or Integrate", desc: "Explore whether a third-party explainability tool can be integrated into your platform as a bridge solution. It's not your IP, but it solves the client's immediate need while your own solution matures.", impact: { clientSat: +4, productInfluence: -3, revenue: -1, teamAlign: +1, implSuccess: +4 }, playbook: "Pragmatic. Shows the client you prioritize their needs over your ego. But be careful about creating dependency on a third-party that might become a competitor." },
          { label: "Turn It Into Intelligence", desc: "Use this as a catalyst: survey all your clients about explainability needs. Bring the aggregated demand data to the product team. Frame it as a market signal, not a single client request.", impact: { clientSat: +1, productInfluence: +6, revenue: +1, teamAlign: +5, implSuccess: 0 }, playbook: "The most strategic play. Individual client requests are anecdotes; aggregated demand data is a business case. This is exactly the 'voice of the client' translation the role requires." },
        ],
      },
    ],
  },
  {
    name: "Q2",
    title: "Implementation & Delivery",
    subtitle: "Navigate technical challenges, scope changes, and cross-functional friction.",
    scenarios: [
      {
        id: "q2s1",
        title: "The Requirements Shift",
        context: "You're 8 weeks into a 16-week fraud detection implementation for your banking client. Their new Chief Risk Officer (hired 3 weeks ago) just redefined the success criteria. Originally: reduce false positives by 30%. Now: achieve 99.7% precision on SAR-reportable transactions while maintaining the false positive target. This is a fundamentally harder problem that requires retraining your models on their specific regulatory filing patterns.",
        options: [
          { label: "Absorb the Change", desc: "Accept the new requirements. Your ML team can retrain the models, but it adds 6 weeks and significant compute costs. Don't charge the client — treat it as investment in the relationship.", impact: { clientSat: +8, implSuccess: -4, revenue: -5, teamAlign: -6, productInfluence: +2 }, playbook: "Generous but sets a bad precedent. Every new executive at the client will feel empowered to redefine success mid-stream. You need a change management framework." },
          { label: "Scope It as Phase 2", desc: "Acknowledge the CRO's requirements as valid and important. Propose completing the original scope on time, then scoping the SAR precision work as a separate Phase 2 engagement with its own SOW and timeline.", impact: { clientSat: +2, implSuccess: +6, revenue: +4, teamAlign: +5, productInfluence: +1 }, playbook: "Textbook scope management. Protects your team, captures additional revenue, and still validates the CRO's priorities. The risk is the CRO seeing it as a delay tactic." },
          { label: "Negotiate the Trade-off", desc: "Present the technical trade-off directly to the CRO: 'We can hit 99.7% SAR precision OR the 30% false positive reduction in the current timeline, but not both simultaneously. Which is your priority?' Force a decision.", impact: { clientSat: -1, implSuccess: +4, revenue: +1, teamAlign: +3, productInfluence: +3 }, playbook: "Honest and technically sound. But be careful — new CROs often want to prove they're raising the bar. Forcing a choice might feel like you're pushing back on their authority." },
          { label: "Bring in Your Chief Data Scientist", desc: "Arrange a working session between your Chief Data Scientist and the client's CRO. Let them jointly design the evaluation framework. This becomes a technical collaboration, not a scope negotiation.", impact: { clientSat: +5, implSuccess: +2, revenue: +1, teamAlign: +2, productInfluence: +6 }, playbook: "Elegant move. Executive-to-executive technical conversations often reveal that the real requirement is narrower than the stated one. Also builds your product influence through direct R&D-client interaction." },
        ],
      },
      {
        id: "q2s2",
        title: "The Integration Crisis",
        context: "A critical data integration between your AI platform and your payment client's core processing system is failing intermittently. Transactions are timing out 15% of the time. The client's VP of Engineering says your API is unstable. Your engineering team's logs show the client's system is sending malformed payloads and their connection pool is undersized. Both sides are escalating. The client has a board meeting in 2 weeks and planned to present the AI implementation as a success story.",
        options: [
          { label: "War Room — Joint Investigation", desc: "Propose an immediate joint war room with engineers from both sides. Share your logs openly. Agree to a shared incident report. Solve it together, attribute blame nowhere.", impact: { clientSat: +4, implSuccess: +7, teamAlign: +6, revenue: 0, productInfluence: +2 }, playbook: "Best practice for integration issues. Joint war rooms eliminate finger-pointing and solve problems faster. The shared incident report becomes a trust artifact." },
          { label: "Fix It Quietly on Your Side", desc: "Have your team build defensive coding around the malformed payloads and implement retry logic. Don't surface the root cause to the client. Just make it work.", impact: { clientSat: +6, implSuccess: +3, teamAlign: -4, revenue: +2, productInfluence: -2 }, playbook: "Short-term expedient. Your engineers will resent absorbing the client's technical debt. And the underlying issue will resurface at scale. But it protects the board meeting narrative." },
          { label: "Escalate with Data", desc: "Send a detailed technical analysis to the client's CTO (above the VP) showing the payload issues with timestamps and log evidence. Professional, factual, but clearly identifying the root cause on their side.", impact: { clientSat: -4, implSuccess: +4, teamAlign: +5, revenue: -1, productInfluence: +1 }, playbook: "Necessary when the VP is being unreasonable, but going over someone's head is a relationship risk. Frame it as 'mutual accountability' and include any issues on your side too." },
          { label: "Offer a Dedicated Integration Engineer", desc: "Embed one of your senior engineers at the client site for 2 weeks to work directly with their team. Frame it as 'acceleration support,' not troubleshooting. You eat the cost.", impact: { clientSat: +7, implSuccess: +5, teamAlign: -3, revenue: -3, productInfluence: +3 }, playbook: "High-touch and expensive, but creates deep technical relationship. Your embedded engineer will learn things about the client's infrastructure that make future implementations smoother." },
        ],
      },
      {
        id: "q2s3",
        title: "The Pattern Recognition Opportunity",
        context: "In your monthly portfolio review, you notice something: three clients — across banking, payments, and lending — have independently requested similar capabilities around transaction pattern analysis for anomaly detection. Each framed it differently (fraud, compliance, credit risk), but the underlying ML architecture would be identical. Your product team hasn't connected these dots. Engineering is already at 110% capacity on current commitments.",
        options: [
          { label: "Write the Internal Business Case", desc: "Document the pattern formally. Quantify the combined TAM across all three verticals. Present it to the CPO and CTO as a platform capability, not three custom builds. Include projected revenue and competitive positioning.", impact: { productInfluence: +10, teamAlign: +4, revenue: +3, clientSat: +2, implSuccess: -1 }, playbook: "This is THE Principal-level move. Translating client patterns into platform strategy is exactly what separates this role from a solutions engineer. The business case is your artifact of influence." },
          { label: "Solve It for One Client First", desc: "Build it for your highest-value client as a custom solution. Learn from the implementation, then productize it for the other two. Pragmatic, lower risk, but slower.", impact: { productInfluence: +3, teamAlign: +1, revenue: +5, clientSat: +4, implSuccess: +3 }, playbook: "Common approach but leaves money on the table. The first client gets custom treatment (expensive), and the other two wait. Also risks the first client feeling like a guinea pig." },
          { label: "Propose a Client Advisory Board", desc: "Invite all three clients to a confidential product advisory session on anomaly detection. Let them share use cases (within compliance boundaries). Use the collective input to design the feature. Clients feel heard; you get validated requirements.", impact: { productInfluence: +8, clientSat: +6, revenue: +2, teamAlign: +2, implSuccess: 0 }, playbook: "Sophisticated play. Client advisory boards create buy-in and reduce product risk. The challenge is managing competitive dynamics — banking and lending clients may not want to share insights in the same room." },
          { label: "Hire to Solve It", desc: "Make the case to hire 2 additional ML engineers dedicated to this cross-vertical capability. It's a $500K+ investment, but it unblocks the roadmap without pulling from existing projects.", impact: { productInfluence: +5, teamAlign: +6, revenue: -2, clientSat: +1, implSuccess: +4 }, playbook: "Strategic if you can get budget approval. The risk is time-to-hire in a competitive ML talent market. 2 engineers won't be productive for 3-4 months. But it's the right structural answer." },
        ],
      },
      {
        id: "q2s4",
        title: "The Compliance Curveball",
        context: "Your lending client's compliance team has flagged a concern: your AI credit scoring model may produce disparate impact across protected classes under ECOA and fair lending regulations. They're not saying it does — they're saying they can't prove it doesn't, because your model explainability documentation doesn't meet their regulatory standard. They want to pause the implementation until you can provide adverse impact testing results and model documentation that satisfies their examiner.",
        options: [
          { label: "Pause and Remediate", desc: "Accept the pause. Dedicate your fairness and compliance team to producing a comprehensive Model Risk Management (MRM) package including disparate impact analysis, feature attribution reports, and examiner-ready documentation. Timeline: 4-6 weeks.", impact: { implSuccess: -6, clientSat: +3, productInfluence: +5, teamAlign: +2, revenue: -3 }, playbook: "The right call. Regulatory risk is existential for lending clients. A 4-6 week pause is far better than an enforcement action. Plus, the MRM package becomes a reusable asset for every lending client." },
          { label: "Bring in Outside Counsel", desc: "Engage a specialized AI regulatory law firm to independently validate your model and produce a legal opinion. More expensive but carries more weight with examiners and the client's board.", impact: { implSuccess: -3, clientSat: +5, productInfluence: +3, teamAlign: 0, revenue: -4 }, playbook: "Strong for high-stakes lending implementations. Third-party validation is a powerful risk mitigant. The cost is significant but positions you as taking regulatory compliance as seriously as the client does." },
          { label: "Challenge the Premise", desc: "Present your existing bias testing methodology to the compliance team. Show that you already test for disparate impact using industry-standard approaches (BISG proxying, marginal effect analysis). Argue that your documentation meets SR 11-7 standards.", impact: { implSuccess: +2, clientSat: -3, productInfluence: +1, teamAlign: +3, revenue: +2 }, playbook: "Only works if your existing methodology is genuinely robust. If the compliance team feels you're dismissing their concerns, you'll lose trust permanently. Know your audience." },
          { label: "Propose a Regulatory Sandbox", desc: "Suggest running the model in a monitoring-only mode within a controlled population segment. No credit decisions are made by the AI — it runs in parallel with human decisioning. Collect demographic performance data for 60 days to build the evidence base.", impact: { implSuccess: +1, clientSat: +4, productInfluence: +6, teamAlign: +1, revenue: -1 }, playbook: "Clever approach that keeps the implementation moving forward while building the compliance evidence. The client's examiners will likely view a sandbox positively. Takes longer but de-risks everything." },
        ],
      },
      {
        id: "q2s5",
        title: "The Resource Contention",
        context: "Two of your clients need the same specialist — your senior NLP engineer who is the only person on the team with production experience in financial document understanding. Client A (insurance) needs her for claims automation NLP. Client B (banking) needs her for regulatory document parsing. Both implementations are on critical path. She can't be in two places at once, and there's no one else with her skillset.",
        options: [
          { label: "Prioritize by Revenue Impact", desc: "Assign her to whichever client represents more ARR and expansion potential. Be transparent with the other client about the delay and offer a revised timeline with a concrete plan.", impact: { revenue: +5, clientSat: -3, teamAlign: +2, implSuccess: +1, productInfluence: 0 }, playbook: "Rational but cold. Revenue-based prioritization is defensible internally but the deprioritized client will feel like a second-class citizen. Have a genuine mitigation plan ready." },
          { label: "Split Her Time 50/50", desc: "Have her alternate weeks between projects. Context-switching is expensive, but both clients see progress. Neither gets ideal velocity.", impact: { revenue: +1, clientSat: 0, teamAlign: -4, implSuccess: -3, productInfluence: 0 }, playbook: "The worst option disguised as fairness. Context-switching destroys engineering productivity. Both projects will be late and she'll burn out. Avoid this." },
          { label: "Upskill a Junior Engineer", desc: "Pair a promising junior engineer with your senior NLP specialist for an intensive 2-week knowledge transfer. Then the junior takes one project with close mentorship. Longer ramp but builds team capacity.", impact: { revenue: -1, clientSat: +1, teamAlign: +8, implSuccess: -2, productInfluence: +2 }, playbook: "Best long-term answer. Single points of failure in engineering are a strategic risk. The short-term cost is real, but you're building resilience. This is leadership, not just resource management." },
          { label: "Outsource One Project", desc: "Bring in a specialized NLP consulting firm to handle one of the implementations under your team's architectural guidance. Faster than upskilling, but more expensive and you lose some quality control.", impact: { revenue: -3, clientSat: +3, teamAlign: -1, implSuccess: +2, productInfluence: -2 }, playbook: "Pragmatic if you have a trusted consulting partner. The risk is quality — consultants who don't know your platform will make architectural choices you'll regret. Heavy oversight required." },
        ],
      },
    ],
  },
  {
    name: "Q3",
    title: "Scale & Influence",
    subtitle: "Leverage momentum, shape strategy, navigate organizational dynamics.",
    scenarios: [
      {
        id: "q3s1",
        title: "The Breakthrough Dilemma",
        context: "Your R&D team just demonstrated something remarkable: a new approach to real-time transaction analysis that reduces inference latency by 80% while improving accuracy. This is potentially a market-defining capability. Your CPO is excited. Your CEO wants to announce it. You have to decide: who sees this first?",
        options: [
          { label: "Exclusive Preview to Top Client", desc: "Give your highest-value banking client first access. Frame it as a strategic partnership benefit. They become the reference customer and deepen their commitment. Other clients hear about it through the grapevine.", impact: { clientSat: +8, revenue: +6, productInfluence: +4, teamAlign: +1, implSuccess: +2 }, playbook: "Strong relationship play. Exclusive access creates loyalty and a compelling reference story. Risk: other clients feel deprioritized. Manage expectations carefully with the rest of the portfolio." },
          { label: "Launch at Money20/20", desc: "Save it for the industry's biggest fintech conference. Your CEO presents it as a keynote-worthy announcement. Maximum market impact, establishes thought leadership, creates inbound pipeline.", impact: { clientSat: -2, revenue: +3, productInfluence: +10, teamAlign: +3, implSuccess: 0 }, playbook: "Best for market positioning and brand. But your existing clients might be annoyed they heard about it at a conference instead of from you. Brief them before the announcement." },
          { label: "Quiet Rollout to All Clients", desc: "Roll it into your platform as a feature update. No fanfare — just deliver value. Let the performance improvement speak for itself in client QBRs.", impact: { clientSat: +4, revenue: +1, productInfluence: -2, teamAlign: +5, implSuccess: +6 }, playbook: "Humble and client-centric. But you're leaving enormous marketing and positioning value on the table. Breakthroughs that aren't communicated don't influence the market." },
          { label: "Beta Program with Design Partners", desc: "Select 2-3 clients across different verticals as design partners. They get early access in exchange for detailed feedback and performance data. Use their production results to validate before general release.", impact: { clientSat: +5, revenue: +2, productInfluence: +6, teamAlign: +4, implSuccess: +4 }, playbook: "The most rigorous approach. Design partners provide real-world validation that strengthens the product and creates multiple reference stories. Takes longer but reduces launch risk." },
        ],
      },
      {
        id: "q3s2",
        title: "The Churn Threat",
        context: "Your insurance client's newly appointed COO calls you directly. She's blunt: 'I've been reviewing our vendor portfolio. Your platform is expensive and we're only using 40% of what we're paying for. I have a competitor proposal that's 30% cheaper. I need you to either match the price or give me a compelling reason to stay within 2 weeks.' Your contract renews in 45 days.",
        options: [
          { label: "Defend on Value, Not Price", desc: "Request a meeting with the COO and bring detailed ROI analysis: claims processing time reduction, accuracy improvements, and cost avoidance metrics. Show that the 40% they're not using represents untapped value, and propose an activation plan.", impact: { clientSat: +3, revenue: +2, productInfluence: +2, implSuccess: +3, teamAlign: +1 }, playbook: "The right first move. Never lead with price concessions. But the ROI analysis better be compelling and specific to their business outcomes. Generic TCO comparisons won't cut it with a COO." },
          { label: "Offer a Restructured Deal", desc: "Propose a revised contract: lower the base price by 15%, but add usage-based pricing that captures value as they expand. Include a 90-day adoption program to activate the unused capabilities. You protect the relationship while creating expansion upside.", impact: { clientSat: +6, revenue: -3, productInfluence: 0, implSuccess: +1, teamAlign: +2 }, playbook: "Commercially sophisticated. Usage-based pricing aligns incentives and the adoption program shows commitment. The 15% discount is real revenue loss but retention is usually worth it." },
          { label: "Call Her Bluff", desc: "Respond professionally but don't panic. A 30% cheaper competitor is likely comparing apples to oranges. Ask for a detailed feature comparison. Let the 2-week timeline play out — procurement decisions at insurance companies take months, not weeks.", impact: { clientSat: -5, revenue: +4, productInfluence: +1, implSuccess: 0, teamAlign: +3 }, playbook: "Bold but dangerous. If you're right that the competitor can't match your capabilities, you win. If you're wrong, you've just lost a $3M+ client by being arrogant." },
          { label: "Escalate to Your CEO", desc: "Brief your CEO and propose a joint executive meeting: your CEO to their CEO. Reframe the conversation from a vendor review to a strategic partnership discussion. Executives talk about vision, not pricing.", impact: { clientSat: +4, revenue: +1, productInfluence: +3, implSuccess: 0, teamAlign: -2 }, playbook: "Powerful escalation if your CEO is good at these conversations. CEO-to-CEO meetings reset the framing. But it also signals to your CEO that you couldn't handle a retention situation at your level." },
        ],
      },
      {
        id: "q3s3",
        title: "The Board Presentation",
        context: "Your CEO asks you to present the 'Voice of the Client' at the next board meeting. You have 15 minutes. The board wants to understand: What are enterprise fintech clients actually asking for? Where should the company invest? You have dozens of client requests, but they range from tactical feature asks to strategic platform shifts. Some conflict with each other. The board includes two former bank CEOs and a prominent fintech VC.",
        options: [
          { label: "Synthesize into 3 Themes", desc: "Distill all client feedback into three strategic themes: (1) Regulatory AI governance, (2) Real-time decisioning infrastructure, (3) Cross-channel intelligence. Map each theme to market size, client demand intensity, and your competitive position.", impact: { productInfluence: +10, teamAlign: +5, clientSat: +2, revenue: +3, implSuccess: +1 }, playbook: "Textbook executive communication. Board members think in themes, not feature lists. Three is the right number — memorable and actionable. Back each with 2-3 specific client examples." },
          { label: "Lead with Client Stories", desc: "Tell three compelling client narratives — the transformation journey, the problem solved, the business impact delivered. Use these stories to illustrate what the market needs and where the company should invest.", impact: { productInfluence: +7, clientSat: +5, revenue: +2, teamAlign: +2, implSuccess: +2 }, playbook: "Emotionally compelling, especially for a board with former operators. Stories create conviction in ways that data alone can't. But make sure the stories map to strategic priorities, not just feel-good wins." },
          { label: "Present the Data", desc: "Show aggregated NPS, feature request frequency analysis, pipeline composition by vertical, and revenue concentration metrics. Let the data reveal the patterns. Include a competitive positioning slide.", impact: { productInfluence: +5, teamAlign: +3, clientSat: 0, revenue: +4, implSuccess: +1 }, playbook: "Safe and professional. The VC board member will appreciate the analytical rigor. But pure data presentations rarely change minds at the board level. You need a narrative arc." },
          { label: "Be Provocative", desc: "Open with: 'Our clients are asking for the wrong things — and it's our job to know the difference.' Then present what clients are asking for vs. what the market actually needs. Argue for a contrarian R&D bet that no client has explicitly requested but data supports.", impact: { productInfluence: +12, teamAlign: -2, clientSat: -3, revenue: +1, implSuccess: 0 }, playbook: "High risk, high reward. If the board trusts you, this positions you as a strategic thinker, not just a client manager. If they don't, you look like you're not listening to customers. Know your audience." },
        ],
      },
      {
        id: "q3s4",
        title: "The Regulatory Earthquake",
        context: "The CFPB issues a sweeping new rule requiring all AI-driven financial decisions to include real-time explainability and consumer appeal mechanisms. Effective in 180 days. Your banking client needs full compliance (they're OCC-regulated). Your lending client is panicking (this directly affects their core product). Your payments client is less affected but worried about downstream liability. Your product team hasn't even started building appeal mechanism functionality.",
        options: [
          { label: "Emergency Client Briefings", desc: "Within 48 hours, hold individual briefings with each affected client. Present a preliminary impact assessment and a 90-day compliance roadmap. You don't have all the answers yet, but being first to brief them builds trust.", impact: { clientSat: +8, implSuccess: -2, productInfluence: +4, teamAlign: -1, revenue: +2 }, playbook: "Speed matters in regulatory events. Clients remember who showed up first with useful information. The roadmap doesn't need to be perfect — it needs to be credible and fast." },
          { label: "Form a Compliance Task Force", desc: "Stand up an internal cross-functional team: product, engineering, legal, and your client solutions team. Map every implementation against the new rule. Produce a company-wide response plan before communicating to clients.", impact: { clientSat: +2, implSuccess: +4, productInfluence: +6, teamAlign: +7, revenue: +1 }, playbook: "Thorough and systematic. But it takes time, and clients may hear from competitors first. The 48-72 hours you spend on internal alignment is 48-72 hours clients are wondering where you are." },
          { label: "Turn It Into Product Opportunity", desc: "Frame the regulation to your CPO as a massive product opportunity: every fintech company in the market needs explainability and appeal mechanisms. If you build it first, you own the compliance layer. Advocate for immediate R&D investment.", impact: { clientSat: +1, implSuccess: -1, productInfluence: +10, teamAlign: +3, revenue: +5 }, playbook: "Visionary thinking. Regulations create markets. The companies that build compliance infrastructure first capture the category. But your existing clients need help NOW — don't get so focused on the opportunity that you forget the fire." },
          { label: "Host an Industry Roundtable", desc: "Invite clients, prospects, and regulatory experts to a private roundtable on the new rule. Position your company as the convener and thought leader. Use the discussions to inform your product response.", impact: { clientSat: +5, implSuccess: 0, productInfluence: +8, teamAlign: +2, revenue: +3 }, playbook: "Power move for market positioning. Convening authority is a leadership signal. But it takes 2-3 weeks to organize, and your clients need guidance now. Do this AND the emergency briefings." },
        ],
      },
    ],
  },
  {
    name: "Q4",
    title: "Strategic Positioning",
    subtitle: "Plan for the future, secure your legacy, build sustainable advantage.",
    scenarios: [
      {
        id: "q4s1",
        title: "The R&D Investment Decision",
        context: "Annual planning. The CEO gives you 15 minutes to advocate for R&D investment direction. The company can make one major bet. Your clients' input and market analysis point to three options, each with different risk/reward profiles:",
        options: [
          { label: "Agentic AI for Financial Operations", desc: "Autonomous AI agents that can execute multi-step financial workflows: reconciliation, reporting, compliance checking. Massive TAM, early market, high technical risk. 2 of your clients have expressed strong interest. No competitor has a production offering.", impact: { productInfluence: +10, revenue: +4, clientSat: +3, teamAlign: -3, implSuccess: -2 }, playbook: "Highest upside but longest payoff timeline. Agentic AI in finance requires solving trust, auditability, and regulatory acceptance. First-mover advantage is real but so is first-mover risk." },
          { label: "Unified Risk Intelligence Platform", desc: "Consolidate fraud, credit, compliance, and market risk into a single AI-driven platform. Strong demand from 3 of your clients. Two competitors are building this. More predictable, less transformative.", impact: { productInfluence: +5, revenue: +7, clientSat: +6, teamAlign: +4, implSuccess: +3 }, playbook: "The safe bet that's still a good bet. Market demand is validated, technical feasibility is clear. You won't own the category but you'll be competitive. Sometimes the strategic answer is execution, not innovation." },
          { label: "Regulatory AI Co-Pilot", desc: "AI-powered regulatory compliance assistant that monitors rule changes, assesses impact, and recommends implementation steps. Every financial institution needs this. Moderate technical complexity. One client has offered to co-develop.", impact: { productInfluence: +7, revenue: +5, clientSat: +5, teamAlign: +5, implSuccess: +4 }, playbook: "The 'Goldilocks' option. Differentiated enough to win, practical enough to ship. The co-development offer from a client is a strong signal. This could become a wedge product for new verticals." },
          { label: "Present All Three with Framework", desc: "Don't advocate for one. Instead, present a decision framework: market timing, technical readiness, client demand, competitive landscape. Let the CEO and CTO make the call with full information. Your value is the analysis, not the opinion.", impact: { productInfluence: +3, revenue: +2, clientSat: +2, teamAlign: +6, implSuccess: +2 }, playbook: "Intellectually humble but potentially seen as indecisive. At the Principal level, leadership wants conviction. Frameworks are tools, not substitutes for judgment. Have a recommendation." },
        ],
      },
      {
        id: "q4s2",
        title: "The Exclusive Feature Demand",
        context: "Your most profitable client ($4.2M ARR) requests an exclusive feature: a custom AI model trained exclusively on their proprietary data that would give them a competitive advantage in credit decisioning. They'll pay $800K on top of their existing contract. Your product team says: 'Absolutely not — we don't build exclusives. Everything goes on the platform.' The client's CFO has already approved the budget and expects a proposal by Friday.",
        options: [
          { label: "Find the Middle Ground", desc: "Propose a 'private model environment' — a platform capability where any enterprise client can train models on their proprietary data within your infrastructure. The client gets what they need, it becomes a platform feature, product is happy.", impact: { clientSat: +6, revenue: +5, productInfluence: +8, teamAlign: +4, implSuccess: +2 }, playbook: "The golden answer — if you can architect it. Private model environments are a legitimate platform capability that serves the client's need without creating exclusivity. This is exactly the kind of client-to-product translation the role demands." },
          { label: "Side with Product", desc: "Tell the client that exclusive features aren't part of your model. Offer enhanced model customization within existing platform parameters. Risk losing the $800K and potentially the relationship.", impact: { clientSat: -6, revenue: -4, productInfluence: +3, teamAlign: +6, implSuccess: +2 }, playbook: "Principled but expensive. You need to be sure the $800K isn't worth the precedent. And you need to offer something compelling as an alternative, or you're just saying no." },
          { label: "Accept with a Sunset Clause", desc: "Build the exclusive feature with a 12-month exclusivity window. After 12 months, the capability (not the client's data) becomes available to the platform. Revenue now, platform value later.", impact: { clientSat: +7, revenue: +7, productInfluence: +2, teamAlign: -3, implSuccess: +1 }, playbook: "Commercially creative. Time-bounded exclusivity is a real business model (see: gaming, pharma). But 12 months is a long time in fintech — the capability might be obsolete or competitors will have built it." },
          { label: "Escalate the Decision", desc: "This is above your pay grade and you know it. Bring the full picture — client request, product pushback, revenue impact, strategic implications — to the CEO and let leadership make the call.", impact: { clientSat: +1, revenue: +1, productInfluence: -2, teamAlign: +3, implSuccess: +1 }, playbook: "Honest about organizational dynamics but potentially seen as abdication at the Principal level. Leaders should own decisions. If you escalate, come with a strong recommendation." },
        ],
      },
      {
        id: "q4s3",
        title: "The Year-End Framing",
        context: "End of fiscal year. You need to present your portfolio's annual impact to the CEO, the board, and internal stakeholders. You have strong results across multiple dimensions, but you can't lead with everything. You need to choose your narrative frame — it will shape how leadership thinks about your role, your team, and your function's budget next year.",
        options: [
          { label: "Lead with Revenue", desc: "Frame everything through financial impact: NRR, expansion revenue, pipeline generated, revenue protected through retention. Show that your function directly drives the P&L. Include client-level unit economics.", impact: { revenue: +10, clientSat: +1, productInfluence: -1, teamAlign: +2, implSuccess: +1 }, playbook: "Safe and universally understood. Revenue stories get budget. But if you're only a revenue story, you're a fancy account manager. The role is broader than that." },
          { label: "Lead with Product Influence", desc: "Show how your client insights directly shaped the product roadmap. Map features shipped to client conversations that inspired them. Demonstrate the feedback loop between field intelligence and R&D output.", impact: { revenue: +2, clientSat: +2, productInfluence: +10, teamAlign: +4, implSuccess: +2 }, playbook: "Unique and powerful positioning for this role. Most client-facing leaders can't draw this line. If you can show that your function makes the product better, you become indispensable — and very hard to replace." },
          { label: "Lead with Client Transformation", desc: "Tell the stories of how your clients' businesses changed. The bank that reduced fraud losses by $12M. The lender that expanded to new credit segments. Make it about their outcomes, not your metrics.", impact: { revenue: +3, clientSat: +8, productInfluence: +3, teamAlign: +1, implSuccess: +3 }, playbook: "Emotionally compelling and client-centric. Board members who are former operators love transformation stories. But make sure you connect client outcomes to company value." },
          { label: "Lead with Strategic Positioning", desc: "Zoom out. Show where the company sits in the competitive landscape because of the work your team did. Market intelligence gathered, competitive wins, category-defining implementations. Frame your function as the company's strategic antenna.", impact: { revenue: +1, clientSat: +3, productInfluence: +6, teamAlign: +3, implSuccess: +2 }, playbook: "Ambitious framing that positions you as a strategic leader, not just a functional leader. Works best if you have genuine competitive intelligence to share. Vague strategy talk without specifics will fall flat." },
        ],
      },
      {
        id: "q4s4",
        title: "The Succession Planning",
        context: "You've built something that works. Your CEO tells you: 'What you've done this year is exactly what we needed. Now I need you to scale it. Build the team and the playbooks so this isn't dependent on you.' You have budget for 2 hires and need to decide the team structure that will carry this forward.",
        options: [
          { label: "Hire Two Senior ICs", desc: "Two experienced Principal-level individual contributors, each owning half the portfolio. They mirror your role. Fast impact, high cost, potential ego conflicts.", impact: { teamAlign: +8, clientSat: +4, implSuccess: +3, revenue: +2, productInfluence: +1 }, playbook: "Gets you capacity immediately but creates coordination overhead. Senior ICs at the Principal level have strong opinions — you'll need to align them. Also, two of you doesn't scale; it just buys time." },
          { label: "Hire a Manager + a Technical Lead", desc: "One client relationship manager to handle day-to-day stakeholder management. One technical solutions architect to own implementation quality. You shift to strategy and escalations.", impact: { teamAlign: +6, clientSat: +5, implSuccess: +6, revenue: +3, productInfluence: +4 }, playbook: "Best structural answer. Separating relationship management from technical leadership creates specialization and scale. You become the integrator across both functions. This is how you build a team, not just add headcount." },
          { label: "Hire One + Build an Offshore Pod", desc: "One senior US-based hire plus a 3-person offshore implementation team. More total capacity, lower cost, but requires management infrastructure and introduces timezone/communication challenges.", impact: { teamAlign: +2, clientSat: +2, implSuccess: +5, revenue: +5, productInfluence: 0 }, playbook: "Cost-efficient for implementation throughput. But enterprise client management is high-touch — offshore teams can handle technical work but struggle with executive relationship dynamics. Split the work carefully." },
          { label: "Systematize Before Hiring", desc: "Before hiring anyone, spend Q1 documenting your playbooks, building templates, creating the operational infrastructure. Then hire into a system, not into chaos. You might only need 1 hire if the system is good enough.", impact: { teamAlign: +10, clientSat: -1, implSuccess: +2, revenue: -2, productInfluence: +6 }, playbook: "The most mature answer. Systems scale better than people. But your CEO wants scale NOW, and spending a quarter on documentation means existing clients get less attention. Manage expectations." },
        ],
      },
    ],
  },
];

const KPI_CONFIG = [
  { key: "clientSat", label: "Client Satisfaction", icon: "👥", color: "#4ECDC4", desc: "Enterprise stakeholder trust & NPS" },
  { key: "implSuccess", label: "Implementation Success", icon: "⚙️", color: "#45B7D1", desc: "On-time, on-scope delivery rate" },
  { key: "productInfluence", label: "Product Influence", icon: "🧭", color: "#96CEB4", desc: "Roadmap impact & R&D alignment" },
  { key: "revenue", label: "Revenue Pipeline", icon: "📊", color: "#FFEAA7", desc: "NRR, expansion & pipeline growth" },
  { key: "teamAlign", label: "Team Alignment", icon: "🤝", color: "#DDA0DD", desc: "Engineering & cross-functional trust" },
];

const getGrade = (score) => {
  if (score >= 90) return { grade: "S", label: "Exceptional", color: "#FFD700" };
  if (score >= 75) return { grade: "A", label: "Outstanding", color: "#4ECDC4" };
  if (score >= 60) return { grade: "B", label: "Strong", color: "#45B7D1" };
  if (score >= 45) return { grade: "C", label: "Developing", color: "#FFEAA7" };
  if (score >= 30) return { grade: "D", label: "Struggling", color: "#FF6B6B" };
  return { grade: "F", label: "Critical", color: "#FF4444" };
};

const getOverallTitle = (avg) => {
  if (avg >= 85) return "Chief Client & Product Officer Material";
  if (avg >= 70) return "Principal-Level Strategist";
  if (avg >= 55) return "Senior Solutions Leader";
  if (avg >= 40) return "Solid Operator, Growing Strategically";
  return "Tactical Executor — Needs Strategic Development";
};

const clamp = (val, min = 0, max = 100) => Math.max(min, Math.min(max, val));

export default function AIImplementationCommand() {
  const [phase, setPhase] = useState("intro"); // intro, portfolio, game, event, results
  const [portfolio, setPortfolio] = useState(null);
  const [quarterIndex, setQuarterIndex] = useState(0);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [kpis, setKpis] = useState({ clientSat: 50, implSuccess: 50, productInfluence: 50, revenue: 50, teamAlign: 50 });
  const [decisions, setDecisions] = useState([]);
  const [showPlaybook, setShowPlaybook] = useState(false);
  const [playbookGlobal, setPlaybookGlobal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [usedEvents, setUsedEvents] = useState([]);
  const [animating, setAnimating] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [expandedDecision, setExpandedDecision] = useState(null);
  const containerRef = useRef(null);

  const currentQuarter = QUARTERS[quarterIndex];
  const currentScenario = currentQuarter?.scenarios[scenarioIndex];
  const totalScenarios = QUARTERS.reduce((acc, q) => acc + q.scenarios.length, 0);
  const completedScenarios = decisions.length;

  const applyImpact = useCallback((impact) => {
    setKpis((prev) => {
      const next = { ...prev };
      Object.entries(impact).forEach(([key, val]) => {
        if (next[key] !== undefined) next[key] = clamp(next[key] + val);
      });
      return next;
    });
  }, []);

  const handleDecision = (option, optionIndex) => {
    setSelectedOption(optionIndex);
    setAnimating(true);

    setTimeout(() => {
      const decision = {
        quarter: currentQuarter.name,
        scenario: currentScenario.title,
        scenarioId: currentScenario.id,
        choice: option.label,
        impact: option.impact,
        playbook: option.playbook,
        optionIndex,
        context: currentScenario.context,
        allOptions: currentScenario.options,
      };
      setDecisions((prev) => [...prev, decision]);
      applyImpact(option.impact);

      const nextScenarioIndex = scenarioIndex + 1;
      if (nextScenarioIndex < currentQuarter.scenarios.length) {
        setScenarioIndex(nextScenarioIndex);
      } else {
        const nextQuarterIndex = quarterIndex + 1;
        if (nextQuarterIndex < QUARTERS.length) {
          // Random event between quarters
          const available = RANDOM_EVENTS.filter((_, i) => !usedEvents.includes(i));
          if (available.length > 0) {
            const idx = RANDOM_EVENTS.indexOf(available[Math.floor(Math.random() * available.length)]);
            setCurrentEvent(RANDOM_EVENTS[idx]);
            setUsedEvents((prev) => [...prev, idx]);
            setPhase("event");
          } else {
            setQuarterIndex(nextQuarterIndex);
            setScenarioIndex(0);
          }
        } else {
          setPhase("results");
        }
      }
      setSelectedOption(null);
      setAnimating(false);
    }, 600);
  };

  const handleEventDismiss = () => {
    applyImpact(currentEvent.impact);
    setCurrentEvent(null);
    setQuarterIndex((prev) => prev + 1);
    setScenarioIndex(0);
    setPhase("game");
  };

  const kpiAvg = Math.round(Object.values(kpis).reduce((a, b) => a + b, 0) / 5);

  // ========== STYLES ==========
  const styles = {
    app: {
      background: "#0b0e17",
      color: "#e2e8f0",
      minHeight: "100vh",
      fontFamily: "'Söhne', 'Helvetica Neue', Arial, sans-serif",
      position: "relative",
      overflow: "hidden",
    },
    noise: {
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "repeating-conic-gradient(#ffffff03 0% 25%, transparent 0% 50%) 0 0 / 4px 4px",
      pointerEvents: "none", zIndex: 0,
    },
    container: {
      maxWidth: "960px",
      margin: "0 auto",
      padding: "24px 20px",
      position: "relative",
      zIndex: 1,
    },
    header: {
      textAlign: "center",
      marginBottom: "32px",
      paddingTop: "20px",
    },
    badge: {
      display: "inline-block",
      padding: "6px 16px",
      background: "rgba(78, 205, 196, 0.1)",
      border: "1px solid rgba(78, 205, 196, 0.3)",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: 600,
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      color: "#4ECDC4",
      marginBottom: "16px",
    },
    title: {
      fontSize: "clamp(28px, 5vw, 42px)",
      fontWeight: 700,
      background: "linear-gradient(135deg, #e2e8f0 0%, #4ECDC4 50%, #45B7D1 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      lineHeight: 1.15,
      marginBottom: "12px",
      letterSpacing: "-0.5px",
    },
    subtitle: {
      fontSize: "15px",
      color: "#8892b0",
      maxWidth: "600px",
      margin: "0 auto",
      lineHeight: 1.6,
    },
    card: {
      background: "#131829",
      border: "1px solid rgba(78, 205, 196, 0.12)",
      borderRadius: "12px",
      padding: "28px",
      marginBottom: "16px",
      transition: "all 0.3s ease",
    },
    cardHover: {
      border: "1px solid rgba(78, 205, 196, 0.35)",
      boxShadow: "0 4px 24px rgba(78, 205, 196, 0.08)",
    },
    btn: {
      display: "block",
      width: "100%",
      padding: "16px 20px",
      background: "#131829",
      border: "1px solid rgba(78, 205, 196, 0.2)",
      borderRadius: "10px",
      color: "#e2e8f0",
      cursor: "pointer",
      textAlign: "left",
      fontSize: "14px",
      lineHeight: 1.5,
      transition: "all 0.25s ease",
      marginBottom: "10px",
    },
    btnHover: {
      borderColor: "#4ECDC4",
      background: "rgba(78, 205, 196, 0.08)",
      transform: "translateX(4px)",
    },
    btnSelected: {
      borderColor: "#4ECDC4",
      background: "rgba(78, 205, 196, 0.15)",
      boxShadow: "0 0 20px rgba(78, 205, 196, 0.1)",
    },
    primary: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "14px 32px",
      background: "linear-gradient(135deg, #4ECDC4, #45B7D1)",
      border: "none",
      borderRadius: "10px",
      color: "#0b0e17",
      fontWeight: 700,
      fontSize: "15px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      letterSpacing: "0.3px",
    },
    kpiBar: {
      display: "flex",
      gap: "8px",
      padding: "16px 20px",
      background: "#0d1020",
      borderRadius: "10px",
      border: "1px solid rgba(78, 205, 196, 0.08)",
      marginBottom: "24px",
      flexWrap: "wrap",
      justifyContent: "center",
    },
    kpiItem: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "4px",
      minWidth: "80px",
      flex: 1,
    },
    progressOuter: {
      width: "100%",
      height: "4px",
      background: "rgba(255,255,255,0.06)",
      borderRadius: "2px",
      overflow: "hidden",
    },
    quarterNav: {
      display: "flex",
      gap: "8px",
      marginBottom: "24px",
      justifyContent: "center",
    },
    quarterDot: (active, completed) => ({
      padding: "8px 20px",
      borderRadius: "8px",
      fontSize: "13px",
      fontWeight: 600,
      background: active ? "rgba(78, 205, 196, 0.15)" : completed ? "rgba(78, 205, 196, 0.06)" : "rgba(255,255,255,0.03)",
      border: `1px solid ${active ? "#4ECDC4" : completed ? "rgba(78, 205, 196, 0.2)" : "rgba(255,255,255,0.06)"}`,
      color: active ? "#4ECDC4" : completed ? "#8892b0" : "#4a5568",
      transition: "all 0.3s ease",
    }),
  };

  // ========== RENDER HELPERS ==========
  const KPIDisplay = ({ compact }) => (
    <div style={styles.kpiBar}>
      {KPI_CONFIG.map(({ key, label, icon, color }) => (
        <div key={key} style={styles.kpiItem}>
          <div style={{ fontSize: compact ? "14px" : "16px" }}>{icon}</div>
          <div style={{ fontSize: "10px", color: "#8892b0", textAlign: "center", lineHeight: 1.2 }}>
            {compact ? label.split(" ")[0] : label}
          </div>
          <div style={{ fontSize: "16px", fontWeight: 700, color }}>{kpis[key]}</div>
          <div style={styles.progressOuter}>
            <div style={{
              width: `${kpis[key]}%`,
              height: "100%",
              background: color,
              borderRadius: "2px",
              transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            }} />
          </div>
        </div>
      ))}
    </div>
  );

  const QuarterNav = () => (
    <div style={styles.quarterNav}>
      {QUARTERS.map((q, i) => (
        <div key={q.name} style={styles.quarterDot(i === quarterIndex, i < quarterIndex)}>
          {q.name}
        </div>
      ))}
    </div>
  );

  const OptionButton = ({ option, index, onClick }) => {
    const [hovered, setHovered] = useState(false);
    const isSelected = selectedOption === index;
    return (
      <button
        style={{
          ...styles.btn,
          ...(hovered ? styles.btnHover : {}),
          ...(isSelected ? styles.btnSelected : {}),
          opacity: animating && !isSelected ? 0.4 : 1,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => !animating && onClick(option, index)}
        disabled={animating}
      >
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            background: isSelected ? "#4ECDC4" : "rgba(78, 205, 196, 0.1)",
            color: isSelected ? "#0b0e17" : "#4ECDC4",
            fontSize: "13px",
            fontWeight: 700,
            flexShrink: 0,
          }}>
            {String.fromCharCode(65 + index)}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: "4px", color: hovered || isSelected ? "#4ECDC4" : "#e2e8f0" }}>
              {option.label}
            </div>
            <div style={{ fontSize: "13px", color: "#8892b0", lineHeight: 1.5 }}>
              {option.desc}
            </div>
          </div>
        </div>
      </button>
    );
  };

  // ========== PHASES ==========
  if (phase === "intro") {
    return (
      <div style={styles.app}>
        <div style={styles.noise} />
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.badge}>Interactive Strategy Simulator</div>
            <h1 style={styles.title}>Fintech AI — Strategic Command</h1>
            <p style={styles.subtitle}>
              Enterprise AI Adoption in Fintech — From Client Strategy to Product Roadmap
            </p>
          </div>

          <div style={{ ...styles.card, textAlign: "center", padding: "40px 28px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎯</div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "12px", color: "#e2e8f0" }}>
              Step Into the Role
            </h2>
            <p style={{ color: "#8892b0", lineHeight: 1.7, maxWidth: "560px", margin: "0 auto 24px", fontSize: "14px" }}>
              You are the <strong style={{ color: "#4ECDC4" }}>Principal of Client & Product Solutions</strong> at
              an AI-native fintech company. Over 4 quarters, you'll navigate enterprise relationships,
              drive complex implementations, shape the product roadmap, and prove you can scale AI adoption
              across the financial services industry.
            </p>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "12px",
              marginBottom: "32px",
            }}>
              {[
                { n: "16-18", l: "Strategic Decisions" },
                { n: "5", l: "KPIs Tracked" },
                { n: "4", l: "Quarters" },
                { n: "∞", l: "Trade-offs" },
              ].map(({ n, l }) => (
                <div key={l} style={{
                  padding: "16px",
                  background: "rgba(78, 205, 196, 0.04)",
                  borderRadius: "8px",
                  border: "1px solid rgba(78, 205, 196, 0.08)",
                }}>
                  <div style={{ fontSize: "24px", fontWeight: 700, color: "#4ECDC4" }}>{n}</div>
                  <div style={{ fontSize: "11px", color: "#8892b0", marginTop: "4px" }}>{l}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                style={styles.primary}
                onClick={() => setPhase("portfolio")}
                onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
              >
                Begin Simulation →
              </button>
              <button
                style={{
                  ...styles.primary,
                  background: "transparent",
                  border: "1px solid rgba(78, 205, 196, 0.3)",
                  color: "#4ECDC4",
                }}
                onClick={() => { setPlaybookGlobal(true); setPhase("portfolio"); }}
              >
                🎓 Strategy Guide Mode
              </button>
            </div>
            {playbookGlobal && (
              <p style={{ fontSize: "12px", color: "#4ECDC4", marginTop: "12px", opacity: 0.8 }}>
                Strategy Guide enabled — playbook analysis shown after each decision
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "portfolio") {
    return (
      <div style={styles.app}>
        <div style={styles.noise} />
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.badge}>Portfolio Selection</div>
            <h1 style={{ ...styles.title, fontSize: "clamp(24px, 4vw, 34px)" }}>Choose Your Client Portfolio</h1>
            <p style={styles.subtitle}>Each portfolio presents different strategic challenges and industry dynamics.</p>
          </div>

          {PORTFOLIOS.map((p) => {
            const [hovered, setHovered] = useState(false);
            return (
              <div
                key={p.id}
                style={{
                  ...styles.card,
                  ...(hovered ? styles.cardHover : {}),
                  cursor: "pointer",
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={() => {
                  setPortfolio(p);
                  setPhase("game");
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#e2e8f0", marginBottom: "4px" }}>{p.name}</h3>
                    <p style={{ fontSize: "13px", color: "#8892b0" }}>{p.desc}</p>
                  </div>
                  <span style={{
                    padding: "4px 12px",
                    background: "rgba(78, 205, 196, 0.1)",
                    border: "1px solid rgba(78, 205, 196, 0.2)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "#4ECDC4",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}>Select →</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
                  {p.clients.map((cid) => {
                    const c = CLIENTS[cid];
                    return (
                      <div key={cid} style={{
                        padding: "14px",
                        background: "rgba(255,255,255,0.02)",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.04)",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                          <span style={{ fontSize: "20px" }}>{c.logo}</span>
                          <div>
                            <div style={{ fontSize: "14px", fontWeight: 600, color: "#e2e8f0" }}>{c.name}</div>
                            <div style={{ fontSize: "11px", color: "#8892b0" }}>{c.vertical} · {c.tier} · {c.revenue}</div>
                          </div>
                        </div>
                        <p style={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.5 }}>{c.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (phase === "event") {
    return (
      <div style={styles.app}>
        <div style={styles.noise} />
        <div style={styles.container}>
          <QuarterNav />
          <KPIDisplay compact />

          <div style={{
            ...styles.card,
            border: "1px solid rgba(255, 107, 107, 0.3)",
            background: "linear-gradient(135deg, #131829 0%, rgba(255, 107, 107, 0.04) 100%)",
            textAlign: "center",
            padding: "48px 28px",
          }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>{currentEvent.icon}</div>
            <div style={{
              ...styles.badge,
              background: "rgba(255, 107, 107, 0.1)",
              borderColor: "rgba(255, 107, 107, 0.3)",
              color: "#FF6B6B",
            }}>
              Quarterly Event
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px", color: "#e2e8f0" }}>
              {currentEvent.title}
            </h2>
            <p style={{ color: "#8892b0", lineHeight: 1.7, maxWidth: "520px", margin: "0 auto 16px", fontSize: "14px" }}>
              {currentEvent.desc}
            </p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginBottom: "28px" }}>
              {Object.entries(currentEvent.impact).map(([key, val]) => {
                const cfg = KPI_CONFIG.find((k) => k.key === key);
                return (
                  <span key={key} style={{
                    padding: "4px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    background: val > 0 ? "rgba(78, 205, 196, 0.1)" : "rgba(255, 107, 107, 0.1)",
                    color: val > 0 ? "#4ECDC4" : "#FF6B6B",
                    border: `1px solid ${val > 0 ? "rgba(78, 205, 196, 0.2)" : "rgba(255, 107, 107, 0.2)"}`,
                  }}>
                    {cfg?.icon} {cfg?.label.split(" ")[0]} {val > 0 ? `+${val}` : val}
                  </span>
                );
              })}
            </div>
            <button style={styles.primary} onClick={handleEventDismiss}>
              Continue to {QUARTERS[quarterIndex + 1]?.name} →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "results") {
    const gradeInfo = getOverallTitle(kpiAvg);
    return (
      <div style={styles.app}>
        <div style={styles.noise} />
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.badge}>Simulation Complete</div>
            <h1 style={{ ...styles.title, fontSize: "clamp(24px, 4vw, 36px)" }}>Your Leadership Scorecard</h1>
          </div>

          {/* Overall Score */}
          <div style={{ ...styles.card, textAlign: "center", padding: "36px", marginBottom: "20px" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "96px",
              height: "96px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${getGrade(kpiAvg).color}22, ${getGrade(kpiAvg).color}08)`,
              border: `3px solid ${getGrade(kpiAvg).color}`,
              marginBottom: "16px",
            }}>
              <span style={{ fontSize: "40px", fontWeight: 800, color: getGrade(kpiAvg).color }}>
                {getGrade(kpiAvg).grade}
              </span>
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "6px", color: "#e2e8f0" }}>
              {gradeInfo}
            </h2>
            <p style={{ color: "#8892b0", fontSize: "14px" }}>Overall Score: {kpiAvg}/100</p>
          </div>

          {/* KPI Breakdown */}
          <div style={styles.card}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#e2e8f0", marginBottom: "20px" }}>KPI Breakdown</h3>
            {KPI_CONFIG.map(({ key, label, icon, color, desc }) => {
              const val = kpis[key];
              const g = getGrade(val);
              return (
                <div key={key} style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div>
                      <span style={{ fontSize: "16px", marginRight: "8px" }}>{icon}</span>
                      <span style={{ fontWeight: 600, fontSize: "14px" }}>{label}</span>
                      <span style={{ fontSize: "12px", color: "#6b7280", marginLeft: "8px" }}>{desc}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "18px", fontWeight: 700, color }}>{val}</span>
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: `${g.color}18`,
                        color: g.color,
                      }}>{g.grade}</span>
                    </div>
                  </div>
                  <div style={{ ...styles.progressOuter, height: "8px", borderRadius: "4px" }}>
                    <div style={{
                      width: `${val}%`, height: "100%", background: `linear-gradient(90deg, ${color}, ${color}88)`,
                      borderRadius: "4px", transition: "width 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Toggle playbook in results */}
          <div style={{ textAlign: "center", margin: "20px 0" }}>
            <button
              style={{
                ...styles.primary,
                background: showPlaybook ? "rgba(78, 205, 196, 0.15)" : "transparent",
                border: "1px solid rgba(78, 205, 196, 0.3)",
                color: "#4ECDC4",
              }}
              onClick={() => setShowPlaybook(!showPlaybook)}
            >
              {showPlaybook ? "Hide" : "Show"} Strategy Playbook Analysis
            </button>
          </div>

          {/* Decision Review */}
          <div style={styles.card}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#e2e8f0", marginBottom: "20px" }}>Decision Review</h3>
            {decisions.map((d, i) => (
              <div key={i} style={{
                padding: "16px",
                background: "rgba(255,255,255,0.02)",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.04)",
                marginBottom: "10px",
                cursor: "pointer",
              }}
                onClick={() => setExpandedDecision(expandedDecision === i ? null : i)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "11px", color: "#4ECDC4", fontWeight: 600, marginBottom: "4px" }}>{d.quarter} · {d.scenario}</div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#e2e8f0" }}>{d.choice}</div>
                  </div>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {Object.entries(d.impact).map(([key, val]) => val !== 0 && (
                      <span key={key} style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: val > 0 ? "#4ECDC4" : "#FF6B6B",
                      }}>
                        {KPI_CONFIG.find((k) => k.key === key)?.icon}{val > 0 ? `+${val}` : val}
                      </span>
                    ))}
                  </div>
                </div>
                {expandedDecision === i && (
                  <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <p style={{ fontSize: "13px", color: "#8892b0", lineHeight: 1.6, marginBottom: "12px" }}>
                      <strong style={{ color: "#e2e8f0" }}>Situation:</strong> {d.context?.slice(0, 200)}...
                    </p>
                    {showPlaybook && (
                      <div style={{
                        padding: "12px",
                        background: "rgba(78, 205, 196, 0.04)",
                        borderRadius: "6px",
                        border: "1px solid rgba(78, 205, 196, 0.1)",
                      }}>
                        <div style={{ fontSize: "11px", fontWeight: 600, color: "#4ECDC4", marginBottom: "6px" }}>📋 PLAYBOOK ANALYSIS</div>
                        <p style={{ fontSize: "13px", color: "#8892b0", lineHeight: 1.6 }}>{d.playbook}</p>
                      </div>
                    )}
                    {showPlaybook && d.allOptions && (
                      <div style={{ marginTop: "10px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 600, color: "#8892b0", marginBottom: "6px" }}>All options:</div>
                        {d.allOptions.map((opt, oi) => (
                          <div key={oi} style={{
                            padding: "8px 12px",
                            marginBottom: "6px",
                            borderRadius: "6px",
                            background: oi === d.optionIndex ? "rgba(78, 205, 196, 0.08)" : "transparent",
                            border: `1px solid ${oi === d.optionIndex ? "rgba(78, 205, 196, 0.2)" : "rgba(255,255,255,0.04)"}`,
                          }}>
                            <div style={{ fontSize: "13px", fontWeight: 600, color: oi === d.optionIndex ? "#4ECDC4" : "#e2e8f0" }}>
                              {oi === d.optionIndex ? "✓ " : ""}{opt.label}
                            </div>
                            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{opt.playbook}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Restart */}
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <button
              style={styles.primary}
              onClick={() => {
                setPhase("intro");
                setPortfolio(null);
                setQuarterIndex(0);
                setScenarioIndex(0);
                setKpis({ clientSat: 50, implSuccess: 50, productInfluence: 50, revenue: 50, teamAlign: 50 });
                setDecisions([]);
                setShowPlaybook(false);
                setPlaybookGlobal(false);
                setUsedEvents([]);
                setExpandedDecision(null);
              }}
            >
              Restart Simulation
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== GAME PHASE ==========
  const lastDecision = decisions[decisions.length - 1];
  const showLastPlaybook = playbookGlobal && lastDecision && decisions.length > 0 && !(scenarioIndex === 0 && decisions.length > 0 && decisions[decisions.length - 1]?.quarter !== currentQuarter?.name);

  return (
    <div style={styles.app}>
      <div style={styles.noise} />
      <div style={styles.container} ref={containerRef}>
        <QuarterNav />
        <KPIDisplay compact />

        {/* Last decision playbook */}
        {playbookGlobal && lastDecision && (
          <div style={{
            padding: "14px 18px",
            background: "rgba(78, 205, 196, 0.04)",
            borderRadius: "8px",
            border: "1px solid rgba(78, 205, 196, 0.1)",
            marginBottom: "16px",
            fontSize: "13px",
          }}>
            <div style={{ fontWeight: 600, color: "#4ECDC4", marginBottom: "4px", fontSize: "11px" }}>
              📋 LAST DECISION — {lastDecision.choice}
            </div>
            <p style={{ color: "#8892b0", lineHeight: 1.6 }}>{lastDecision.playbook}</p>
          </div>
        )}

        {/* Quarter header */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <span style={styles.badge}>{currentQuarter.name} — {currentQuarter.title}</span>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              {scenarioIndex + 1}/{currentQuarter.scenarios.length}
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "#6b7280" }}>{currentQuarter.subtitle}</p>
        </div>

        {/* Scenario */}
        <div style={styles.card}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#e2e8f0", marginBottom: "12px" }}>
            {currentScenario.title}
          </h2>
          <p style={{ fontSize: "14px", color: "#8892b0", lineHeight: 1.7, marginBottom: "24px" }}>
            {currentScenario.context}
          </p>

          <div style={{ marginBottom: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
              Choose Your Approach
            </div>
            {currentScenario.options.map((opt, i) => (
              <OptionButton key={i} option={opt} index={i} onClick={handleDecision} />
            ))}
          </div>
        </div>

        {/* Progress */}
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            Decision {completedScenarios + 1} of {totalScenarios}
          </div>
          <div style={{ ...styles.progressOuter, maxWidth: "200px", margin: "8px auto 0", height: "3px" }}>
            <div style={{
              width: `${(completedScenarios / totalScenarios) * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg, #4ECDC4, #45B7D1)",
              borderRadius: "2px",
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
