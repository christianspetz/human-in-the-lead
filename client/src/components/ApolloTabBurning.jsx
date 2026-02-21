import React from 'react';
import {
  AUM_TRAJECTORY,
  SERAFEIM_QUOTE,
  TRILATERAL_SCOPE,
  FAILURE_MODES,
  PROVOCATION_SCENARIO,
  PORTFOLIO_VALUE_CHAIN,
} from '../data/apolloData';

export default function ApolloTabBurning() {
  return (
    <div>
      {/* ── Section Header ───────────────────────────────────── */}
      <div className="apollo-section-spacing">
        <h2 className="apollo-section-title">
          The capital strategy is clear. The operating model is not.
        </h2>
        <p className="apollo-section-subtitle">
          Marc Rowan has committed Apollo to $1.5T in AUM by 2029. The strategy
          is public, the trajectory is real, and the operating model required to
          deliver it does not yet exist.
        </p>
      </div>

      {/* ── AUM Trajectory ───────────────────────────────────── */}
      <div className="apollo-card apollo-section-spacing">
        <div className="apollo-metrics-row">
          {AUM_TRAJECTORY.map((m, i) => (
            <div className="apollo-metric" key={m.year}>
              <div
                className="apollo-metric-value"
                style={i === 0 ? { color: 'var(--apollo-gold)' } : undefined}
              >
                {m.value}
              </div>
              <div className="apollo-metric-sub">
                {m.status} &middot; {m.sub}
              </div>
              <div className="apollo-metric-bar-track">
                <div
                  className="apollo-metric-bar-fill"
                  style={{
                    width: `${m.pct}%`,
                    background:
                      i === 0
                        ? 'var(--apollo-gold)'
                        : 'var(--apollo-border-light)',
                  }}
                />
              </div>
              <div className="apollo-metric-label">
                <span>{m.year}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Serafeim Quote ───────────────────────────────────── */}
      <div className="apollo-section-spacing">
        <div className="apollo-quote">
          <p className="apollo-quote-text">{SERAFEIM_QUOTE.text}</p>
          <p className="apollo-quote-source">
            {SERAFEIM_QUOTE.source} {SERAFEIM_QUOTE.citation}
          </p>
        </div>
      </div>

      {/* ── Trilateral Scope ─────────────────────────────────── */}
      <div className="apollo-section-spacing">
        <h3 className="apollo-section-title">Trilateral Scope</h3>
        <p className="apollo-section-subtitle">
          Three entities, three operating rhythms, one capital strategy.
        </p>
        <div className="apollo-grid-3">
          {TRILATERAL_SCOPE.map((ent) => (
            <div className="apollo-card-inner" key={ent.entity}>
              <div
                className="apollo-label"
                style={{ color: 'var(--apollo-gold)', marginBottom: '0.5rem' }}
              >
                {ent.entity}
              </div>
              <div className="apollo-profile-detail">{ent.role}</div>
              <div className="apollo-profile-detail">{ent.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Failure Modes ────────────────────────────────────── */}
      <div className="apollo-section-spacing">
        <h3 className="apollo-section-title">Five Failure Modes Already Visible</h3>
        <p className="apollo-section-subtitle">
          These are not predictions. They are already happening.
        </p>

        {FAILURE_MODES.map((f, i) => (
          <div className="apollo-failure-card" key={i}>
            <div className="apollo-failure-header">
              <div className="apollo-failure-title">{f.title}</div>
              <div className="apollo-failure-metric">
                <div className="apollo-failure-metric-value">{f.metric}</div>
                <div className="apollo-failure-metric-sub">{f.metricSub}</div>
              </div>
            </div>

            <div className="apollo-failure-evidence">{f.evidence}</div>

            {f.quote && (
              <div className="apollo-quote">
                <p className="apollo-quote-text">{f.quote}</p>
                {f.quoteSource && (
                  <p className="apollo-quote-source">{f.quoteSource}</p>
                )}
              </div>
            )}

            <div className="apollo-failure-source">{f.source}</div>
          </div>
        ))}
      </div>

      {/* ── Provocation Scenario ─────────────────────────────── */}
      <div className="apollo-section-spacing">
        <div className="apollo-provocation">
          <h3 className="apollo-provocation-title">
            {PROVOCATION_SCENARIO.title}
          </h3>
          <p className="apollo-provocation-subtitle">
            {PROVOCATION_SCENARIO.subtitle}
          </p>

          {PROVOCATION_SCENARIO.timeline.map((t, i) => (
            <div className="apollo-timeline-item" key={i}>
              <div className="apollo-timeline-month">{t.month}</div>
              <div className={`apollo-timeline-dot ${t.status}`} />
              <div className="apollo-timeline-text">{t.event}</div>
            </div>
          ))}

          <div className="apollo-timeline-break">
            <div className="apollo-timeline-break-label">Why It Breaks</div>
            <p className="apollo-timeline-break-text">
              {PROVOCATION_SCENARIO.breakReason}
            </p>
          </div>
        </div>
      </div>

      {/* ── Portfolio Value Chain ─────────────────────────────── */}
      <div className="apollo-section-spacing">
        <h3 className="apollo-section-title">{PORTFOLIO_VALUE_CHAIN.title}</h3>
        <p className="apollo-section-subtitle">
          {PORTFOLIO_VALUE_CHAIN.description}
        </p>

        <div className="apollo-value-chain">
          {PORTFOLIO_VALUE_CHAIN.layers.map((layer, i) => (
            <React.Fragment key={layer.label}>
              {i > 0 && (
                <div className="apollo-value-chain-arrow">&rarr;</div>
              )}
              <div className="apollo-value-chain-layer">
                <div className="apollo-value-chain-label">{layer.label}</div>
                {layer.items.map((item, j) => (
                  <div className="apollo-value-chain-item" key={j}>
                    {item}
                  </div>
                ))}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
