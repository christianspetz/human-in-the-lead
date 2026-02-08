const express = require('express');
const rateLimit = require('express-rate-limit');
const pool = require('../db');

const router = express.Router();

const analyzeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Too many requests. Please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip
});

const QUESTIONS_META = {
  q1: { label: 'Industry', options: ['Pharma/Biotech/Life Sciences', 'Financial Services', 'Manufacturing/Industrial', 'Technology/Telecom', 'Energy/Utilities', 'Retail/Consumer', 'Healthcare/Public Sector', 'Professional Services', 'Other'] },
  q2: { label: 'Organization Size', options: ['<500 employees', '500-2,000', '2,000-10,000', '10,000-50,000', '50,000+'] },
  q3: { label: 'Company Trajectory', options: ['Growing rapidly (>15% YoY)', 'Growing steadily (5-15%)', 'Flat/stagnant', 'Contracting/restructuring', 'In turnaround/crisis mode'] },
  q4: { label: 'Change Initiative Track Record', options: ['Mostly successful — we execute well', 'Mixed results — some wins some failures', 'Mostly struggled — hard to land change', 'We haven\'t attempted major transformations before', 'Multiple failed attempts — significant change fatigue'] },
  q5: { label: 'AI Initiative Status', options: ['Exploring/researching — no concrete plans yet', 'Pilot stage — testing in 1-2 areas', 'Scaling — expanding from pilots to broader use', 'Stalled — started but lost momentum', 'Haven\'t started — but leadership wants to'] },
  q6: { label: 'Executive Sponsorship', options: ['Yes — CEO/C-suite is personally driving it', 'Partial — one exec champions it but others are lukewarm', 'Delegated — assigned to a VP or director', 'No clear sponsor', 'There\'s interest but no formal commitment'] },
  q7: { label: 'Middle Management Champions', options: ['Yes — identified and engaged champions across functions', 'Some — a few enthusiastic managers but not systematic', 'No — middle management is largely skeptical or uninvolved', 'Middle management is actively resistant', 'We haven\'t thought about this layer yet'] },
  q8: { label: 'Culture Around Change', options: ['Innovative and adaptive — we embrace change', 'Cautious but open — we\'ll try if the case is strong', 'Siloed — each function does its own thing', 'Bureaucratic — slow to decide slower to act', 'Change-fatigued — people are exhausted from recent initiatives'] },
  q9: { label: 'AI Transformation Budget (next 12 months)', options: ['<$100K', '$100K-$500K', '$500K-$2M', '$2M-$10M', '$10M+', 'Not yet defined'] },
  q10: { label: 'Primary Goal', options: ['Reduce operational costs and improve efficiency', 'Accelerate R&D or product development', 'Improve decision-making with better data/insights', 'Transform customer experience', 'Keep up with competitors who are adopting AI', 'Build entirely new AI-powered products or services'] }
};

const SYSTEM_PROMPT = `You are an AI transformation strategist with deep expertise in organizational change management, drawing on best practices from McKinsey, BCG, Kotter, and technology transformation leaders. Based on the diagnostic answers provided, generate a comprehensive but concise AI Transformation Readiness Assessment. Structure your response as JSON with these fields:

readiness_score (0-100)
readiness_level (one of: 'Not Ready', 'Early Stage', 'Building Foundation', 'Well Positioned', 'Advanced')
headline (a punchy one-line verdict tailored to their situation, e.g. 'You have executive will but your middle layer will kill this' or 'Strong foundation — but your budget doesn't match your ambition')
summary (2-3 sentence executive summary)
strengths (array of 2-3 bullet points on what's working)
risks (array of 2-3 bullet points on key risks/gaps — be blunt and specific)
recommendations (array of 4-6 objects each with "title" and "description" fields. These MUST reference the human side of transformation: change management, executive alignment, middle management activation, culture, communication, pacing, governance. Draw on Kotter's 8 steps, ADKAR, McKinsey's influence model, and real transformation patterns.)
quick_wins (array of 2-3 things they can do in the next 30 days)
watch_outs (array of 2-3 things that commonly go wrong for organizations with this exact profile — be specific to their industry, size, and culture)
estimated_timeline (realistic timeline estimate for their AI transformation journey)
budget_assessment (is their stated budget realistic for their goals and size? What should they expect? Be honest.)
human_factors_risk (the single biggest human/people risk for this organization based on their answers — resistance, fatigue, politics, skill gaps, etc. — with a 1-2 sentence explanation)

Be specific and practical. Don't be generic. Tailor everything to their industry, size, culture, and current state. The credibility of this tool comes from telling hard truths, not flattery. If their situation is bad, say so constructively. If their budget is unrealistic, say so. Reference real transformation patterns and failure modes.

IMPORTANT: Return ONLY valid JSON. No markdown, no code fences, no preamble. Just the JSON object.`;

function buildUserPrompt(answers) {
  let prompt = 'Here are the diagnostic answers for this organization:\n\n';
  for (const [key, value] of Object.entries(answers)) {
    const meta = QUESTIONS_META[key];
    if (meta) {
      prompt += `${meta.label}: ${value}\n`;
    }
  }
  return prompt;
}

async function callClaude(answers) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: buildUserPrompt(answers)
      }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const text = data.content.map(c => c.text || '').join('');
  
  // Clean and parse JSON
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  return JSON.parse(cleaned);
}

router.post('/analyze', analyzeLimiter, async (req, res) => {
  try {
    const { answers, name, email } = req.body;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Answers are required' });
    }

    // Validate all 10 questions answered
    for (let i = 1; i <= 10; i++) {
      if (!answers[`q${i}`]) {
        return res.status(400).json({ error: `Question ${i} is not answered` });
      }
    }

    // Call Claude API
    const result = await callClaude(answers);

    // Store in database
    const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    try {
      await pool.query(
        `INSERT INTO submissions (name, email, answers, readiness_score, readiness_level, headline, full_response, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          name || null,
          email || null,
          JSON.stringify(answers),
          result.readiness_score,
          result.readiness_level,
          result.headline,
          JSON.stringify(result),
          ip
        ]
      );
    } catch (dbErr) {
      console.error('Database insert error (non-fatal):', dbErr.message);
    }

    res.json(result);
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
});

module.exports = router;
