import React from 'react';
import {
  MOMENTUM_PHASES,
  CEO_METRIC,
  CHAMPION_GROWTH,
  IDENTITY_SHIFT_MARKERS,
  KILL_PROTOCOL,
} from '../data/apolloData';

export default function ApolloTabMomentum() {
  return (
    <div>
      {/* ── Section Header ───────────────────────────────────── */}
      <div className="apollo-section-spacing">
        <h2 className="apollo-section-title">Momentum Architecture</h2>
        <p className="apollo-section-subtitle">
          How you keep a transformation alive for two years
        </p>
      </div>

      {/* ── Momentum Phases Timeline ─────────────────────────── */}
      <div className="apollo-section-spacing">
        <div className="apollo-momentum-timeline">
          {MOMENTUM_PHASES.map((phase) => (
            <div className="apollo-momentum-phase" key={phase.phase}>
              <div className="apollo-momentum-phase-label">
                Phase {phase.phase} / Months {phase.months}
              </div>
              <div className="apollo-momentum-phase-title">{phase.name}</div>
              <div className="apollo-momentum-phase-desc">
                {phase.description}
              </div>

              {/* Milestones */}
              <div className="apollo-win-markers">
                {phase.milestones.map((ms, i) => (
                  <span className="apollo-win-marker" key={i}>
                    Wk {ms.week}: {ms.label}
                  </span>
                ))}
              </div>

              {/* Key Wins */}
              <div className="apollo-card-inner" style={{ marginTop: '0.75rem' }}>
                <div
                  className="apollo-label"
                  style={{ marginBottom: '0.5rem' }}
                >
                  Key Wins
                </div>
                {phase.wins.map((win, i) => (
                  <div className="apollo-profile-detail" key={i}>
                    &#8250; {win}
                  </div>
                ))}
              </div>

              {/* Risk Callout */}
              <div
                className="apollo-callout apollo-callout-amber"
                style={{ marginTop: '0.75rem' }}
              >
                <span
                  className="apollo-callout-icon"
                  style={{ color: 'var(--apollo-amber)' }}
                >
                  &#9888;
                </span>
                <span className="apollo-callout-text">{phase.risk}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CEO Metric ───────────────────────────────────────── */}
      <div className="apollo-section-spacing">
        <div className="apollo-card apollo-card-gold">
          <div className="apollo-label" style={{ marginBottom: '0.5rem' }}>
            The One Number
          </div>
          <div className="apollo-profile-detail">{CEO_METRIC.title}</div>
          <div
            className="apollo-section-title"
            style={{ color: 'var(--apollo-gold)', margin: '0.75rem 0' }}
          >
            {CEO_METRIC.metric}
          </div>
          <div className="apollo-profile-detail">
            <strong>Definition:</strong> {CEO_METRIC.definition}
          </div>
          <div className="apollo-profile-detail">
            <strong>Why this number:</strong> {CEO_METRIC.why}
          </div>
        </div>
      </div>

      {/* ── Champion Growth ───────────────────────────────────── */}
      <div className="apollo-section-spacing">
        <div className="apollo-card">
          <h3 className="apollo-section-title">Champion Growth</h3>
          <p className="apollo-section-subtitle">
            From 3 early adopters to 30 across all entities
          </p>

          <div className="apollo-champion-bar">
            {CHAMPION_GROWTH.map((col, i) => (
              <div className="apollo-champion-col" key={i}>
                <div className="apollo-champion-count">{col.count}</div>
                <div
                  className="apollo-champion-bar-fill"
                  style={{ height: `${col.pct}%` }}
                />
                <div className="apollo-champion-label">{col.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Identity Shift Markers ────────────────────────────── */}
      <div className="apollo-section-spacing">
        <div className="apollo-card apollo-card-green">
          <h3 className="apollo-section-title">
            Identity Shift Markers — How You Know It's Real
          </h3>
          <p className="apollo-section-subtitle">
            Signals that the transformation has moved from program to culture
          </p>

          {IDENTITY_SHIFT_MARKERS.map((marker, i) => (
            <div className="apollo-profile-card" key={i}>
              <div className="apollo-profile-detail" style={{ marginBottom: '0.25rem' }}>
                {marker.signal}
              </div>
              <span className="apollo-badge apollo-badge-green">
                Phase {marker.phase}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Kill Protocol ─────────────────────────────────────── */}
      <div className="apollo-section-spacing">
        <div className="apollo-kill-protocol">
          <h3 className="apollo-kill-title">{KILL_PROTOCOL.title}</h3>
          <div className="apollo-kill-text" style={{ marginBottom: '1rem' }}>
            {KILL_PROTOCOL.subtitle}
          </div>

          {/* Conditions */}
          <div
            className="apollo-label"
            style={{ color: 'var(--apollo-red)', marginBottom: '0.5rem' }}
          >
            Trigger Conditions
          </div>
          <ol className="apollo-kill-text" style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
            {KILL_PROTOCOL.conditions.map((cond, i) => (
              <li key={i} style={{ marginBottom: '0.35rem' }}>{cond}</li>
            ))}
          </ol>

          {/* Process Steps */}
          <div
            className="apollo-label"
            style={{ color: 'var(--apollo-red)', marginBottom: '0.5rem' }}
          >
            Exit Process
          </div>
          {KILL_PROTOCOL.process.map((step, i) => (
            <div className="apollo-card-inner" key={i} style={{ marginBottom: '0.5rem' }}>
              <div className="apollo-profile-role">
                {i + 1}. {step.step}
              </div>
              <div className="apollo-profile-detail">{step.detail}</div>
            </div>
          ))}

          {/* Why paragraph */}
          <div className="apollo-kill-text" style={{ marginTop: '1rem' }}>
            {KILL_PROTOCOL.why}
          </div>
        </div>
      </div>
    </div>
  );
}
