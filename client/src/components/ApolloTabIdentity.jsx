import React from 'react';
import {
  IDENTITY_THESIS,
  ARCHETYPES,
  RESEARCH_SOURCES,
} from '../data/apolloData';

export default function ApolloTabIdentity() {
  return (
    <div>
      {/* ── Section Header ───────────────────────────────────── */}
      <div className="apollo-section-spacing">
        <h2 className="apollo-section-title">The Identity Problem</h2>
      </div>

      {/* ── Identity Thesis ──────────────────────────────────── */}
      <div className="apollo-callout-gold apollo-section-spacing">
        <div className="apollo-callout-text">
          <strong>{IDENTITY_THESIS.core}</strong>
          <br />
          <br />
          {IDENTITY_THESIS.elaboration}
        </div>
      </div>

      {/* ── Research Framework ───────────────────────────────── */}
      <div className="apollo-card apollo-card-blue apollo-section-spacing">
        <h3 className="apollo-section-title">
          Why Classic Change Management Fails on AI Transformations
        </h3>

        <p className="apollo-failure-evidence">
          Bandura's self-efficacy framework (1997) demonstrates that perceived
          capability governs behavior independent of actual capability. An
          operator who believes they cannot work in the new model will not, even
          if they demonstrably can. The intervention must be experiential, not
          educational -- people need to prove to themselves that they can
          operate in the new world.
        </p>

        <p className="apollo-failure-evidence">
          Mollick et al.'s field experiments (2023) at Harvard Business School
          provide direct evidence: knowledge workers using AI tools showed
          significant productivity and quality gains, but only when the tools
          were integrated into their actual workflows. Training alone, without
          workflow integration, produced no lasting change. Co-design, not
          consultation.
        </p>

        <p className="apollo-failure-evidence">
          O'Reilly &amp; Tushman's ambidexterity framework (2004) addresses the
          structural question directly: organizations that succeed at
          transformation run exploration and exploitation simultaneously, not
          sequentially. The new model operates in parallel with the old, not as
          a replacement announcement. This is how you avoid triggering the
          identity threat that causes passive resistance.
        </p>

        <div className="apollo-failure-source">
          Sources: Bandura (1997), <em>Self-Efficacy: The Exercise of
          Control</em>; Mollick et al. (2023), <em>Navigating the Jagged
          Technological Frontier</em>; O'Reilly &amp; Tushman (2004),{' '}
          <em>The Ambidextrous Organization</em>
        </div>
      </div>

      {/* ── Archetypes ───────────────────────────────────────── */}
      <div className="apollo-section-spacing">
        <h3 className="apollo-section-title">Six Identity Archetypes</h3>
        <p className="apollo-section-subtitle">
          Each archetype represents a distinct identity position inside the
          transformation. The intervention for each is different because the
          source of resistance is different.
        </p>

        <div className="apollo-archetype-grid">
          {ARCHETYPES.map((arch) => (
            <div
              className="apollo-archetype-card"
              key={arch.name}
              style={{ borderLeftColor: arch.color }}
            >
              <div
                className="apollo-archetype-name"
                style={{ color: arch.color }}
              >
                {arch.name}
              </div>

              <div className="apollo-archetype-section">
                <div
                  className="apollo-archetype-label"
                  style={{ color: arch.color }}
                >
                  What They Care About
                </div>
                <div className="apollo-archetype-text">{arch.caresAbout}</div>
              </div>

              <div className="apollo-archetype-section">
                <div
                  className="apollo-archetype-label"
                  style={{ color: arch.color }}
                >
                  What Creates Inertia
                </div>
                <div className="apollo-archetype-text">{arch.inertia}</div>
              </div>

              <div className="apollo-archetype-section">
                <div
                  className="apollo-archetype-label"
                  style={{ color: arch.color }}
                >
                  Perceived vs Actual Capability Gap
                </div>
                <div className="apollo-archetype-text">
                  {arch.capabilityGap}
                </div>
              </div>

              <div className="apollo-archetype-section">
                <div
                  className="apollo-archetype-label"
                  style={{ color: arch.color }}
                >
                  What Needs to Change
                </div>
                <div className="apollo-archetype-text">{arch.whatChanges}</div>
              </div>

              <div className="apollo-archetype-section">
                <div
                  className="apollo-archetype-label"
                  style={{ color: arch.color }}
                >
                  Likely Outcome
                </div>
                <div className="apollo-archetype-text">{arch.likely}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Research Sources ─────────────────────────────────── */}
      <div className="apollo-card">
        <h3 className="apollo-section-title">References</h3>

        {RESEARCH_SOURCES.map((src) => (
          <div
            key={src.marker}
            className="apollo-failure-evidence"
          >
            <sup>{src.marker}</sup>&ensp;{src.author}.{' '}
            <em>{src.title}</em>. {src.publisher}.
            {src.extra && (
              <>
                {' '}
                {src.extra}
              </>
            )}
            <br />
            <span className="apollo-failure-source">
              Application: {src.application}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
