const express = require('express');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const simulateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 10,
  message: { error: 'Too many requests. Please try again in an hour.' },
  standardHeaders: true, legacyHeaders: false, keyGenerator: (req) => req.ip
});

function buildPrompt(industry, departments, assignments, meters, taskLabels, taskDeptMap, priorities, reflections) {
  const automationLabelMap = {
    full_ai: 'Full AI',
    ai_led: 'AI-Led + Human Oversight',
    human_led: 'Human-Led + AI Assist',
    full_human: 'Full Human',
  };

  let configSummary = '';
  for (const dept of departments) {
    configSummary += `\n### ${dept.label}\n`;
    for (const [taskId, level] of Object.entries(assignments)) {
      if (taskLabels[taskId] && taskDeptMap[taskId] === dept.id) {
        configSummary += `- ${taskLabels[taskId]}: ${automationLabelMap[level] || level}\n`;
      }
    }
  }

  const systemPrompt = `You are a senior workforce transformation strategist and AI implementation advisor. You analyze organizations' AI automation choices and provide candid, actionable Workforce Blueprints. You speak with authority but also pragmatism. You are especially attuned to hidden complexities, regulatory pitfalls, change management challenges, and the human side of AI transformation. You specialize in ${industry}.

Your tone is direct and consultative — like a trusted advisor who tells hard truths. Use ${industry}-specific terminology and reference real regulatory frameworks, industry standards, and common pitfalls where relevant.`;

  const userPrompt = `Generate a Workforce Blueprint for a ${industry} organization that has configured the following AI automation strategy across ${departments.length} departments:
${configSummary}

Their trade-off meter readings are:
- Cost Impact: ${meters.cost}/100 (higher = more savings)
- Risk Exposure: ${meters.risk}/100 (higher = lower risk)
- Speed/Throughput: ${meters.speed}/100 (higher = faster)
- Employee Morale: ${meters.morale}/100 (higher = better morale)
- Quality/Accuracy: ${meters.quality}/100 (higher = better quality)
${priorities && Array.isArray(priorities) && priorities.length > 0 ? `
The organization ranked their strategic priorities in this order:
${priorities.map((p, i) => `${i + 1}. ${p.label}`).join('\n')}

CRITICALLY: Analyze whether their automation choices ALIGN with these stated priorities. If they ranked a priority highly but their automation choices undermine it (e.g., ranking "Employee Satisfaction" #1 but automating 80%+ of tasks to Full AI), call this out explicitly as a misalignment. Conversely, note where their choices reflect their priorities well.` : ''}
${reflections && typeof reflections === 'object' && Object.values(reflections).some(v => v && v.trim()) ? `
The user shared these reflections after completing their automation assignments:
${reflections.surprised ? `- What surprised them: "${reflections.surprised}"` : ''}
${reflections.hardest ? `- Hardest decisions: "${reflections.hardest}"` : ''}
${reflections.board ? `- What their board would prioritize differently: "${reflections.board}"` : ''}

Incorporate these reflections into your analysis. Validate or challenge their observations. If they mention a specific tension, address it directly. If they mention board priorities that differ from their stated priorities, note the governance implications.` : ''}

Provide your analysis using these exact section headings (use ### markdown headings):

### Smart Moves
Identify 2-3 automation choices that are well-calibrated for ${industry}. Explain WHY they work — reference the specific task and automation level. Be specific about the business value.

### Risk Flags
Identify 2-3 choices where the automation level is too aggressive or too conservative for ${industry}. Be specific about what could go wrong. Reference compliance frameworks, regulatory requirements, or operational risks relevant to ${industry}.

### Underestimated Complexity
Identify 1-2 areas where the user likely underestimates the difficulty of implementing their chosen automation level. Address data quality requirements, system integration challenges, change management hurdles, or regulatory barriers specific to ${industry}.

### Recommendations
Provide 3-4 specific, actionable recommendations. Each should reference a specific task and suggest a concrete adjustment with reasoning. Structure them as:
- **Quick Win** (implementable in 30 days): [specific action]
- **Strategic Play** (6-12 month initiative): [specific action]
- **Risk Mitigation** (immediate priority): [specific action]
- **Culture Move** (ongoing): [specific action]

### Overall Assessment
Rate this organization's overall AI transformation approach as one of: **Conservative**, **Balanced**, **Aggressive**, or **Misaligned**. Provide a 2-3 sentence explanation of the rating that references their specific trade-off profile.${priorities && Array.isArray(priorities) && priorities.length > 0 ? ' Include a Priority Alignment assessment (High/Medium/Low) explaining whether their automation choices match their stated priorities.' : ''}

Total response: 700-1000 words. Be specific and actionable throughout.`;

  return { systemPrompt, userPrompt };
}

router.post('/simulate', simulateLimiter, async (req, res) => {
  try {
    const { industry, departments, assignments, meters, taskLabels, taskDeptMap, priorities, reflections } = req.body;

    if (!industry || !departments || !assignments || !meters || !taskLabels || !taskDeptMap) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!Array.isArray(departments) || departments.length < 2 || departments.length > 3) {
      return res.status(400).json({ error: 'Must select 2-3 departments' });
    }

    const { systemPrompt, userPrompt } = buildPrompt(industry, departments, assignments, meters, taskLabels, taskDeptMap, priorities, reflections);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', errorText);
      return res.status(502).json({ error: 'AI analysis failed. Please try again.' });
    }

    const data = await response.json();
    const blueprint = data.content.map(c => c.text || '').join('');

    res.json({ blueprint });
  } catch (err) {
    console.error('Simulate route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
