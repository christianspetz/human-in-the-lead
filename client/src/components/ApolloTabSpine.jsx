import React, { useState } from 'react';
import { BUYIN_LAYERS } from '../data/apolloData';

export default function ApolloTabSpine() {
  const [open, setOpen] = useState({ 0: true, 1: true, 2: true });

  const toggle = (idx) =>
    setOpen((prev) => ({ ...prev, [idx]: !prev[idx] }));

  return (
    <div>
      {/* ── Section Header ───────────────────────────────────── */}
      <div className="apollo-section-spacing">
        <h2 className="apollo-section-title">The Spine of Support</h2>
        <p className="apollo-section-subtitle">
          A three-layer buy-in model. Top-down mandate alone fails. Bottom-up
          grassroots alone stalls. The spine connects executive sponsorship,
          middle-management ownership, and operator champions into a single
          structure that holds under pressure.
        </p>
      </div>

      {/* ── Buy-in Layers ────────────────────────────────────── */}
      {BUYIN_LAYERS.map((layer, idx) => (
        <div className="apollo-layer-card" key={idx}>
          {/* Header — clickable */}
          <div
            className="apollo-layer-header"
            onClick={() => toggle(idx)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle(idx);
              }
            }}
          >
            <span
              className="apollo-layer-badge"
              style={{
                background: layer.badge.bg,
                color: layer.badge.color,
                border: `1px solid ${layer.badge.border}`,
              }}
            >
              {layer.badge.text}
            </span>
            <span className="apollo-layer-title">
              {layer.layer} &mdash; {layer.title}
            </span>
            <span
              className={`apollo-layer-toggle${open[idx] ? ' open' : ''}`}
            >
              &#9662;
            </span>
          </div>

          {/* Body — collapsible */}
          {open[idx] && (
            <div className="apollo-layer-body">
              <div className="apollo-layer-framing">{layer.framing}</div>

              {layer.profiles.map((profile, pIdx) => (
                <div className="apollo-profile-card" key={pIdx}>
                  <div className="apollo-profile-role">{profile.role}</div>
                  <div className="apollo-profile-detail">
                    <strong>Who:</strong> {profile.who}
                  </div>
                  <div className="apollo-profile-detail">
                    <strong>Cares about:</strong> {profile.cares}
                  </div>
                  <div className="apollo-profile-detail">
                    <strong>Risk:</strong> {profile.risk}
                  </div>

                  {profile.valueExchange && (
                    <div className="apollo-profile-exchange">
                      <div className="apollo-profile-exchange-label">
                        90-Day Value Exchange
                      </div>
                      <div className="apollo-profile-exchange-text">
                        {profile.valueExchange}
                      </div>
                    </div>
                  )}

                  {profile.design && !profile.valueExchange && (
                    <div className="apollo-callout-gold">
                      <div className="apollo-callout-text">
                        {profile.design}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
