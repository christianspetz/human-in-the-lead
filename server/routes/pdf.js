const express = require('express');
const PDFDocument = require('pdfkit');
const router = express.Router();

const COLORS = {
  navy: '#0F172A',
  darkGray: '#1E293B',
  medGray: '#475569',
  lightGray: '#94A3B8',
  white: '#FFFFFF',
  teal: '#06B6D4',
  amber: '#F59E0B',
  red: '#EF4444',
  green: '#22C55E'
};

function getScoreColor(score) {
  if (score < 30) return COLORS.red;
  if (score < 50) return COLORS.amber;
  if (score < 70) return '#EAB308';
  if (score < 85) return COLORS.green;
  return '#10B981';
}

function addFooter(doc, pageNum) {
  doc.fontSize(8)
    .fillColor(COLORS.lightGray)
    .text(
      'Built by Christian Spetz | Transformation & AI Strategy | linkedin.com/in/christianspetz',
      50, doc.page.height - 40,
      { align: 'center', width: doc.page.width - 100 }
    );
}

function addSectionTitle(doc, title, y) {
  doc.fontSize(14)
    .fillColor(COLORS.teal)
    .text(title, 50, y);
  doc.moveTo(50, y + 20).lineTo(545, y + 20).strokeColor(COLORS.teal).lineWidth(0.5).stroke();
  return y + 30;
}

router.post('/generate-pdf', async (req, res) => {
  try {
    const { results, answers, name } = req.body;

    if (!results) {
      return res.status(400).json({ error: 'Results are required' });
    }

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 60, left: 50, right: 50 },
      bufferPages: true,
      info: {
        Title: 'Human-in-the-Lead: AI Transformation Readiness Report',
        Author: 'Christian Spetz',
        Subject: 'AI Transformation Readiness Assessment'
      }
    });

    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="AI-Transformation-Readiness-Report.pdf"');
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    });

    const pageWidth = doc.page.width - 100;

    // ===== COVER PAGE =====
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(COLORS.navy);

    // Title block
    doc.fontSize(28)
      .fillColor(COLORS.teal)
      .text('Human-in-the-Lead', 50, 120, { width: pageWidth });

    doc.fontSize(16)
      .fillColor(COLORS.white)
      .text('AI Transformation Readiness Report', 50, 160, { width: pageWidth });

    doc.moveTo(50, 195).lineTo(200, 195).strokeColor(COLORS.teal).lineWidth(2).stroke();

    const preparedFor = name || 'Your Organization';
    doc.fontSize(12)
      .fillColor(COLORS.lightGray)
      .text(`Prepared for: ${preparedFor}`, 50, 220, { width: pageWidth })
      .text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 50, 240, { width: pageWidth });

    // Score circle
    const centerX = doc.page.width / 2;
    const scoreColor = getScoreColor(results.readiness_score);
    doc.circle(centerX, 380, 60).lineWidth(6).strokeColor(scoreColor).stroke();
    doc.fontSize(36).fillColor(COLORS.white).text(String(results.readiness_score), centerX - 30, 358, { width: 60, align: 'center' });
    doc.fontSize(10).fillColor(COLORS.lightGray).text('READINESS SCORE', centerX - 50, 425, { width: 100, align: 'center' });

    doc.fontSize(13).fillColor(scoreColor).text(results.readiness_level, 50, 470, { width: pageWidth, align: 'center' });

    // Headline
    doc.fontSize(16).fillColor(COLORS.white).text(`"${results.headline}"`, 50, 510, { width: pageWidth, align: 'center' });

    addFooter(doc);

    // ===== PAGE 2: EXECUTIVE SUMMARY + HUMAN RISK =====
    doc.addPage();
    let y = 50;

    y = addSectionTitle(doc, 'EXECUTIVE SUMMARY', y);
    doc.fontSize(11).fillColor(COLORS.darkGray).text(results.summary, 50, y, { width: pageWidth, lineGap: 4 });
    y = doc.y + 25;

    // Human Factors Risk box
    doc.rect(50, y, pageWidth, 70).fillAndStroke('#FEF3C7', COLORS.amber);
    doc.fontSize(10).fillColor(COLORS.amber).text('⚠ YOUR BIGGEST HUMAN RISK', 65, y + 10, { width: pageWidth - 30 });
    doc.fontSize(10).fillColor(COLORS.darkGray).text(results.human_factors_risk, 65, y + 28, { width: pageWidth - 30, lineGap: 3 });
    y = y + 85;

    // Strengths
    y = addSectionTitle(doc, 'STRENGTHS', y);
    if (results.strengths && Array.isArray(results.strengths)) {
      results.strengths.forEach(s => {
        doc.fontSize(10).fillColor(COLORS.green).text('✓', 55, y);
        doc.fillColor(COLORS.darkGray).text(s, 70, y, { width: pageWidth - 20, lineGap: 3 });
        y = doc.y + 8;
      });
    }
    y += 10;

    // Risks
    y = addSectionTitle(doc, 'KEY RISKS', y);
    if (results.risks && Array.isArray(results.risks)) {
      results.risks.forEach(r => {
        doc.fontSize(10).fillColor(COLORS.red).text('✗', 55, y);
        doc.fillColor(COLORS.darkGray).text(r, 70, y, { width: pageWidth - 20, lineGap: 3 });
        y = doc.y + 8;
      });
    }
    y += 10;

    // Timeline + Budget
    y = addSectionTitle(doc, 'TIMELINE & BUDGET ASSESSMENT', y);
    if (y > 680) { doc.addPage(); y = 50; }
    doc.fontSize(10).fillColor(COLORS.medGray).text('Estimated Timeline:', 50, y);
    doc.fillColor(COLORS.darkGray).text(results.estimated_timeline, 50, y + 15, { width: pageWidth, lineGap: 3 });
    y = doc.y + 12;
    doc.fillColor(COLORS.medGray).text('Budget Assessment:', 50, y);
    doc.fillColor(COLORS.darkGray).text(results.budget_assessment, 50, y + 15, { width: pageWidth, lineGap: 3 });

    addFooter(doc);

    // ===== PAGE 3: RECOMMENDATIONS =====
    doc.addPage();
    y = 50;
    y = addSectionTitle(doc, 'RECOMMENDATIONS', y);

    if (results.recommendations && Array.isArray(results.recommendations)) {
      results.recommendations.forEach((rec, i) => {
        if (y > 680) { doc.addPage(); addFooter(doc); y = 50; }
        const title = typeof rec === 'object' ? rec.title : rec;
        const desc = typeof rec === 'object' ? rec.description : '';

        doc.fontSize(11).fillColor(COLORS.teal).text(`${i + 1}. ${title}`, 50, y, { width: pageWidth });
        y = doc.y + 3;
        if (desc) {
          doc.fontSize(10).fillColor(COLORS.darkGray).text(desc, 65, y, { width: pageWidth - 15, lineGap: 3 });
          y = doc.y + 12;
        }
      });
    }

    y += 10;
    if (y > 580) { doc.addPage(); y = 50; }

    // Quick Wins
    y = addSectionTitle(doc, 'QUICK WINS (NEXT 30 DAYS)', y);
    if (results.quick_wins && Array.isArray(results.quick_wins)) {
      results.quick_wins.forEach((qw, i) => {
        doc.fontSize(10).fillColor(COLORS.teal).text(`→`, 55, y);
        doc.fillColor(COLORS.darkGray).text(qw, 70, y, { width: pageWidth - 20, lineGap: 3 });
        y = doc.y + 8;
      });
    }

    y += 10;
    if (y > 580) { doc.addPage(); y = 50; }

    // Watch-Outs
    y = addSectionTitle(doc, 'WATCH-OUTS FOR YOUR PROFILE', y);
    if (results.watch_outs && Array.isArray(results.watch_outs)) {
      results.watch_outs.forEach(wo => {
        doc.fontSize(10).fillColor(COLORS.amber).text('⚠', 55, y);
        doc.fillColor(COLORS.darkGray).text(wo, 70, y, { width: pageWidth - 20, lineGap: 3 });
        y = doc.y + 8;
      });
    }

    addFooter(doc);

    // ===== YOUR ANSWERS PAGE =====
    doc.addPage();
    y = 50;
    y = addSectionTitle(doc, 'YOUR DIAGNOSTIC ANSWERS', y);

    const questionLabels = {
      q1: 'Industry', q2: 'Organization Size', q3: 'Company Trajectory',
      q4: 'Change Initiative Track Record', q5: 'AI Initiative Status',
      q6: 'Executive Sponsorship', q7: 'Middle Management Champions',
      q8: 'Culture Around Change', q9: 'AI Transformation Budget',
      q10: 'Primary Goal'
    };

    if (answers) {
      Object.entries(questionLabels).forEach(([key, label]) => {
        if (y > 700) { doc.addPage(); addFooter(doc); y = 50; }
        doc.fontSize(9).fillColor(COLORS.medGray).text(label + ':', 50, y);
        doc.fontSize(10).fillColor(COLORS.darkGray).text(answers[key] || 'N/A', 50, y + 13, { width: pageWidth });
        y = doc.y + 10;
      });
    }

    addFooter(doc);

    // ===== CTA PAGE =====
    doc.addPage();
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(COLORS.navy);

    doc.fontSize(22).fillColor(COLORS.teal).text('What Comes Next?', 50, 200, { width: pageWidth, align: 'center' });

    doc.fontSize(12).fillColor(COLORS.white).text(
      'This diagnostic identifies the gaps. Closing them requires a structured approach — executive alignment, change management, governance, and adoption strategy.',
      70, 260, { width: pageWidth - 40, align: 'center', lineGap: 5 }
    );

    doc.fontSize(12).fillColor(COLORS.white).text(
      'If you want help building and executing your AI transformation roadmap, connect with Christian Spetz on LinkedIn.',
      70, 330, { width: pageWidth - 40, align: 'center', lineGap: 5 }
    );

    doc.fontSize(14).fillColor(COLORS.teal).text(
      'linkedin.com/in/christianspetz',
      50, 400, { width: pageWidth, align: 'center', link: 'https://linkedin.com/in/christianspetz', underline: true }
    );

    addFooter(doc);

    doc.end();
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'PDF generation failed' });
  }
});

module.exports = router;
