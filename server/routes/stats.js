const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_submissions,
        ROUND(AVG(readiness_score), 1) as avg_score,
        MIN(readiness_score) as min_score,
        MAX(readiness_score) as max_score,
        MODE() WITHIN GROUP (ORDER BY answers->>'q1') as most_common_industry,
        MODE() WITHIN GROUP (ORDER BY readiness_level) as most_common_level,
        COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as email_captures,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as last_24h,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as last_7d
      FROM submissions
    `);

    const scoreDistribution = await pool.query(`
      SELECT 
        CASE 
          WHEN readiness_score < 30 THEN 'Not Ready (0-29)'
          WHEN readiness_score < 50 THEN 'Early Stage (30-49)'
          WHEN readiness_score < 70 THEN 'Building Foundation (50-69)'
          WHEN readiness_score < 85 THEN 'Well Positioned (70-84)'
          ELSE 'Advanced (85-100)'
        END as bucket,
        COUNT(*) as count
      FROM submissions
      GROUP BY bucket
      ORDER BY bucket
    `);

    res.json({
      ...result.rows[0],
      score_distribution: scoreDistribution.rows
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
