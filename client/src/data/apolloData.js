// ─── Apollo Transformation Engine — Static Data ─────────────────────────

// ─── Tab 1: The Burning Platform ────────────────────────────────────────

export const AUM_TRAJECTORY = [
  { year: 'Q4 2025', value: '$938B', pct: 63, status: 'Actual', sub: 'up 15% YoY' },
  { year: '2026', value: '$1.0T', pct: 67, status: 'Target', sub: 'public commitment' },
  { year: '2029', value: '$1.5T', pct: 100, status: 'Target', sub: 'five-year horizon' },
];

export const SIX_MARKETS = [
  'Individuals', 'Insurance', 'Institutional Debt',
  'Institutional Equity', 'Traditional Asset Managers', '401(k) Market',
];

export const TRILATERAL_SCOPE = [
  {
    entity: 'Apollo',
    role: 'Capital strategy, origination, deal execution',
    detail: '16 origination platforms, ~$100B annual origination, targeting $200-250B',
  },
  {
    entity: 'Athene',
    role: 'Captive insurance, retirement services, balance sheet',
    detail: '$250B balance sheet, 85% of revenue, direct policyholder relationships',
  },
  {
    entity: 'ISG',
    role: 'B2B investment advisor for external insurance clients',
    detail: 'Fee-based mandates, multiple client balance sheets, multi-jurisdiction compliance',
  },
];

export const FAILURE_MODES = [
  {
    title: 'Customer experience is below industry standard',
    metric: '2 consecutive years',
    metricSub: 'below J.D. Power industry average',
    evidence: 'Athene ranked below the industry average in J.D. Power\'s Individual Annuity Customer Satisfaction Study in both 2024 and 2025. Consecutive bottom-tier performance — not a blip, not a measurement artifact. The largest retirement platform in alternative asset management cannot get customer experience right two years running.',
    source: 'J.D. Power Individual Annuity Customer Satisfaction Study, 2024 & 2025',
  },
  {
    title: 'Distribution is structurally broken',
    metric: '0 online annuity issuance',
    metricSub: 'every transaction requires a financial professional',
    evidence: 'Athene does not issue annuities online. Every single transaction requires a financial professional as intermediary. This is not a feature gap that patches incrementally — it is structural friction at scale. Meanwhile, the advisors who do work through Athene are on record about the experience.',
    quote: '"Athene is difficult to get on the phone. I just do not like working with this carrier. And ironically, this is an extremely popular carrier."',
    quoteSource: '— Ken Orenstein, Financial Advisor',
    source: 'Advisor interviews, industry reporting',
  },
  {
    title: 'Regulatory exposure is accelerating',
    metric: '$22.6B → $40.1B',
    metricSub: 'related-party assets in one year',
    evidence: 'Athene\'s related-party assets nearly doubled from $22.6 billion in 2023 to $40.1 billion in 2024. NAIC scrutiny is intensifying. Regulators from New York and Virginia are explicitly pushing back on Iowa\'s more permissive capital treatment. This is not a compliance footnote — it is a structural risk to the business model that grows with every dollar of AUM.',
    source: 'Athene filings, NAIC regulatory proceedings, state insurance commissioner statements',
  },
  {
    title: 'Revenue concentration creates existential dependency',
    metric: '$22B of $26B',
    metricSub: '85% of Apollo revenue from retirement',
    evidence: 'In 2024, 85% of Apollo\'s total revenue came from the retirement business. The tail is now the dog. Apollo\'s public identity as a "PE firm" is increasingly a misnomer — it is functionally an insurance-asset management hybrid. Athene\'s insurance liabilities are not a funding source for the PE business. They are the business. Operational failure in retirement services is not a segment risk. It is an enterprise risk.',
    source: 'Apollo Global Management 2024 Annual Report',
  },
  {
    title: 'The market is pricing the operating model gap',
    metric: '12-13x vs ~2x',
    metricSub: 'Apollo asset-to-equity ratio vs Blackstone',
    evidence: 'Public markets award Apollo a valuation multiple far below asset-light peers. Apollo operates at a 12-13x asset-to-equity ratio versus Blackstone\'s approximately 2x. The Harvard Business School case on Apollo asks directly: "Is an asset-heavy strategy visionary or misguided?" The market is not discounting Apollo\'s capital strategy. It is discounting Apollo\'s ability to operate the machine the strategy requires.',
    source: 'HBS Case 126-009 (Serafeim & Norris, 2025), public market data',
  },
];

export const PROVOCATION_SCENARIO = {
  title: 'What happens if you run a top-down mandate',
  subtitle: 'Given Apollo\'s dual-entity structure, Athene\'s J.D. Power problem, and the $1.5T timeline',
  timeline: [
    { month: 'Mo 1', event: 'Mandate issued. Energy high. Steering committee formed. Everyone agrees this matters.', status: 'green' },
    { month: 'Mo 3', event: 'Athene compliance team flags regulatory conflicts with deal-sprint pace. First schedule slippage. Middle managers begin asking "is this really happening?"', status: 'yellow' },
    { month: 'Mo 6', event: 'Deal team ignores transformation meetings — a live deal takes priority, as it always does. Champions have not been identified. No visible wins to point to.', status: 'yellow' },
    { month: 'Mo 9', event: 'BREAK POINT. Dual-clock conflict surfaces. Athene ops managers begin passive resistance — they comply on paper and route around in practice. No one owns the gap.', status: 'red' },
    { month: 'Mo 12', event: 'Program declared "successful" in status decks while operators route around it in practice. Real adoption near zero. Budget review approaching.', status: 'red' },
  ],
  breakReason: 'Apollo AM runs on deal sprints. Athene runs on quarterly compliance gates. Without explicit governance architecture managing both clocks, any top-down mandate hits the clock conflict at month 9. The transformation didn\'t fail because it was wrong — it failed because nobody designed the mechanism to hold two operating rhythms together.',
};

export const PORTFOLIO_VALUE_CHAIN = {
  title: 'The real prize: Internal capability becomes portfolio weapon',
  description: 'Apollo manages 200+ portfolio companies. Internal AI capabilities don\'t stay internal — they become a competitive advantage deployed across the entire portfolio.',
  layers: [
    {
      label: 'Internal Build',
      items: [
        'Athene digital issuance automation',
        'ISG client onboarding acceleration',
        'Compliance monitoring automation',
        'Cross-entity data infrastructure',
      ],
    },
    {
      label: 'Portfolio Deploy',
      items: [
        '200+ companies across sectors',
        'AI operational playbooks',
        'Shared infrastructure & tooling',
        'Talent mobility between portfolio cos',
      ],
    },
    {
      label: 'Fund Returns',
      items: [
        'AI-native operating model as value creation lever',
        'Faster portfolio company transformation',
        'Competitive moat in deal sourcing',
        'LP narrative: "we don\'t just invest — we upgrade"',
      ],
    },
  ],
};

export const SERAFEIM_QUOTE = {
  text: '"The business model has transformed. The operating model hasn\'t kept pace."',
  source: '— Prof. George Serafeim, Harvard Business School, on Apollo\'s post-Athene reality',
  citation: '(HBS Case 126-009)',
};

export const BALANCE_SHEET = {
  pre: { label: 'Balance Sheet — Pre-Athene', value: '$30–40B', sub: 'Asset-light alternative manager' },
  post: { label: 'Balance Sheet — Post-Athene', value: '$250B', sub: 'Insurance-anchored credit powerhouse — overnight' },
};

// ─── Tab 2: The Spine of Support ────────────────────────────────────────

export const BUYIN_LAYERS = [
  {
    layer: 'Top',
    title: 'The Rowan Mandate',
    badge: { text: 'CEO', bg: 'var(--apollo-gold-faint)', color: 'var(--apollo-gold)', border: 'var(--apollo-gold-border)' },
    framing: 'This is not "tell the CEO what to do." It\'s engineering the conditions where executive sponsorship is structurally embedded, not personally dependent. The program must run without Rowan in the room — and surface the 3 specific decisions that genuinely require C-suite sign-off with enough lead time to get them.',
    profiles: [
      {
        role: 'CEO / Executive Sponsor',
        who: 'The person whose public commitment ($1.5T by 2029) makes this non-optional',
        cares: 'Not having this blow up publicly. Investor optics. The $1.5T commitment is on earnings calls.',
        risk: 'Passive sponsorship is the default. Has political capital but no bandwidth for recurring agenda items.',
        design: 'Design the governance to demand almost nothing from them in normal operation. Precise escalation protocol for the 3 decisions that require their presence. One number that follows them into every operating review.',
      },
      {
        role: 'CTO / Technology Authority',
        who: 'The person who signs off on architecture decisions that span entities',
        cares: 'Technical debt, platform stability, not building two architectures when one is needed',
        risk: 'Gets pulled into deal-level technology decisions. Architecture decisions get deferred because operational fires take priority.',
        design: 'Explicit authority over cross-entity technology architecture. Quarterly architecture review that cannot be rescheduled. Veto power on solutions that create integration debt.',
      },
    ],
  },
  {
    layer: 'Middle',
    title: 'Where 70% of Transformations Die',
    badge: { text: '70%', bg: 'var(--apollo-red-faint)', color: 'var(--apollo-red)', border: 'var(--apollo-red-border)' },
    framing: 'These are not org chart boxes. They are real people with real incentive structures that currently have zero alignment with "participate in a transformation program." Every one of them needs a specific answer to: what\'s in it for me this quarter?',
    profiles: [
      {
        role: 'Apollo Deal Manager',
        who: 'VP or Principal on an active deal team',
        cares: 'Carry. Deal velocity. Not being the slowest team in the market.',
        risk: 'Will always prioritize a live deal over a transformation meeting. Every time.',
        valueExchange: 'Show them AI-augmented deal analysis that makes them faster — not "transformation" that makes them attend meetings. First 90 days: deploy one AI tool into their actual workflow. When they see 40% faster due diligence on a real deal, they convert themselves.',
      },
      {
        role: 'Athene Operations Manager',
        who: 'SVP who has been there since before or just after the Apollo-Athene merger',
        cares: 'Not breaking what works. Regulatory safety. Professional legacy — they built this system.',
        risk: 'Identity threat. Criticism of the process is criticism of them. Will comply on paper and route around in practice if excluded from design.',
        valueExchange: 'Co-design, not consultation. Put them in the room where the new process is being built. First 90 days: one NIGO reduction they can claim ownership of. Their name on the improvement, not the consultant\'s.',
      },
      {
        role: 'ISG Client Director',
        who: 'The person whose phone rings when a client has a problem',
        cares: 'Client trust. Not being the person who caused a client incident. One complaint ends careers.',
        risk: 'Fear of unknown downstream consequences overrides any efficiency argument. Will be the quietest voice in every room until something goes wrong, then the loudest.',
        valueExchange: 'Veto power on client-facing changes in exchange for active participation in back-office changes. First 90 days: a defined client communication protocol they helped write. Their safety net, built by them.',
      },
    ],
  },
  {
    layer: 'Champions',
    title: '3-5 Operators With Early Wins Who Now Own It',
    badge: { text: '3→30', bg: 'var(--apollo-green-faint)', color: 'var(--apollo-green)', border: 'var(--apollo-green-border)' },
    framing: 'Champions are not selected. They emerge from early wins. The transformation program creates the conditions — short-cycle improvements, visible attribution, peer credibility — and the people who step forward become the network that scales adoption from 3 to 12 to 30.',
    profiles: [
      {
        role: 'The Athene Process Owner',
        who: 'Senior operator who runs a high-volume workflow (claims, issuance, service)',
        cares: 'Their team\'s workload. Reducing the pain they see every day.',
        valueExchange: 'One workflow improvement that visibly reduces their team\'s pain. Attributed to them. Presented by them. Their credibility becomes the program\'s credibility.',
      },
      {
        role: 'The Deal Team Early Adopter',
        who: 'Associate or VP who is already using AI tools informally',
        cares: 'Career acceleration. Being seen as the person who figured it out first.',
        valueExchange: 'Formal recognition. Access. A role in the transformation that adds to their profile, not their workload. First 90 days: they demo their workflow to a senior partner.',
      },
      {
        role: 'The ISG Analyst',
        who: 'Junior to mid-level person processing client reporting or compliance filings',
        cares: 'Not doing the same manual process for the 500th time',
        valueExchange: 'One automated report that saves them 4 hours a week. They become the person other analysts ask about. Network effect begins.',
      },
    ],
  },
];

// ─── Tab 3: The Identity Problem ────────────────────────────────────────

export const IDENTITY_THESIS = {
  core: 'People resist what threatens how they see themselves professionally.',
  elaboration: 'Traditional programs treat resistance as a communication problem. The research shows it\'s an identity and self-efficacy problem. Perceived capability matters more than actual capability. An operator who believes they cannot work in the new model will not, even if they demonstrably can. The intervention is experiential, not educational. Co-design, not consultation.',
};

export const RESEARCH_SOURCES = [
  {
    marker: '1',
    author: 'Bandura, A. (1997)',
    title: 'Self-Efficacy: The Exercise of Control',
    publisher: 'W.H. Freeman',
    application: 'The foundational framework for understanding how perceived capability governs behavior independent of actual capability.',
  },
  {
    marker: '2',
    author: 'Mollick, E. et al. (2023)',
    title: 'Navigating the Jagged Technological Frontier',
    publisher: 'Harvard Business School Working Paper 24-013',
    extra: 'See also Mollick, E. (2024). Co-Intelligence: Living and Working with AI. Portfolio/Penguin.',
    application: 'Field experimental evidence of the effects of AI on knowledge worker productivity and quality.',
  },
  {
    marker: '3',
    author: 'O\'Reilly, C.A. & Tushman, M.L. (2004)',
    title: 'The Ambidextrous Organization',
    publisher: 'Harvard Business Review, 82(4), 74–81',
    application: 'The framework for running exploration and exploitation simultaneously without sequential replacement.',
  },
];

export const ARCHETYPES = [
  {
    name: 'Apollo Deal Team',
    color: '#D4A853',
    caresAbout: 'IRR, competitive position, not being the slowest firm in the market',
    inertia: 'Not identity threat — time scarcity. Transformation competes with deals. Deals always win.',
    capabilityGap: 'Low perceived need, probably high actual capability if engaged. The gap is motivation, not competence.',
    whatChanges: 'Reframe from "transformation program" to "competitive infrastructure." Mollick\'s research\u00B2 documents the productivity gap between AI-adopters and non-adopters in financial analysis tasks specifically. Make non-adoption feel like the risk, not adoption.',
    likely: 'Will engage episodically when a deal creates a relevant use case. Will ignore when deal flow is high. Needs a champion inside the deal team, not outside it.',
  },
  {
    name: 'Athene Operator',
    color: '#7CB9A8',
    caresAbout: 'Not breaking what works. Regulatory safety. Professional legacy.',
    inertia: 'Identity threat. They built the system being transformed. Criticism of the process is criticism of them. This is Bandura\'s self-efficacy mechanism\u00B9 — perceived threat to professional competence.',
    capabilityGap: 'High perceived threat, unknown actual capability. Most haven\'t been given the chance to prove they can work the new way.',
    whatChanges: 'Co-design, not consultation. Put them in the room where the new process is being built. Create early wins that prove to them they can operate in the new model. One successful NIGO reduction they can claim ownership of is worth more than six months of communication decks.',
    likely: 'Will comply on paper and route around in practice if excluded from design. Will become the program\'s most effective advocates if included early and given authorship of one visible win.',
  },
  {
    name: 'ISG Client Liaison',
    color: '#7BA7CC',
    caresAbout: 'Client trust. Not being the person who caused a client incident.',
    inertia: 'Risk aversion rooted in accountability. One client complaint ends careers. Fear of unknown downstream consequences overrides any efficiency argument.',
    capabilityGap: 'May be fully capable but perceived risk overrides. The barrier is not skill — it\'s blast radius uncertainty.',
    whatChanges: 'A defined client communication protocol before any transformation-driven change touches their workflow. Give them veto power on client-facing changes in exchange for active participation in back-office changes.',
    likely: 'Will be the quietest voice in every room until something goes wrong with a client, then the loudest. Engage them early on protocol design or they will block everything late.',
  },
  {
    name: 'Transformation Skeptic',
    color: '#C4A1D4',
    caresAbout: 'Not being complicit in another program that wastes everyone\'s time.',
    inertia: 'Rational updating from prior experience. This is not irrational resistance — they have evidence that transformation programs fail. Their prior is correct.',
    capabilityGap: 'Not a capability issue. A trust issue. They don\'t believe the program architecture will hold under deal-cycle pressure.',
    whatChanges: 'The O\'Reilly & Tushman ambidexterity frame\u00B3 applies directly — show them this is parallel operation, not sequential replacement. Show them a Month 1 deliverable that is genuinely useful, not performative. The first process map that identifies a real NIGO root cause converts them faster than any vision communication.',
    likely: 'The most influential voice in the room when the first obstacle appears. If converted by Month 2 they become the program\'s internal defense. If not converted they become the credible voice of failure.',
  },
  {
    name: 'Rowan Mandate Carrier',
    color: '#D48A8A',
    caresAbout: 'Not having this blow up publicly. The $1.5T commitment is on earnings calls. Investor optics on transformation outcomes are real.',
    inertia: 'Bandwidth scarcity. Has political capital but no time. Passive sponsorship is the default and the risk.',
    capabilityGap: 'Not an adoption question. The governance architecture needs to demand almost nothing from them in normal operation and create a precise escalation protocol for the three decisions that genuinely require their presence.',
    whatChanges: 'Design the program to run without them — and surface the specific decision gates that require C-suite sign-off with enough lead time to get it. They need to feel the program is under control, not that it is a recurring agenda item.',
    likely: 'Reliable sponsor if the program creates no unexpected C-suite noise. Will withdraw if transformation becomes a problem that lands on their desk for the wrong reasons.',
  },
  {
    name: 'New Apollo Joiner',
    color: '#E8D5B7',
    caresAbout: 'Whether this firm is worth trusting with a career. Reading signals about what success looks like here.',
    inertia: 'Waiting to see. Neither resistant nor committed. No legacy to protect but no standing to push either.',
    capabilityGap: 'Often the highest actual AI capability in the building — joined recently, more likely to have current skills. But perceived capability relative to Apollo\'s culture may be low — they don\'t yet know what competence looks like here.',
    whatChanges: 'Give them early visible roles in the transformation. Mollick\'s productivity research\u00B2 applies most directly to this group — they are most likely to adopt AI-augmented workflows and most likely to demonstrate results quickly. Their wins are the program\'s fastest proof points.',
    likely: 'Fastest conversion if engaged early. Fastest attrition if ignored. Their departure is invisible until it isn\'t — no one notices junior attrition until the institutional knowledge gap surfaces six months later.',
  },
];

// ─── Tab 4: The Governance Design ───────────────────────────────────────

export const STEERCO = {
  title: 'Transformation Steering Committee',
  cadence: [
    { freq: 'Weekly', meeting: 'Ops Sync', who: 'Transformation Owner + Track Leads', purpose: 'Execution status, blockers, resource allocation', duration: '30 min' },
    { freq: 'Bi-weekly', meeting: 'Middle Layer Review', who: 'Track Leads + Entity Sponsors', purpose: 'Cross-entity dependencies, escalation triage', duration: '45 min' },
    { freq: 'Monthly', meeting: 'SteerCo', who: 'Full committee', purpose: 'Strategic decisions, budget, scope changes', duration: '90 min' },
    { freq: 'Quarterly', meeting: 'CEO Gate', who: 'Rowan + CTO + Head of Transformation', purpose: 'Go/no-go on next phase. The 3 decisions that require their presence.', duration: '60 min' },
  ],
  composition: [
    { role: 'Head of Transformation', entity: 'Central', why: 'Casting vote on cross-entity disputes. Owns the clock.' },
    { role: 'Athene COO or delegate', entity: 'Athene', why: 'Compliance gate authority. Can block anything that touches regulatory surface.' },
    { role: 'Apollo AM Deal Desk representative', entity: 'Apollo AM', why: 'Ensures deal-cycle reality check. Prevents ivory tower scheduling.' },
    { role: 'ISG Client Head', entity: 'ISG', why: 'Client risk veto. Nothing ships to external clients without their sign-off.' },
    { role: 'CTO', entity: 'Central', why: 'Architecture authority. No building two systems when one is needed.' },
    { role: 'CFO delegate', entity: 'Central', why: 'Budget gate. Transformation competes with deal flow for resources.' },
  ],
};

export const RACI_MATRIX = [
  { decision: 'Cross-entity architecture', apollo: 'C', athene: 'C', isg: 'C', transformation: 'R', ceo: 'A' },
  { decision: 'Athene process changes', apollo: 'I', athene: 'R', isg: 'I', transformation: 'A', ceo: 'I' },
  { decision: 'Client-facing changes', apollo: 'I', athene: 'C', isg: 'R', transformation: 'A', ceo: 'I' },
  { decision: 'Budget reallocation (>$1M)', apollo: 'C', athene: 'C', isg: 'C', transformation: 'R', ceo: 'A' },
  { decision: 'Phase gate advancement', apollo: 'C', athene: 'C', isg: 'C', transformation: 'R', ceo: 'A' },
  { decision: 'Technology vendor selection', apollo: 'I', athene: 'C', isg: 'C', transformation: 'R', ceo: 'I' },
  { decision: 'Regulatory filing impact', apollo: 'I', athene: 'R', isg: 'C', transformation: 'I', ceo: 'A' },
  { decision: 'Deal team workflow changes', apollo: 'R', athene: 'I', isg: 'I', transformation: 'A', ceo: 'I' },
];

export const DUAL_CLOCK = {
  dealSprint: {
    label: 'Apollo AM — Deal Sprint Clock',
    color: 'var(--apollo-gold)',
    items: [
      { label: 'Deal sourcing', duration: 'Continuous' },
      { label: 'Due diligence sprint', duration: '60-90 days' },
      { label: 'Execution & close', duration: '30-60 days' },
      { label: 'Portfolio management', duration: 'Quarterly review' },
      { label: 'Exit planning', duration: 'Opportunistic' },
    ],
    nature: 'Irregular, high-intensity bursts with downtime between. Every deal is unique. Scheduling is negotiated, not calendared.',
  },
  complianceGate: {
    label: 'Athene — Compliance Gate Clock',
    color: 'var(--apollo-blue)',
    items: [
      { label: 'Quarterly regulatory filing', duration: 'Fixed deadline' },
      { label: 'Annual statutory exam', duration: 'Scheduled' },
      { label: 'NAIC reporting cycle', duration: 'Calendar-driven' },
      { label: 'Rate filing windows', duration: 'State-specific' },
      { label: 'Capital adequacy review', duration: 'Quarterly' },
    ],
    nature: 'Fixed, non-negotiable, calendar-driven. Miss a filing deadline and regulators respond. No flexibility.',
  },
  collision: 'These two clocks collide every quarter. A transformation program that assumes one cadence will alienate the other entity. The governance architecture must explicitly manage both — separate operational rhythms feeding into shared decision gates.',
};

export const ESCALATION_PROTOCOL = [
  {
    level: 'Level 1 — Track Lead',
    trigger: 'Blocker within a single entity',
    owner: 'Track Lead resolves within 48 hours',
    if_unresolved: 'Escalates to Bi-weekly Middle Layer Review',
  },
  {
    level: 'Level 2 — SteerCo',
    trigger: 'Cross-entity dependency conflict or resource contention',
    owner: 'Head of Transformation makes binding decision at monthly SteerCo',
    if_unresolved: 'Escalates to CEO Gate with documented options and recommendation',
  },
  {
    level: 'Level 3 — CEO Gate',
    trigger: 'Phase advancement, budget >$1M, or regulatory impact decision',
    owner: 'CEO sign-off required. Decision made at quarterly gate — not ad hoc.',
    if_unresolved: 'Program pauses on affected workstream until decision is made. No workarounds.',
  },
];

export const GOVERNANCE_BREAKS = [
  {
    scenario: 'No dual-clock governance',
    whatBreaks: 'Deal team ignores transformation cadence during live deals. Athene compliance team blocks changes that weren\'t filed. Both entities route around the program.',
    when: 'Month 4-6',
  },
  {
    scenario: 'No middle layer buy-in',
    whatBreaks: 'Steering committee approves plans that operations managers don\'t execute. Status reports show green. Reality is red. Disconnect surfaces at month 9 when KPIs don\'t move.',
    when: 'Month 6-9',
  },
  {
    scenario: 'Passive CEO sponsorship',
    whatBreaks: 'First budget review strips transformation funding to cover a deal opportunity. No one fights for the budget because the sponsor isn\'t actively protecting it.',
    when: 'Month 7-10',
  },
  {
    scenario: 'No client risk protocol',
    whatBreaks: 'ISG client director discovers a process change was shipped without their knowledge. One client complaint triggers a full program freeze. Trust destroyed.',
    when: 'Month 3-5',
  },
];

// ─── Tab 5: Momentum Architecture ───────────────────────────────────────

export const MOMENTUM_PHASES = [
  {
    phase: 1,
    name: 'Build the Spine',
    months: '0–6',
    description: 'Stand up governance. Identify champions. Ship first visible wins. Prove the architecture can hold.',
    milestones: [
      { week: 6, label: 'First process improvement shipped' },
      { week: 12, label: 'Handoff Ownership Register live' },
      { week: 18, label: 'First champion presents their win to leadership' },
      { week: 24, label: '3 champions identified and active' },
    ],
    wins: [
      'One NIGO reduction in Athene issuance',
      'One automated report saving ISG analysts 4hrs/week',
      'One AI-augmented deal analysis workflow',
    ],
    risk: 'Overbuilding governance before shipping anything. The spine must produce visible results within 6 weeks or the middle layer concludes it\'s theater.',
  },
  {
    phase: 2,
    name: 'First Real Test',
    months: '7–12',
    description: 'The transformation collides with reality. A major deal cycle, a budget review, a regulatory exam — something bigger than the program demands attention. This is where you find out if the spine holds.',
    milestones: [
      { week: 30, label: 'Survive first deal-cycle collision' },
      { week: 36, label: '12 champions active across entities' },
      { week: 42, label: 'CEO metric in operating review' },
      { week: 48, label: 'Second-gen process improvements shipping' },
    ],
    wins: [
      'Program continues through a live deal cycle without pausing',
      'Budget defended at annual review',
      'Client-facing improvement shipped with ISG sign-off',
    ],
    risk: 'The transformation becomes the thing that gets paused when something urgent happens. If it stops for 4 weeks, restarting takes 12 weeks.',
  },
  {
    phase: 3,
    name: 'Institutionalized or Dependent',
    months: '13–24',
    description: 'The verdict. Either the transformation has become "how we work" or it\'s still "the transformation program." If people are still saying the latter, it hasn\'t stuck.',
    milestones: [
      { week: 60, label: '30 champions across all entities' },
      { week: 72, label: 'First portfolio company deployment' },
      { week: 84, label: 'Transformation function downsizes by design' },
      { week: 96, label: 'Operating model self-sustaining' },
    ],
    wins: [
      'New hires onboard into the new way of working, not the old',
      'Cross-entity process changes ship without transformation team involvement',
      'Portfolio companies requesting the playbook',
    ],
    risk: 'Dependency on the transformation team. If the program can\'t downsize itself by month 18, it hasn\'t institutionalized — it\'s become another bureaucracy.',
  },
];

export const CHAMPION_GROWTH = [
  { label: 'Month 3', count: 3, pct: 10 },
  { label: 'Month 9', count: 12, pct: 40 },
  { label: 'Month 18', count: 30, pct: 100 },
];

export const CEO_METRIC = {
  title: 'One number that follows Marc Rowan into every operating review',
  metric: 'Cross-Entity Process Velocity',
  definition: 'Average cycle time for the top 10 advisor and client journeys that cross Apollo/Athene/ISG boundaries. Measured weekly. Trended monthly. Reported quarterly.',
  why: 'It\'s the single number that captures whether the operating model is actually improving. It doesn\'t measure transformation activity — it measures transformation outcome. If this number isn\'t moving, nothing else matters.',
};

export const KILL_PROTOCOL = {
  title: 'Honorable Exit Path',
  subtitle: 'What happens when the answer at Month 6 is "dead"',
  conditions: [
    'Zero visible wins shipped by week 8',
    'No champion has self-identified by month 4',
    'Middle layer attendance at transformation meetings drops below 50% for 3 consecutive weeks',
    'CEO metric not established or not being reported by month 5',
    'Budget reallocation removes >30% of transformation resources',
  ],
  process: [
    { step: 'Acknowledge', detail: 'Name it. Don\'t zombie forward. Present the evidence to SteerCo: here is what we tried, here is what didn\'t work, here is why.' },
    { step: 'Preserve', detail: 'Extract what worked. The Handoff Ownership Register, the process maps, the champion relationships — these have value independent of the program.' },
    { step: 'Communicate', detail: 'Tell the organization honestly. "We paused because the conditions weren\'t right" is credible. "We succeeded" when everyone knows you didn\'t is career-ending.' },
    { step: 'Redesign', detail: 'Document what would need to change for a second attempt. Different governance? Different sponsor engagement? Different scope? Leave the playbook for the next attempt.' },
  ],
  why: 'Most transformation leaders don\'t have the authority or the framework to wind down gracefully. They zombie forward — burning budget, eroding credibility, and making the next attempt harder. An honorable exit preserves the possibility of a second attempt. A dishonest "success" destroys it.',
};

export const IDENTITY_SHIFT_MARKERS = [
  { signal: 'People stop saying "the transformation program" and start saying "how we work"', phase: 2 },
  { signal: 'New hires are confused when told there used to be a different way', phase: 3 },
  { signal: 'Champions recruit other champions without being asked', phase: 2 },
  { signal: 'Cross-entity process changes happen without the transformation team in the room', phase: 3 },
  { signal: 'Someone from the deal team voluntarily presents an AI workflow to their partners', phase: 2 },
  { signal: 'The transformation budget gets folded into operational budget — not as a cut, but because the distinction no longer makes sense', phase: 3 },
];

// ─── Tab 6: Transformation Simulator ────────────────────────────────────

export const SCENARIO_TYPES = [
  {
    id: 'topdown',
    label: 'Top-Down Mandate',
    description: 'CEO issues directive. Program office drives execution. Authority flows from the top. Speed is high. Buy-in depth is shallow.',
  },
  {
    id: 'champion',
    label: 'Champion-Led Grassroots',
    description: 'Build from operators up. Prove value before scaling. Authority emerges from results. Slower start, deeper roots.',
  },
  {
    id: 'parallel',
    label: 'Parallel Track',
    description: 'Run old and new operating models simultaneously. Migrate gradually. Lowest risk, highest complexity, longest timeline.',
  },
];

export const SIMULATOR_CHOICES = [
  {
    id: 'spine_approach',
    category: 'Spine',
    question: 'How do you build your initial buy-in coalition?',
    context: 'The first 30 days set the political foundation for everything that follows.',
    options: [
      {
        text: 'Start with the CEO mandate — get Rowan to send a firm-wide communication establishing the program',
        deltas: { buyin: -5, velocity: 20, political: -10, clientRisk: 0 },
      },
      {
        text: 'Start with 3 middle managers — find the operators who are already frustrated with the status quo',
        deltas: { buyin: 15, velocity: -5, political: 10, clientRisk: 0 },
      },
      {
        text: 'Start with a proof of concept — ship one small improvement and let it speak for itself',
        deltas: { buyin: 10, velocity: -10, political: 5, clientRisk: -5 },
      },
    ],
  },
  {
    id: 'identity_resistance',
    category: 'Identity',
    question: 'How do you handle the Athene operators who built the current system?',
    context: 'These people have 10-15 years of institutional knowledge. They see the transformation as a critique of their life\'s work.',
    options: [
      {
        text: 'Acknowledge their expertise publicly and make them co-designers of the new process',
        deltas: { buyin: 15, velocity: -10, political: 10, clientRisk: -5 },
      },
      {
        text: 'Run training programs to upskill them on the new tools and processes',
        deltas: { buyin: -5, velocity: 5, political: -5, clientRisk: 0 },
      },
      {
        text: 'Hire new talent alongside them and let the performance gap do the talking',
        deltas: { buyin: -15, velocity: 10, political: -15, clientRisk: 5 },
      },
    ],
  },
  {
    id: 'governance_structure',
    category: 'Governance',
    question: 'How do you resolve the dual-clock problem between Apollo AM and Athene?',
    context: 'Apollo runs deal sprints (60-90 day intensity). Athene runs quarterly compliance gates. They cannot share a transformation cadence.',
    options: [
      {
        text: 'Build separate transformation tracks with shared decision gates at monthly SteerCo',
        deltas: { buyin: 10, velocity: -5, political: 10, clientRisk: -5 },
      },
      {
        text: 'Force a single cadence — weekly sprints across both entities with compliance checkpoints',
        deltas: { buyin: -10, velocity: 15, political: -10, clientRisk: 10 },
      },
      {
        text: 'Let each entity self-govern and reconcile quarterly at the executive level',
        deltas: { buyin: 5, velocity: 5, political: -5, clientRisk: 5 },
      },
    ],
  },
  {
    id: 'first_win',
    category: 'Momentum',
    question: 'What is your first visible win target?',
    context: 'Something must ship within 6 weeks or the middle layer concludes this is theater.',
    options: [
      {
        text: 'Automate one high-volume Athene process (e.g., NIGO reduction in annuity issuance)',
        deltas: { buyin: 10, velocity: 5, political: 5, clientRisk: -5 },
      },
      {
        text: 'Deploy AI-augmented due diligence for one Apollo deal team',
        deltas: { buyin: 5, velocity: 10, political: 5, clientRisk: 0 },
      },
      {
        text: 'Build a cross-entity dashboard showing process health across Apollo/Athene/ISG',
        deltas: { buyin: 5, velocity: -5, political: 10, clientRisk: -5 },
      },
      {
        text: 'Reduce ISG client onboarding time from weeks to days',
        deltas: { buyin: 5, velocity: 5, political: 5, clientRisk: 10 },
      },
    ],
  },
  {
    id: 'deal_cycle_collision',
    category: 'Resilience',
    question: 'A major deal lands at Month 4. The deal team pulls out of transformation work. What do you do?',
    context: 'This will happen. The question is whether you designed for it.',
    options: [
      {
        text: 'Pause the Apollo AM track. Continue Athene and ISG tracks. Resume deal team work after close.',
        deltas: { buyin: 0, velocity: -5, political: 10, clientRisk: 0 },
      },
      {
        text: 'Push through — insist deal team maintains transformation commitments alongside the deal',
        deltas: { buyin: -15, velocity: 5, political: -15, clientRisk: 0 },
      },
      {
        text: 'Use the deal as a transformation opportunity — embed AI tools into the live deal workflow',
        deltas: { buyin: 10, velocity: 10, political: 5, clientRisk: 5 },
      },
    ],
  },
  {
    id: 'budget_review',
    category: 'Resilience',
    question: 'At Month 8, the CFO asks to cut 25% of the transformation budget. How do you respond?',
    context: 'This is the "alive or dead" moment. How you handle the first budget threat determines whether the program survives.',
    options: [
      {
        text: 'Present ROI data from first 6 months — cycle time improvements, cost savings, champion wins',
        deltas: { buyin: 5, velocity: 0, political: 10, clientRisk: 0 },
      },
      {
        text: 'Offer to cut scope — protect the highest-impact workstreams, sacrifice the rest',
        deltas: { buyin: -5, velocity: 5, political: 5, clientRisk: -5 },
      },
      {
        text: 'Escalate to CEO — invoke the $1.5T commitment and argue this is non-optional',
        deltas: { buyin: -5, velocity: 10, political: -10, clientRisk: 0 },
      },
    ],
  },
  {
    id: 'client_risk',
    category: 'Client',
    question: 'An ISG client asks about the transformation program. They\'re concerned about service disruption. What do you say?',
    context: 'External clients knowing about internal transformation is a double-edged sword. Handled well, it builds confidence. Handled poorly, it triggers risk reviews.',
    options: [
      {
        text: 'Proactive transparency — share the roadmap, the safeguards, and the client communication protocol',
        deltas: { buyin: 5, velocity: -5, political: 5, clientRisk: -10 },
      },
      {
        text: 'Minimize — "routine operational improvements, nothing that affects your service"',
        deltas: { buyin: 0, velocity: 5, political: 0, clientRisk: 5 },
      },
      {
        text: 'Invite the client to co-design the changes that affect them',
        deltas: { buyin: 10, velocity: -15, political: 10, clientRisk: -15 },
      },
    ],
  },
  {
    id: 'champion_strategy',
    category: 'Spine',
    question: 'At Month 6, you have 3 champions. How do you scale to 12?',
    context: 'Champion networks compound — but only if the mechanism for growth is designed, not hoped for.',
    options: [
      {
        text: 'Have existing champions present their wins at all-hands meetings and let interest grow organically',
        deltas: { buyin: 10, velocity: -5, political: 5, clientRisk: 0 },
      },
      {
        text: 'Formally appoint 9 more champions from across entities with defined roles and recognition',
        deltas: { buyin: 5, velocity: 10, political: 0, clientRisk: 0 },
      },
      {
        text: 'Create a "transformation lab" where anyone can propose and test improvements with dedicated resources',
        deltas: { buyin: 15, velocity: -5, political: 5, clientRisk: -5 },
      },
    ],
  },
  {
    id: 'portfolio_extension',
    category: 'Portfolio',
    question: 'When do you extend AI capabilities to Apollo\'s portfolio companies?',
    context: 'The internal transformation becomes exponentially more valuable when it generates playbooks for 200+ portfolio companies.',
    options: [
      {
        text: 'Month 12 — after internal capabilities are proven and documented',
        deltas: { buyin: 5, velocity: -5, political: 10, clientRisk: -5 },
      },
      {
        text: 'Month 6 — run a parallel pilot with 2-3 portfolio companies while building internally',
        deltas: { buyin: 5, velocity: 10, political: 0, clientRisk: 10 },
      },
      {
        text: 'Month 18 — only after the operating model is fully institutionalized',
        deltas: { buyin: 0, velocity: -10, political: 10, clientRisk: -10 },
      },
    ],
  },
  {
    id: 'month_12_verdict',
    category: 'Verdict',
    question: 'It\'s Month 12. The CEO asks: "Is this working?" What do you point to?',
    context: 'One sentence, one number, one proof point. This is the moment your credibility is on the line.',
    options: [
      {
        text: 'The CEO metric — cross-entity process velocity is down 35% from baseline',
        deltas: { buyin: 5, velocity: 5, political: 10, clientRisk: 0 },
      },
      {
        text: 'The champion count — 12 operators across 3 entities are running improvements without the transformation team',
        deltas: { buyin: 10, velocity: 0, political: 5, clientRisk: 0 },
      },
      {
        text: 'The portfolio story — 2 portfolio companies are already requesting the playbook',
        deltas: { buyin: 5, velocity: 5, political: 10, clientRisk: 5 },
      },
      {
        text: 'The identity shift — people stopped calling it "the transformation program" three months ago',
        deltas: { buyin: 15, velocity: -5, political: 10, clientRisk: -5 },
      },
    ],
  },
];

export const TRADEOFF_METERS = [
  { id: 'buyin', label: 'Buy-In Depth', description: 'How deep does support go beyond the executive suite?' },
  { id: 'velocity', label: 'Execution Velocity', description: 'How fast can you ship improvements?' },
  { id: 'political', label: 'Political Sustainability', description: 'Will this survive a bad quarter?' },
  { id: 'clientRisk', label: 'Client Risk', description: 'How exposed are external clients during transition?' },
];
