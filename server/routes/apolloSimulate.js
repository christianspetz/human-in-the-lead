const express = require('express');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const apolloSimulateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Too many simulation requests. Please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
});

// ─── Choice question/option mapping (server-side mirror of client data) ───

const CHOICE_QUESTIONS = {
  spine_approach: {
    question: 'Initial buy-in approach',
    options: [
      'CEO mandate communication',
      'Start with 3 frustrated middle managers',
      'Ship one proof of concept first',
    ],
  },
  identity_resistance: {
    question: 'Handling Athene operators who built the current system',
    options: [
      'Co-design with them — acknowledge expertise and make them co-designers',
      'Training programs to upskill on new tools and processes',
      'Hire alongside and let performance gap speak',
    ],
  },
  governance_structure: {
    question: 'Resolving the dual-clock problem between Apollo AM and Athene',
    options: [
      'Separate transformation tracks with shared decision gates at monthly SteerCo',
      'Force a single cadence — weekly sprints across both entities with compliance checkpoints',
      'Let each entity self-govern and reconcile quarterly at executive level',
    ],
  },
  first_win: {
    question: 'First visible win target',
    options: [
      'Automate high-volume Athene process (NIGO reduction in annuity issuance)',
      'Deploy AI-augmented due diligence for one Apollo deal team',
      'Build cross-entity dashboard showing process health across Apollo/Athene/ISG',
      'Reduce ISG client onboarding time from weeks to days',
    ],
  },
  deal_cycle_collision: {
    question: 'Deal team pulls out at Month 4 due to major deal',
    options: [
      'Pause Apollo AM track, continue Athene and ISG, resume after close',
      'Push through — insist deal team maintains transformation commitments',
      'Embed AI tools into the live deal workflow as transformation opportunity',
    ],
  },
  budget_review: {
    question: 'CFO asks to cut 25% of transformation budget at Month 8',
    options: [
      'Present ROI data from first 6 months — cycle time improvements, cost savings, champion wins',
      'Offer to cut scope — protect highest-impact workstreams, sacrifice the rest',
      'Escalate to CEO — invoke $1.5T commitment and argue non-optional',
    ],
  },
  client_risk: {
    question: 'ISG client asks about transformation and is concerned about service disruption',
    options: [
      'Proactive transparency — share roadmap, safeguards, client communication protocol',
      'Minimize — "routine operational improvements, nothing affecting your service"',
      'Invite client to co-design changes that affect them',
    ],
  },
  champion_strategy: {
    question: 'Scaling from 3 champions to 12 at Month 6',
    options: [
      'Existing champions present wins at all-hands, let interest grow organically',
      'Formally appoint 9 more champions with defined roles and recognition',
      'Create a transformation lab where anyone can propose and test improvements',
    ],
  },
  portfolio_extension: {
    question: 'When to extend AI capabilities to portfolio companies',
    options: [
      'Month 12 — after internal capabilities proven and documented',
      'Month 6 — parallel pilot with 2-3 portfolio companies while building internally',
      'Month 18 — only after operating model fully institutionalized',
    ],
  },
  month_12_verdict: {
    question: 'CEO asks "Is this working?" at Month 12 — what do you point to',
    options: [
      'CEO metric — cross-entity process velocity down 35% from baseline',
      'Champion count — 12 operators across 3 entities running improvements without transformation team',
      'Portfolio story — 2 portfolio companies already requesting the playbook',
      'Identity shift — people stopped calling it "the transformation program" three months ago',
    ],
  },
};

const SCENARIO_LABELS = {
  topdown: 'Top-Down Mandate',
  champion: 'Champion-Led Grassroots',
  parallel: 'Parallel Track',
};

// ─── Prompt construction ──────────────────────────────────────────────────

function buildPrompt(scenario, choices, meterReadings) {
  const scenarioLabel = SCENARIO_LABELS[scenario] || scenario;

  const systemPrompt = `You are a senior transformation strategist with deep expertise in financial services operating model redesign. You have studied Apollo Global Management extensively — its dual-entity structure (Apollo Asset Management and Athene), its growth from $938B AUM targeting $1.5T by 2029, and the structural tensions that make transformation uniquely difficult here.

Key context you internalize:
- Apollo AM runs deal sprints (60-90 day intensity bursts). Athene runs quarterly compliance gates tied to NAIC reporting and state insurance regulation. These two operating clocks collide every quarter.
- Athene is a $250B balance sheet insurance platform generating 85% of Apollo's revenue ($22B of $26B) through retirement services. It is not a funding source for PE — it IS the business.
- ISG is the external B2B advisory arm serving other insurance company balance sheets. Fee-based mandates, multi-jurisdiction compliance, extreme client-risk sensitivity.
- Athene ranked below J.D. Power industry average in Individual Annuity Customer Satisfaction for 2 consecutive years (2024 and 2025). This is not a blip.
- Related-party assets nearly doubled from $22.6B to $40.1B in one year. NAIC scrutiny intensifying. New York and Virginia regulators pushing back on Iowa's permissive capital treatment.
- Six key archetypes with different inertia profiles: deal team members (time-scarce, will always prioritize live deals), Athene operators (identity-threatened, built the current system), ISG client liaisons (risk-averse, one client complaint ends careers), transformation skeptics (rational prior from failed programs), mandate carriers (passive sponsors with no bandwidth), new joiners (highest AI capability but lowest organizational standing).

You are direct, specific, and unflinching. You do not hedge with "it depends" without saying what it depends on. You name the person, the mechanism, and the month when things break. You write like a strategist who has seen transformations fail and knows exactly why.`;

  // Build choice summary
  let choiceSummary = '';
  for (const [choiceId, optionIndex] of Object.entries(choices)) {
    const q = CHOICE_QUESTIONS[choiceId];
    if (q && q.options[optionIndex] !== undefined) {
      choiceSummary += `Q: ${q.question} — Chose: "${q.options[optionIndex]}"\n`;
    }
  }

  const userPrompt = `A transformation leader at Apollo Global Management has run a simulation using the "${scenarioLabel}" approach. They made the following 10 strategic choices:

${choiceSummary}
Their resulting tradeoff meter readings:
- Buy-In Depth: ${meterReadings.buyin}/100
- Execution Velocity: ${meterReadings.velocity}/100
- Political Sustainability: ${meterReadings.political}/100
- Client Risk Exposure: ${meterReadings.clientRisk}/100

Analyze this transformation strategy as an 18-month simulation. Write your response using EXACTLY these section headings (### markdown headings):

### What Goes Right
What works about this combination of choices given the ${scenarioLabel} approach? Be specific about which choices reinforce each other and why. Reference the Apollo/Athene/ISG structure directly.

### What Breaks
What fails or creates friction? Identify the specific month and mechanism. Which archetype resists? Which governance gap opens? Name the collision point between choices.

### The Crisis Point
Identify the single highest-risk moment in the 18-month arc. What month does it hit? What triggers it? Who is in the room? What does the transformation leader wish they had done differently 3 months earlier?

### What You'd Have Needed to Do Differently
Given their specific choices, what 2-3 adjustments would have changed the outcome? Be concrete — name the choice they should have made differently and why, or the structural addition they needed.

### Verdict
Rate this approach as one of: **Viable**, **Fragile**, **Doomed**, or **Depends on One Person**. Then explain in 2-3 sentences why. Name the person or mechanism it depends on if applicable.

Total response: 800-1200 words. Be specific, direct, and grounded in Apollo's actual structure. No generic transformation advice.`;

  return { systemPrompt, userPrompt };
}

// ─── Route ────────────────────────────────────────────────────────────────

router.post('/apollo-simulate', apolloSimulateLimiter, async (req, res) => {
  try {
    const { scenario, choices, meterReadings } = req.body;

    if (!scenario || !choices || !meterReadings) {
      return res.status(400).json({ error: 'Missing required fields: scenario, choices, meterReadings' });
    }

    if (!SCENARIO_LABELS[scenario]) {
      return res.status(400).json({ error: 'Invalid scenario type' });
    }

    if (typeof choices !== 'object' || Object.keys(choices).length === 0) {
      return res.status(400).json({ error: 'No choices provided' });
    }

    const { systemPrompt, userPrompt } = buildPrompt(scenario, choices, meterReadings);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error (apollo-simulate):', errorText);
      return res.status(502).json({ error: 'AI simulation failed. Please try again.' });
    }

    const data = await response.json();
    const analysis = data.content.map((c) => c.text || '').join('');

    res.json({ analysis });
  } catch (err) {
    console.error('Apollo simulate route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
