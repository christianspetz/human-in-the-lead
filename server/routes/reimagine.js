const express = require('express');
const router = express.Router();

router.post('/reimagine', async (req, res) => {
  const { role, industry, concern_level, compliments, growth_area, professional_goals } = req.body;
  if (!role || !role.trim()) {
    return res.status(400).json({ error: 'Role is required' });
  }

  const industryLine = industry && industry !== 'Not specified'
    ? `- Industry: ${industry}` : '';
  const concernLine = concern_level
    ? `- AI concern level: ${concern_level} (${concern_level === 'high' ? 'very worried about AI impact' : concern_level === 'medium' ? 'aware but unsure what to do' : 'curious and excited, not worried'})`
    : '';
  const complimentLine = compliments
    ? `- What colleagues compliment them on: "${compliments}"` : '';
  const growthLine = growth_area
    ? `- What they wish they were better at: "${growth_area}"` : '';
  const goalsLine = professional_goals
    ? `- Professional goals (1-2 years): "${professional_goals}"` : '';

  const prompt = `You are an empowering AI career coach who just had a personal conversation with someone about their career. Based on what they shared, create a deeply personalized AI transformation plan.

THE PERSON:
- Role: "${role.trim()}"
${industryLine}
${concernLine}
${complimentLine}
${growthLine}
${goalsLine}

CRITICAL PERSONALIZATION RULES:
1. The "personal_insight" field should directly reference what they said — quote their words back to them and connect it to the analysis. This should feel like a coach who listened carefully.
2. The "role_summary" must address their concern level:
   - If HIGH concern: Lead with reassurance. Show specifically why their strengths make them irreplaceable, then show how AI makes them even stronger.
   - If MEDIUM concern: Acknowledge the uncertainty, then give them a clear path forward. Emphasize that not knowing where to start is normal.
   - If LOW concern: Match their energy. Be direct about opportunities and how to move fast.
3. In task_breakdown descriptions, connect tasks to their stated strengths AND growth areas. If they said they struggle with data analysis, show how AI handles that for them. If they're great at storytelling, show how AI frees more time for it.
4. The new_skills priorities MUST be ordered by relevance to their professional goals and growth areas. Skills that directly address what they wish they were better at should be "critical".
5. The transition_plan MUST be built around their professional goals. If they want a promotion, the plan should create visible wins. If they want to pivot, the plan should build bridge skills.
6. Sort task_breakdown by hours saved (current_hours - future_hours) descending.

Return ONLY valid JSON (no markdown, no backticks, no preamble) with this exact structure:
{
  "role_summary": "3-4 sentence empowering summary. Address their concern level directly. Reference their strengths. Make it feel like advice from a coach who knows them.",
  "personal_insight": "2-3 sentences that directly reference their specific answers — their compliments, growth area, and goals. Connect the dots between what they shared and what the analysis reveals. Use phrases like 'You mentioned...' and 'Given your goal to...'",
  "augmentation_score": <number 0-100>,
  "task_breakdown": [
    {
      "task": "Task name",
      "ai_level": "<full|high|moderate|low>",
      "description": "1-2 sentences connecting to their strengths or growth areas where relevant.",
      "current_hours": <weekly hours now>,
      "future_hours": <weekly hours with AI>
    }
  ],
  "new_skills": [
    {
      "skill": "Skill name",
      "priority": "<critical|high|moderate>",
      "description": "Why this matters for their specific goals AND a concrete first step this week. Reference their growth area if relevant."
    }
  ],
  "transition_plan": [
    {
      "phase": "Phase name (action-oriented, tied to their goals)",
      "period": "Days X-Y",
      "actions": ["action tied to their specific situation", "action2", "action3", "action4"]
    }
  ],
  "time_impact": {
    "current_weekly": <total current hours>,
    "future_weekly": <total future hours>,
    "hours_reclaimed": <difference>,
    "strategic_uplift": "<percentage string with % sign>"
  }
}

Include 6-8 tasks sorted by hours saved, 5-6 skills prioritized by their goals, and 3 phases (Days 1-30, 31-60, 61-90) aligned to their professional ambitions. Be specific to the role and industry. Make hours realistic. Ensure task hours sum to time_impact totals. Tone: warm, personal career coach — not a consulting report.`;

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
