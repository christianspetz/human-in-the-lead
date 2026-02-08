const express = require('express');
const PDFDocument = require('pdfkit');
const router = express.Router();

const COLORS = { navy: '#0F172A', dark: '#1E293B', med: '#475569', light: '#94A3B8', white: '#FFFFFF', teal: '#06B6D4', amber: '#F59E0B', red: '#EF4444', green: '#22C55E' };
const DIMS = [
  { key: 'strategic_alignment', label: 'Strategic Alignment' },
  { key: 'organizational_capacity', label: 'Organizational Capacity' },
  { key: 'data_maturity', label: 'Data Maturity' },
  { key: 'talent_readiness', label: 'Talent Readiness' },
  { key: 'process_readiness', label: 'Process Readiness' },
  { key: 'investment_posture', label: 'Investment Posture' }
];

function getScoreColor(s) { return s < 30 ? COLORS.red : s < 50 ? COLORS.amber : s < 70 ? '#EAB308' : s < 85 ? COLORS.green : '#10B981'; }

function addSection(doc, title, y, pw) {
  doc.fontSize(14).fillColor(COLORS.teal).text(title, 50, y);
  doc.moveTo(50, y + 20).lineTo(545, y + 20).strokeColor(COLORS.teal).lineWidth(0.5).stroke();
  return y + 30;
}

// Check if we need a new page, return new y
function checkPage(doc, y, needed) {
  if (y + needed > 740) {
    doc.addPage();
    return 50;
  }
  return y;
}

router.post('/generate-pdf', async (req, res) => {
  try {
    const { results, answers, name } = req.body;
    if (!results) return res.status(400).json({ error: 'Results are required' });

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 60, left: 50, right: 50 },
      bufferPages: true,
      info: { Title: 'AI Transformation Readiness Report', Author: 'Christian Spetz' }
    });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => {
      const buf = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="AI-Transformation-Readiness-Report.pdf"');
      res.send(buf);
    });

    const pw = doc.page.width - 100;
    const intro = answers?.intro || {};
    const dims = results.dimension_scores || {};

    // ======= COVER PAGE =======
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(COLORS.navy);
    doc.fontSize(28).fillColor(COLORS.teal).text('Human-in-the-Lead', 50, 100, { width: pw });
    doc.fontSize(16).fillColor(COLORS.white).text('AI Transformation Readiness Report', 50, 140, { width: pw });
    doc.moveTo(50, 175).lineTo(200, 175).strokeColor(COLORS.teal).lineWidth(2).stroke();

    const prepFor = name || 'Your Organization';
    const context = [intro.industry, intro.orgSize].filter(Boolean).join(' | ');
    doc.fontSize(12).fillColor(COLORS.light)
      .text('Prepared for: ' + prepFor, 50, 200)
      .text(context, 50, 218)
      .text('Date: ' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 50, 236);

    // Dimension score bars
    let dy = 290;
    doc.fontSize(10).fillColor(COLORS.light).text('DIMENSIONAL SCORES', 50, dy);
    dy += 20;
    DIMS.forEach(d => {
      const score = dims[d.key] || 0;
      doc.fontSize(9).fillColor(COLORS.light).text(d.label, 50, dy, { width: 180 });
      doc.rect(240, dy + 2, 200, 10).fillAndStroke('#1E293B', '#334155');
      doc.rect(240, dy + 2, (score / 100) * 200, 10).fill(getScoreColor(score));
      doc.fontSize(9).fillColor(COLORS.white).text('' + score, 450, dy);
      dy += 22;
    });

    dy += 20;
    doc.fontSize(13).fillColor(getScoreColor(results.readiness_score || 0))
      .text(results.readiness_level || '', 50, dy, { width: pw, align: 'center' });
    dy += 25;
    doc.fontSize(14).fillColor(COLORS.white)
      .text('"' + (results.headline || '') + '"', 50, dy, { width: pw, align: 'center' });

    // ======= PAGE 2: EXECUTIVE SUMMARY =======
    doc.addPage();
    let y = 50;

    y = addSection(doc, 'EXECUTIVE SUMMARY', y, pw);
    doc.fontSize(11).fillColor(COLORS.dark).text(results.summary || '', 50, y, { width: pw, lineGap: 4 });
    y = doc.y + 25;

    // Human risk - measure text height first
    y = checkPage(doc, y, 100);
    const riskText = results.human_factors_risk || '';
    const riskHeight = doc.heightOfString(riskText, { width: pw - 30, fontSize: 10 });
    const boxHeight = riskHeight + 35;
    doc.rect(50, y, pw, boxHeight).fillAndStroke('#FEF3C7', COLORS.amber);
    doc.fontSize(10).fillColor(COLORS.amber).text('YOUR BIGGEST HUMAN RISK', 65, y + 10, { width: pw - 30 });
    doc.fontSize(10).fillColor(COLORS.dark).text(riskText, 65, y + 28, { width: pw - 30, lineGap: 3 });
    y = y + boxHeight + 20;

    // Strengths
    y = checkPage(doc, y, 80);
    y = addSection(doc, 'STRENGTHS', y, pw);
    (results.strengths || []).forEach(s => {
      y = checkPage(doc, y, 40);
      doc.fontSize(10).fillColor(COLORS.green).text('+', 55, y);
      doc.fillColor(COLORS.dark).text(s, 70, y, { width: pw - 20, lineGap: 3 });
      y = doc.y + 8;
    });
    y += 10;

    // Key Risks
    y = checkPage(doc, y, 80);
    y = addSection(doc, 'KEY RISKS', y, pw);
    (results.risks || []).forEach(r => {
      y = checkPage(doc, y, 40);
      doc.fontSize(10).fillColor(COLORS.red).text('-', 55, y);
      doc.fillColor(COLORS.dark).text(r, 70, y, { width: pw - 20, lineGap: 3 });
      y = doc.y + 8;
    });
    y += 10;

    // Timeline & Investment
    y = checkPage(doc, y, 120);
    y = addSection(doc, 'TIMELINE & INVESTMENT ASSESSMENT', y, pw);
    doc.fontSize(10).fillColor(COLORS.med).text('Estimated Timeline:', 50, y);
    y = doc.y + 3;
    doc.fillColor(COLORS.dark).text(results.estimated_timeline || '', 50, y, { width: pw, lineGap: 3 });
    y = doc.y + 12;
    doc.fillColor(COLORS.med).text('Investment Assessment:', 50, y);
    y = doc.y + 3;
    doc.fillColor(COLORS.dark).text(results.budget_assessment || '', 50, y, { width: pw, lineGap: 3 });
    y = doc.y + 20;

    // ======= RECOMMENDATIONS =======
    doc.addPage();
    y = 50;
    y = addSection(doc, 'RECOMMENDATIONS', y, pw);
    (results.recommendations || []).forEach((rec, i) => {
      y = checkPage(doc, y, 60);
      const title = typeof rec === 'object' ? rec.title : rec;
      const desc = typeof rec === 'object' ? rec.description : '';
      doc.fontSize(11).fillColor(COLORS.teal).text((i + 1) + '. ' + title, 50, y, { width: pw });
      y = doc.y + 3;
      if (desc) {
        doc.fontSize(10).fillColor(COLORS.dark).text(desc, 65, y, { width: pw - 15, lineGap: 3 });
        y = doc.y + 12;
      }
    });
    y += 15;

    // Quick Wins
    y = checkPage(doc, y, 80);
    y = addSection(doc, 'QUICK WINS - NEXT 30 DAYS', y, pw);
    (results.quick_wins || []).forEach(qw => {
      y = checkPage(doc, y, 40);
      doc.fontSize(10).fillColor(COLORS.teal).text('>', 55, y);
      doc.fillColor(COLORS.dark).text(qw, 70, y, { width: pw - 20, lineGap: 3 });
      y = doc.y + 8;
    });
    y += 15;

    // Watch-Outs
    y = checkPage(doc, y, 80);
    y = addSection(doc, 'WATCH-OUTS FOR YOUR PROFILE', y, pw);
    (results.watch_outs || []).forEach(wo => {
      y = checkPage(doc, y, 40);
      doc.fontSize(10).fillColor(COLORS.amber).text('!', 55, y);
      doc.fillColor(COLORS.dark).text(wo, 70, y, { width: pw - 20, lineGap: 3 });
      y = doc.y + 8;
    });

    // ======= CTA PAGE =======
    doc.addPage();
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(COLORS.navy);
    doc.fontSize(22).fillColor(COLORS.teal).text('What Comes Next?', 50, 200, { width: pw, align: 'center' });
    doc.fontSize(12).fillColor(COLORS.white).text(
      'This diagnostic identifies the gaps. Closing them requires a structured approach - executive alignment, change management, governance, and adoption strategy tailored to your industry and processes.',
      70, 260, { width: pw - 40, align: 'center', lineGap: 5 });
    doc.fontSize(12).fillColor(COLORS.white).text(
      'If you want help building and executing your AI transformation roadmap, connect with Christian Spetz on LinkedIn.',
      70, 330, { width: pw - 40, align: 'center', lineGap: 5 });
    doc.fontSize(14).fillColor(COLORS.teal).text('linkedin.com/in/christianspetz', 50, 400, {
      width: pw, align: 'center', link: 'https://linkedin.com/in/christianspetz', underline: true
    });

    // Add footers to ALL pages at the end using bufferPages
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor(COLORS.light)
        .text('Built by Christian Spetz | Transformation & AI Strategy | linkedin.com/in/christianspetz',
          50, doc.page.height - 40, { align: 'center', width: doc.page.width - 100 });
    }

    doc.end();
  } catch (err) { console.error('PDF error:', err); res.status(500).json({ error: 'PDF generation failed' }); }
});

module.exports = router;
