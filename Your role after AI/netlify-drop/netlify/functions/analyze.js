exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type" }, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const { role, type } = JSON.parse(event.body);
  if (!role || !role.trim()) {
    return { statusCode: 400, body: JSON.stringify({ error: "Role is required" }) };
  }

  const prompt = `You are an empowering AI career coach helping individuals understand how AI will enhance their role — not replace them, but make them better. Analyze the job role: "${role.trim()}"

Frame everything positively and actionably. This is about becoming MORE valuable. For each task, explain what AI handles AND what the human gets to focus on instead. For skills, explain HOW to start building them. For the plan, make it feel achievable and exciting.

IMPORTANT: Sort the task_breakdown by hours saved (current_hours - future_hours) descending, so the biggest impact tasks appear first.

Return ONLY valid JSON (no markdown, no backticks, no preamble) with this exact structure:
{
  "role_summary": "2-3 sentence empowering summary of how AI elevates this role. Focus on what they gain, not what they lose.",
  "augmentation_score": <number 0-100 representing how much of the role AI can assist with>,
  "task_breakdown": [
    {
      "task": "Task name",
      "ai_level": "<full|high|moderate|low>",
      "description": "1-2 sentences: what AI handles and what the human focuses on instead. Make it encouraging.",
      "current_hours": <estimated weekly hours now>,
      "future_hours": <estimated weekly hours with AI assist>
    }
  ],
  "new_skills": [
    {
      "skill": "Skill name",
      "priority": "<critical|high|moderate>",
      "description": "Why this skill makes you more valuable AND a concrete first step to start building it"
    }
  ],
  "transition_plan": [
    {
      "phase": "Phase name (make it action-oriented and encouraging)",
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

Include 6-8 tasks (sorted by hours saved descending), 5-6 new skills, and 3 phases (Days 1-30, 31-60, 61-90). Be specific to the actual role, not generic. Make hours realistic. Ensure task hours sum to the time_impact totals. Tone: encouraging career coach, not consulting report.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.map((c) => c.text || "").join("") || "";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    // Sort by hours saved descending
    if (parsed.task_breakdown) {
      parsed.task_breakdown.sort((a, b) => (b.current_hours - b.future_hours) - (a.current_hours - a.future_hours));
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    };
  } catch (err) {
    console.error("API error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Analysis failed. Please try again." }),
    };
  }
};
