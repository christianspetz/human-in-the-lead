import React from 'react';
import {
  DUAL_CLOCK,
  STEERCO,
  RACI_MATRIX,
  ESCALATION_PROTOCOL,
  GOVERNANCE_BREAKS,
} from '../data/apolloData';

const RACI_COLUMNS = [
  { key: 'decision', label: 'Decision' },
  { key: 'apollo', label: 'Apollo AM' },
  { key: 'athene', label: 'Athene' },
  { key: 'isg', label: 'ISG' },
  { key: 'transformation', label: 'Transformation' },
  { key: 'ceo', label: 'CEO' },
];

function RaciBadge({ value }) {
  if (!value) return null;
  return (
    <span className={`apollo-raci-badge apollo-raci-${value}`}>
      {value}
    </span>
  );
}

export default function ApolloTabGovernance() {
  return (
    <div>
      {/* ── Section Header ───────────────────────────────────── */}
      <div className="apollo-section-spacing">
        <h2 className="apollo-section-title">The Governance Design</h2>
        <p className="apollo-section-subtitle">
          How decisions get made across three entities with two operating clocks
        </p>
      </div>

      {/* ── Dual Clock ───────────────────────────────────────── */}
      <div className="apollo-section-spacing">
        <div className="apollo-dual-clock">
          {/* Deal Sprint Clock */}
          <div className="apollo-clock-track">
            <div
              className="apollo-clock-label"
              style={{ color: DUAL_CLOCK.dealSprint.color }}
            >
              {DUAL_CLOCK.dealSprint.label}
            </div>
            <div className="apollo-clock-items">
              {DUAL_CLOCK.dealSprint.items.map((item, i) => (
                <div className="apollo-clock-item" key={i}>
                  <span
                    className="apollo-clock-dot"
                    style={{ background: DUAL_CLOCK.dealSprint.color }}
                  />
                  <span>{item.label} — {item.duration}</span>
                </div>
              ))}
            </div>
            <div className="apollo-profile-detail" style={{ marginTop: '0.75rem' }}>
              {DUAL_CLOCK.dealSprint.nature}
            </div>
          </div>

          {/* Compliance Gate Clock */}
          <div className="apollo-clock-track">
            <div
              className="apollo-clock-label"
              style={{ color: DUAL_CLOCK.complianceGate.color }}
            >
              {DUAL_CLOCK.complianceGate.label}
            </div>
            <div className="apollo-clock-items">
              {DUAL_CLOCK.complianceGate.items.map((item, i) => (
                <div className="apollo-clock-item" key={i}>
                  <span
                    className="apollo-clock-dot"
                    style={{ background: DUAL_CLOCK.complianceGate.color }}
                  />
                  <span>{item.label} — {item.duration}</span>
                </div>
              ))}
            </div>
            <div className="apollo-profile-detail" style={{ marginTop: '0.75rem' }}>
              {DUAL_CLOCK.complianceGate.nature}
            </div>
          </div>
        </div>

        {/* Collision callout */}
        <div className="apollo-callout apollo-callout-amber">
          <span className="apollo-callout-icon" style={{ color: 'var(--apollo-amber)' }}>
            &#9888;
          </span>
          <span className="apollo-callout-text">{DUAL_CLOCK.collision}</span>
        </div>
      </div>

      {/* ── SteerCo Composition ───────────────────────────────── */}
      <div className="apollo-section-spacing">
        <div className="apollo-card">
          <h3 className="apollo-section-title">{STEERCO.title}</h3>
          <p className="apollo-section-subtitle">Composition</p>

          {STEERCO.composition.map((member, i) => (
            <div className="apollo-profile-card" key={i}>
              <div className="apollo-profile-role">{member.role}</div>
              <div className="apollo-profile-detail">
                <span className="apollo-badge" style={{ marginRight: '0.5rem' }}>
                  {member.entity}
                </span>
              </div>
              <div className="apollo-profile-detail">{member.why}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SteerCo Cadence ───────────────────────────────────── */}
      <div className="apollo-section-spacing">
        <div className="apollo-card">
          <h3 className="apollo-section-title">Meeting Cadence</h3>
          <p className="apollo-section-subtitle">
            Four rhythms — from weekly execution to quarterly CEO gates
          </p>

          <table className="apollo-raci-table">
            <thead>
              <tr>
                <th>Frequency</th>
                <th>Meeting</th>
                <th>Who</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {STEERCO.cadence.map((row, i) => (
                <tr key={i}>
                  <td>{row.freq}</td>
                  <td>{row.meeting}</td>
                  <td>{row.who}</td>
                  <td>{row.purpose}</td>
                  <td>{row.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── RACI Matrix ───────────────────────────────────────── */}
      <div className="apollo-section-spacing">
        <div className="apollo-card">
          <h3 className="apollo-section-title">RACI Matrix</h3>
          <p className="apollo-section-subtitle">
            Who is Responsible, Accountable, Consulted, and Informed on each decision type
          </p>

          <table className="apollo-raci-table">
            <thead>
              <tr>
                {RACI_COLUMNS.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RACI_MATRIX.map((row, i) => (
                <tr key={i}>
                  <td>{row.decision}</td>
                  <td><RaciBadge value={row.apollo} /></td>
                  <td><RaciBadge value={row.athene} /></td>
                  <td><RaciBadge value={row.isg} /></td>
                  <td><RaciBadge value={row.transformation} /></td>
                  <td><RaciBadge value={row.ceo} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Escalation Protocol ───────────────────────────────── */}
      <div className="apollo-section-spacing">
        <h3 className="apollo-section-title">Escalation Protocol</h3>
        <p className="apollo-section-subtitle">
          Three levels — from track-level blockers to CEO-gate decisions
        </p>

        {ESCALATION_PROTOCOL.map((esc, i) => (
          <div className="apollo-card" key={i}>
            <div className="apollo-profile-role">{esc.level}</div>
            <div className="apollo-profile-detail">
              <strong>Trigger:</strong> {esc.trigger}
            </div>
            <div className="apollo-profile-detail">
              <strong>Owner:</strong> {esc.owner}
            </div>
            <div className="apollo-profile-detail">
              <strong>If unresolved:</strong> {esc.if_unresolved}
            </div>
          </div>
        ))}
      </div>

      {/* ── Governance Breaks ─────────────────────────────────── */}
      <div className="apollo-section-spacing">
        <h3 className="apollo-section-title">
          What Breaks If Governance Is Wrong
        </h3>
        <p className="apollo-section-subtitle">
          Four scenarios where governance failure kills the transformation
        </p>

        {GOVERNANCE_BREAKS.map((gb, i) => (
          <div className="apollo-callout apollo-callout-red" key={i}>
            <span className="apollo-callout-icon" style={{ color: 'var(--apollo-red)' }}>
              &#10006;
            </span>
            <div className="apollo-callout-text">
              <div>
                <strong>{gb.scenario}</strong>
                <span className="apollo-badge apollo-badge-red" style={{ marginLeft: '0.5rem' }}>
                  {gb.when}
                </span>
              </div>
              <div style={{ marginTop: '0.35rem' }}>{gb.whatBreaks}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
