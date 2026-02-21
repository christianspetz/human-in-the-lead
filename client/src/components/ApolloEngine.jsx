import React, { useState, useCallback } from 'react';
import ApolloCover from './ApolloCover';
import ApolloTabBurning from './ApolloTabBurning';
import ApolloTabSpine from './ApolloTabSpine';
import ApolloTabIdentity from './ApolloTabIdentity';
import ApolloTabGovernance from './ApolloTabGovernance';
import ApolloTabMomentum from './ApolloTabMomentum';
import ApolloTabSimulator from './ApolloTabSimulator';

const TABS = [
  { id: 'burning', label: 'The Burning Platform' },
  { id: 'spine', label: 'The Spine of Support' },
  { id: 'identity', label: 'The Identity Problem' },
  { id: 'governance', label: 'The Governance Design' },
  { id: 'momentum', label: 'Momentum Architecture' },
  { id: 'simulator', label: 'Transformation Simulator' },
];

export default function ApolloEngine() {
  const [entered, setEntered] = useState(false);
  const [activeTab, setActiveTab] = useState('burning');
  const handleEnter = useCallback(() => setEntered(true), []);

  const renderTab = () => {
    switch (activeTab) {
      case 'burning': return <ApolloTabBurning />;
      case 'spine': return <ApolloTabSpine />;
      case 'identity': return <ApolloTabIdentity />;
      case 'governance': return <ApolloTabGovernance />;
      case 'momentum': return <ApolloTabMomentum />;
      case 'simulator': return <ApolloTabSimulator />;
      default: return <ApolloTabBurning />;
    }
  };

  if (!entered) {
    return <ApolloCover onEnter={handleEnter} />;
  }

  return (
    <div className="apollo-engine">
      {/* Header */}
      <div className="apollo-header">
        <div className="apollo-header-inner">
          <div>
            <div className="apollo-title-row">
              <h1 className="apollo-title">Apollo Transformation Engine</h1>
              <div className="apollo-title-divider" />
            </div>
            <p className="apollo-subtitle">
              Operating model diagnostic for a firm moving from $938B to $1.5T
            </p>
          </div>
          <div className="apollo-header-right">
            <span className="apollo-header-label">Prepared for</span>
            <span className="apollo-header-name">Mike Mayes</span>
            <span className="apollo-header-role">Head of Transformation</span>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="apollo-tab-bar">
        <div className="apollo-tab-bar-inner">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`apollo-tab-btn${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="apollo-content">
        {renderTab()}
      </div>

      {/* Footer */}
      <div className="apollo-footer">
        <span>Built by Christian Spetz — Transformation & AI Strategy</span>
        <span>Sources: HBS Case 126-009 / J.D. Power 2024-2025 / Apollo 2024 10-K / NAIC filings</span>
      </div>
    </div>
  );
}
