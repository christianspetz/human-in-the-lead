import React, { useState, useEffect } from 'react';

const DIMENSIONS = [
  { key: 'strategic_alignment', label: 'Strategic Alignment', short: 'Strategy' },
  { key: 'organizational_capacity', label: 'Organizational Capacity', short: 'Org Capacity' },
  { key: 'data_maturity', label: 'Data Maturity', short: 'Data' },
  { key: 'talent_readiness', label: 'Talent Readiness', short: 'Talent' },
  { key: 'process_readiness', label: 'Process Readiness', short: 'Process' },
  { key: 'investment_posture', label: 'Investment Posture', short: 'Investment' }
];

function getColor(score) {
  if (score < 30) return '#EF4444';
  if (score < 50) return '#F59E0B';
  if (score < 70) return '#EAB308';
  if (score < 85) return '#22C55E';
  return '#10B981';
}

function RadarChart({ scores }) {
  const size = 280;
  const cx = size / 2, cy = size / 2;
  const levels = 5;
  const maxR = 110;

  const angleStep = (2 * Math.PI) / 6;
  const startAngle = -Math.PI / 2;

  const getPoint = (index, value) => {
    const angle = startAngle + index * angleStep;
    const r = (value / 100) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const gridLines = [];
  for (let lvl = 1; lvl <= levels; lvl++) {
    const r = (lvl / levels) * maxR;
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = startAngle + i * angleStep;
      points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    gridLines.push(<polygon key={lvl} points={points.join(' ')} fill="none" stroke="rgba(71,85,105,0.3)" strokeWidth="1" />);
  }

  const axes = [];
  const labels = [];
  for (let i = 0; i < 6; i++) {
    const angle = startAngle + i * angleStep;
    const endX = cx + maxR * Math.cos(angle);
    const endY = cy + maxR * Math.sin(angle);
    axes.push(<line key={i} x1={cx} y1={cy} x2={endX} y2={endY} stroke="rgba(71,85,105,0.2)" strokeWidth="1" />);

    const labelR = maxR + 22;
    const lx = cx + labelR * Math.cos(angle);
    const ly = cy + labelR * Math.sin(angle);
    labels.push(
      <text key={`l${i}`} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
        fill="#94A3B8" fontSize="9" fontFamily="'DM Sans', sans-serif" fontWeight="500">
        {DIMENSIONS[i].short}
      </text>
    );
  }

  const dimKeys = DIMENSIONS.map(d => d.key);
  const dataPoints = dimKeys.map((key, i) => getPoint(i, scores[key] || 0));
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimProgress(1), 300);
    return () => clearTimeout(timer);
  }, []);

  const animatedPoints = dimKeys.map((key, i) => {
    const val = (scores[key] || 0) * animProgress;
    return getPoint(i, val);
  });

  const polygonPoints = animatedPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="radar-container animate-in">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {gridLines}
        {axes}
        <polygon points={polygonPoints} fill="rgba(6,182,212,0.15)" stroke="#06B6D4" strokeWidth="2"
          style={{ transition: 'all 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
        {animatedPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#06B6D4"
            style={{ transition: 'all 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
        ))}
        {labels}
      </svg>
    </div>
  );
}

function getBadgeClass(level) {
  const l = (level || '').toLowerCase();
  if (l.includes('not ready')) return 'badge-not-ready';
  if (l.includes('early')) return 'badge-early';
  if (l.includes('building')) return 'badge-building';
  if (l.includes('positioned')) return 'badge-positioned';
  if (l.includes('advanced')) return 'badge-advanced';
  return 'badge-building';
}

function RecCard({ title, description, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rec-card animate-in" style={{ animationDelay: `${0.1 * index}s` }}>
      <div className="rec-header" onClick={() => setOpen(!open)}>
        <h4><span style={{ color: 'var(--teal)', marginRight: '0.5rem' }}>{index + 1}.</span>{title}</h4>
        <span className={`rec-toggle ${open ? 'open' : ''}`}>▾</span>
      </div>
      {open && <div className="rec-body" style={{ animation: 'fadeIn 0.25s ease-out' }}>{description}</div>}
    </div>
  );
}

export default function Results({ results, answers, userName, error, onRestart }) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (error) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center' }}>
        <div className="animate-in" style={{ marginTop: '4rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--pure-white)', marginBottom: '1rem' }}>Something went wrong</h2>
          <p style={{ color: 'var(--slate-light)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>{error}. This might be due to high demand. Please try again.</p>
          <button className="btn-primary" onClick={onRestart}>Try Again</button>
        </div>
      </div>
    );
  }
  if (!results) return null;

  const intro = answers?.intro || {};
  const dimScores = results.dimension_scores || {};

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results, answers, name: userName })
      });
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = 'AI-Transformation-Readiness-Report.pdf';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) { alert('PDF download failed. Please try again.'); }
    finally { setDownloading(false); }
  };

  const shareText = `I just completed the AI Transformation Readiness Diagnostic at humaninthelead.ai — interesting to see where our organization stands on data maturity, talent readiness, and process readiness across 6 dimensions. Worth 3 minutes if you're leading AI initiatives.\n\nTry it: https://humaninthelead.ai\n\nBuilt by @Christian Spetz`;

  const handleCopyShare = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://humaninthelead.ai')}`, '_blank');
  };

  return (
    <div className="page-wrapper results-page">
      <div className="results-header">
        {(intro.industry || intro.orgSize) && (
          <p className="results-org-context animate-in">
            AI Transformation Readiness — {intro.industry}{intro.orgSize ? `, ${intro.orgSize}` : ''}
          </p>
        )}

        <RadarChart scores={dimScores} />

        <div className="dimension-scores animate-in animate-in-delay-1">
          {DIMENSIONS.map(dim => (
            <div key={dim.key} className="dim-score-card">
              <div className="dim-value" style={{ color: getColor(dimScores[dim.key] || 0) }}>
                {dimScores[dim.key] || 0}
              </div>
              <div className="dim-label">{dim.label}</div>
            </div>
          ))}
        </div>

        <div className="animate-in animate-in-delay-2">
          <span className={`readiness-badge ${getBadgeClass(results.readiness_level)}`}>{results.readiness_level}</span>
        </div>
        <h2 className="results-headline animate-in animate-in-delay-3">"{results.headline}"</h2>
        <p className="results-summary animate-in animate-in-delay-4">{results.summary}</p>
      </div>

      {results.human_factors_risk && (
        <div className="human-risk-callout animate-in animate-in-delay-4">
          <div className="callout-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Your Biggest Human Risk
          </div>
          <p className="callout-text">{results.human_factors_risk}</p>
        </div>
      )}

      <div className="two-col">
        <div className="result-card strengths animate-in animate-in-delay-3">
          <h3>Strengths</h3>
          <ul>{(results.strengths || []).map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
        <div className="result-card risks animate-in animate-in-delay-4">
          <h3>Key Risks</h3>
          <ul>{(results.risks || []).map((r, i) => <li key={i}>{r}</li>)}</ul>
        </div>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <h3 className="section-title animate-in">Recommendations</h3>
        {(results.recommendations || []).map((rec, i) => {
          const title = typeof rec === 'object' ? rec.title : rec;
          const desc = typeof rec === 'object' ? rec.description : '';
          return <RecCard key={i} title={title} description={desc} index={i} />;
        })}
      </div>

      {results.quick_wins?.length > 0 && (
        <div className="quick-wins animate-in">
          <h3>Quick Wins — Next 30 Days</h3>
          <ul>{results.quick_wins.map((qw, i) => <li key={i}>{qw}</li>)}</ul>
        </div>
      )}

      {results.watch_outs?.length > 0 && (
        <div className="watch-outs animate-in">
          <h3>Watch-Outs for Your Profile</h3>
          <ul>{results.watch_outs.map((wo, i) => <li key={i}>{wo}</li>)}</ul>
        </div>
      )}

      {results.estimated_timeline && (
        <div className="info-section animate-in" style={{ marginBottom: '1rem' }}>
          <div className="info-label">Estimated Timeline</div>
          <div className="info-text">{results.estimated_timeline}</div>
        </div>
      )}

      {results.budget_assessment && (
        <div className="info-section animate-in" style={{ marginBottom: '2.5rem' }}>
          <div className="info-label">Investment Assessment</div>
          <div className="info-text">{results.budget_assessment}</div>
        </div>
      )}

      <div className="results-actions animate-in">
        <button className="btn-primary" onClick={handleDownloadPDF} disabled={downloading}>
          {downloading ? 'Generating...' : '↓ Download Full Report (PDF)'}
        </button>
        <button className="btn-secondary" onClick={handleShareLinkedIn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          Share on LinkedIn
        </button>
      </div>

      <div className="share-copy-box animate-in">
        <p>Copy this to share on LinkedIn:</p>
        <div className="share-copy-text">{shareText}</div>
        <button className="copy-btn" onClick={handleCopyShare}>{copied ? '✓ Copied!' : 'Copy to clipboard'}</button>
      </div>

      <div className="cta-box animate-in">
        <h3>Discuss your results with a transformation advisor</h3>
        <p>This diagnostic identifies the gaps. Closing them requires a structured approach — executive alignment, change management, governance, and adoption strategy tailored to your industry and processes.</p>
        <a href="https://linkedin.com/in/christianspetz" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ textDecoration: 'none' }}>
          Connect with Christian on LinkedIn
        </a>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button className="btn-ghost" onClick={onRestart}>← Take the diagnostic again</button>
      </div>
    </div>
  );
}
