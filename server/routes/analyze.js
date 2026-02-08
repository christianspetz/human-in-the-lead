const express = require('express');
const rateLimit = require('express-rate-limit');
const pool = require('../db');

const router = express.Router();

const analyzeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 10,
  message: { error: 'Too many requests. Please try again in an hour.' },
  standardHeaders: true, legacyHeaders: false, keyGenerator: (req) => req.ip
});

const SYSTEM_PROMPT = `You are a senior AI transformation strategist with deep expertise in organizational change management, enterprise architecture, and industry-specific transformation patterns. You draw on McKinsey, BCG, Kotter's 8 Steps, Prosci ADKAR, TOGAF, DAMA-DMBOK, and NIST AI RMF.

Based on the diagnostic answers, generate a comprehensive AI Transformation Readiness Assessment. Return ONLY valid JSON with these fields:

dimension_scores (object with exactly these 6 keys, each 0-100):
  - strategic_alignment (from: exec sponsorship, timeline urgency, goal alignment)
  - organizational_capacity (from: change experience, middle management, culture)
  - data_maturity (from: data landscape)
  - talent_readiness (from: AI/data talent)
  - process_readiness (from: targeted processes, AI initiative status)
  - investment_posture (from: investment approach)

readiness_level (one of: 'Not Ready', 'Early Stage', 'Building Foundation', 'Well Positioned', 'Advanced')

headline (punchy one-line verdict. Be specific: 'You have executive will but your frozen middle will kill this' or 'Strong foundation but your data isnt ready for what youre planning')

summary (2-3 sentences referencing their industry, size, and dimensional gaps)

strengths (array of 2-3 specific strengths referencing dimensions)

risks (array of 2-3 specific risks. Reference dimensional gaps. Example: 'Strategic alignment of 78 paired with data maturity of 32 creates a dangerous execution gap')

recommendations (array of 4-6 objects with "title" and "description". MUST be industry-specific using real terminology (pharma: GxP, 21 CFR Part 11; finance: SR 11-7, SOX; manufacturing: OT/IT, ISA-95; healthcare: HIPAA, EHR). MUST reference their target processes specifically. MUST ground in change frameworks. Each description 2-3 concrete sentences.)

quick_wins (array of 2-3 concrete 30-day actions)

watch_outs (array of 2-3 profile-specific failure patterns)

estimated_timeline (realistic, referencing their starting point and processes)

budget_assessment (honest assessment of their investment posture vs goals and industry benchmarks)

human_factors_risk (biggest people risk, 2-3 sentences. Call out frozen middle, change fatigue, skill gaps specifically)

Nuanced scoring: NOT linearly more-is-better. 6+ target processes = boiling the ocean risk. High exec sponsorship + low middle management = frozen middle. High investment + low data maturity = infrastructure gap.

Tell hard truths with specificity. Every sentence should make them think this tool understands their situation.`;

function buildUserPrompt(answers) {
  let prompt = 'DIAGNOSTIC ANSWERS:\n\n';
  if (answers.intro) {
    prompt += `Industry: ${answers.intro.industry}\nOrganization Size: ${answers.intro.orgSize}\nRespondent Role: ${answers.intro.role}\n\n`;
  }
  const labels = {
    q1: 'Change Experience', q2: 'AI Initiative Status', q3: 'Executive Sponsorship',
    q4: 'Middle Management Champions', q5: 'Culture Around Change', q6: 'Investment Posture',
    q7: 'Target Processes', q8: 'Data Landscape', q9: 'AI/Data Talent',
    q10: 'Primary Strategic Objective', q11: 'Timeline Driver'
  };
  for (const [key, label] of Object.entries(labels)) {
    const val = answers[key];
    if (val) prompt += `${label}: ${Array.isArray(val) ? val.join('; ') : val}\n`;
  }
  return prompt;
}

async function callClaude(answers) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 4000, system: SYSTEM_PROMPT, messages: [{ role: 'user', content: buildUserPrompt(answers) }] })
  });
  if (!response.ok) { const errText = await response.text(); throw new Error(`Claude API error: ${response.status} - ${errText}`); }
  const data = await response.json();
  const text = data.content.map(c => c.text || '').join('');
  return JSON.parse(text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim());
}

router.post('/analyze', analyzeLimiter, async (req, res) => {
  try {
    const { answers, name, email } = req.body;
    if (!answers || typeof answers !== 'object') return res.status(400).json({ error: 'Answers are required' });

    const result = await callClaude(answers);
    const dims = result.dimension_scores || {};
    const dimValues = Object.values(dims).filter(v => typeof v === 'number');
    result.readiness_score = dimValues.length > 0 ? Math.round(dimValues.reduce((a, b) => a + b, 0) / dimValues.length) : 0;

    const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    try {
      await pool.query(
        `INSERT INTO submissions (name, email, answers, readiness_score, readiness_level, headline, full_response, ip_address) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [name || null, email || null, JSON.stringify(answers), result.readiness_score, result.readiness_level, result.headline, JSON.stringify(result), ip]
      );
    } catch (dbErr) { console.error('DB insert error:', dbErr.message); }

    res.json(result);
  } catch (err) { console.error('Analysis error:', err); res.status(500).json({ error: 'Analysis failed. Please try again.' }); }
});

module.exports = router;
