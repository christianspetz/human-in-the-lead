const express = require('express');
const router = express.Router();

router.post('/reimagine', async (req, res) => {
  const { role, industry, strengths, concerns, goals } = req.body;
  if (!role || !role.trim()) {
    return res.status(400).json({ error: 'Role is required' });
  }

  const strengthsText = strengths && strengths.length > 0
    ? `Their key strengths are: ${strengths.join(', ')}.`
    : '';
  const concernsText = concerns && concerns.length > 0
    ? `Their main concerns about AI are: ${concerns.join(', ')}.`
    : '';
  const goalsText = goals && goals.length > 0
    ? `If AI freed up time, they'd want to: ${goals.join(', ')}.`
    : '';
  const industryText = industry && industry !== 'Not specified'
    ? `They work in the ${industry} industry.`
    : '';

  const prompt = `You are an empowering AI career coach helping an individual understand how AI will enhance their role — not replace them, but make them better.

THE PERSON:
- Role: "${role.trim()}"
${industryText ? `- ${industryText}` : ''}
${strengthsText ? `- ${strengthsText}` : ''}
${concernsText ? `- ${concernsText}` : ''}
${goalsText ? `- ${goalsText}` : ''}

INSTRUCTIONS:
Frame everything positively and actionably. This is about becoming MORE valuable.

PERSONALIZATION IS KEY:
- Reference their specific strengths in the task breakdown — show which tasks their strengths make them especially good at, even with AI assistance.
- Address their specific concerns directly in the role_summary — acknowledge what worries them and reframe it as an opportunity.
- Align the 90-day plan to their stated goals — if they want more strategic work, the plan should explicitly create space for that.
- For each task, explain what AI handles AND what the human gets to focus on instead.
- For skills, explain HOW to start building them with a concrete first step.

IMPORTANT: Sort the task_breakdown by hours saved (current_hours - future_hours) descending, so the biggest impact tasks appear first.

Return ONLY valid JSON (no markdown, no backticks, no preamble) with this exact structure:
{
  "role_summary": "3-4 sentence empowering summary. Reference their specific strengths and address their concerns directly. Make it personal — this should not read like a generic report.",
  "augmentation_score": <number 0-100 representing how much of the role AI can assist with>,
  "task_breakdown": [
    {
      "task": "Task name",
      "ai_level": "<full|high|moderate|low>",
      "description": "1-2 sentences: what AI handles and what the human focuses on instead. Reference their strengths where relevant.",
      "current_hours": <estimated weekly hours now>,
      "future_hours": <estimated weekly hours with AI assist>
    }
  ],
  "new_skills": [
    {
      "skill": "Skill name",
      "priority": "<critical|high|moderate>",
      "description": "Why this skill makes you more valuable AND a concrete first step to start building it this week"
    }
  ],
  "transition_plan": [
    {
      "phase": "Phase name (action-oriented and encouraging)",
      "period": "Days X-Y",
      "actions": ["action1", "action2", "action3", "action4"]
    }
  ],
  "time_impact": {
    "current_weekly": <total current hours>,
    "future_weekly": <total future hours>,
    "hours_reclaimed": <difference>,
    "strategic_uplift": "<percentage as string with % sign>"
  }
}

Include 6-8 tasks (sorted by hours saved descending), 5-6 new skills, and 3 phases (Days 1-30, 31-60, 61-90). Be specific to the actual role and industry, not generic. Make hours realistic. Ensure task hours sum to the time_impact totals. Tone: encouraging career coach who knows them personally.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const text = (data.content || []).map(c => c.text || '').join('');
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (parsed.task_breakdown) {
      parsed.task_breakdown.sort((a, b) => (b.current_hours - b.future_hours) - (a.current_hours - a.future_hours));
    }

    res.json(parsed);
  } catch (err) {
    console.error('Reimagine error:', err);
    res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
});

module.exports = router;
