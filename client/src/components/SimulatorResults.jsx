import React, { useState, useMemo } from 'react';
import { AUTOMATION_LEVELS, getTasksForDepartment } from '../data/simulatorData';

const SECTION_MAP = [
  { heading: 'Smart Moves', className: 'smart-moves', accent: 'var(--green)' },
  { heading: 'Risk Flags', className: 'risk-flags', accent: 'var(--red)' },
  { heading: 'Underestimated Complexity', className: 'complexity', accent: 'var(--amber)' },
  { heading: 'Recommendations', className: 'recommendations', accent: 'var(--teal)' },
  { heading: 'Overall Assessment', className: 'assessment', accent: '#A855F7' },
];

const METER_LABELS = {
  cost: 'Cost Impact',
  risk: 'Risk Exposure',
  speed: 'Speed',
  morale: 'Morale',
  quality: 'Quality',
};

function getMeterZone(val) {
  if (val >= 67) return 'green';
  if (val >= 34) return 'yellow';
  return 'red';
}

function parseBlueprint(text) {
  if (!text) return [];
  const sections = [];
  const lines = text.split('\n');
  let current = null;

  for (const line of lines) {
    const headingMatch = line.match(/^###\s*(.+)/);
    if (headingMatch) {
      if (current) sections.push(current);
      const title = headingMatch[1].trim();
      const config = SECTION_MAP.find(s => title.toLowerCase().includes(s.heading.toLowerCase()));
      current = {
        title,
        className: config ? config.className : 'default',
        accent: config ? config.accent : 'var(--teal)',
        content: [],
      };
    } else if (current) {
      current.content.push(line);
    }
  }
  if (current) sections.push(current);
  return sections;
}

export default function SimulatorResults({ blueprint, meters, industry, departments, assignments, onStartOver }) {
  const [showConfig, setShowConfig] = useState(false);

  const sections = useMemo(() => parseBlueprint(blueprint), [blueprint]);

  const levelLabel = (levelId) => {
    const l = AUTOMATION_LEVELS.find(a => a.id === levelId);
    return l ? l.label : levelId;
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '860px' }}>
      <div className="simulator-results animate-in">
        {/* Header */}
        <div className="simulator-results-header">
          <span className="landing-badge" style={{ marginBottom: '1rem', display: 'inline-block' }}>Workforce Blueprint</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', color: 'var(--pure-white)', marginBottom: '0.5rem' }}>
            {industry}
          </h1>
          <p style={{ color: 'var(--slate-light)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {departments.map(d => d.label).join(' · ')} — {Object.keys(assignments).length} tasks configured
          </p>

          {/* Mini meters */}
          {meters && (
            <div className="simulator-mini-meters">
              {Object.entries(METER_LABELS).map(([key, label]) => (
                <div className="simulator-mini-meter" key={key}>
                  <div className="simulator-mini-meter-value" data-zone={getMeterZone(meters[key])}>
                    {meters[key]}
                  </div>
                  <div className="simulator-mini-meter-label">{label}</div>
                  <div className="simulator-mini-meter-bar">
                    <div
                      className="tradeoff-meter-fill"
                      style={{ width: `${meters[key]}%`, height: '4px', borderRadius: '2px' }}
                      data-zone={getMeterZone(meters[key])}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Blueprint sections */}
        {sections.length > 0 ? (
          sections.map((section, idx) => (
            <div className={`blueprint-section ${section.className}`} key={idx}>
              <h3 style={{ color: section.accent }}>{section.title}</h3>
              <div className="blueprint-section-content">
                {section.content.map((line, i) => {
                  const trimmed = line.trim();
                  if (!trimmed) return null;
                  if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    return <p key={i} style={{ paddingLeft: '1rem', position: 'relative', marginBottom: '0.4rem' }}>
                      <span style={{ position: 'absolute', left: 0, color: section.accent }}>&#8227;</span>
                      {trimmed.slice(2)}
                    </p>;
                  }
                  if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                    return <p key={i} style={{ fontWeight: 600, color: 'var(--pure-white)', marginBottom: '0.4rem' }}>{trimmed.replace(/\*\*/g, '')}</p>;
                  }
                  return <p key={i} style={{ marginBottom: '0.4rem' }}>{trimmed.replace(/\*\*/g, '')}</p>;
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="blueprint-section default">
            <p style={{ whiteSpace: 'pre-wrap' }}>{blueprint}</p>
          </div>
        )}

        {/* Config summary (collapsible) */}
        <div className="rec-card" style={{ marginTop: '1.5rem' }}>
          <div className="rec-header" onClick={() => setShowConfig(!showConfig)}>
            <h4>Your Configuration Summary</h4>
            <span className={`rec-toggle${showConfig ? ' open' : ''}`}>▾</span>
          </div>
          {showConfig && (
            <div className="rec-body">
              {departments.map(dept => {
                const tasks = getTasksForDepartment(industry, dept.id);
                return (
                  <div key={dept.id} style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: 'var(--teal)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{dept.label}</strong>
                    {tasks.map(task => (
                      <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid rgba(51,65,85,0.3)', fontSize: '0.85rem' }}>
                        <span>{task.label}</span>
                        <span style={{ color: 'var(--slate-light)', flexShrink: 0, marginLeft: '1rem' }}>{assignments[task.id] ? levelLabel(assignments[task.id]) : '—'}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="simulator-actions">
          <button className="btn-primary" onClick={onStartOver}>
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}
