import React, { useState, useRef } from 'react';

const PRIORITIES = [
  { id: 'cost_efficiency', label: 'Cost Efficiency', description: 'Reducing operating costs through automation savings' },
  { id: 'speed_throughput', label: 'Speed / Throughput', description: 'Faster processing and higher output volume' },
  { id: 'employee_satisfaction', label: 'Employee Satisfaction & Retention', description: 'Keeping people engaged, empowered, and retained' },
  { id: 'risk_compliance', label: 'Risk & Compliance', description: 'Minimizing regulatory, legal, and operational risk' },
  { id: 'quality_accuracy', label: 'Quality / Accuracy', description: 'Ensuring high standards in outputs and decisions' },
  { id: 'customer_experience', label: 'Customer Experience', description: 'Delivering exceptional experiences to customers and clients' },
];

export default function SimulatorPriorities({ onComplete, onBack }) {
  const [items, setItems] = useState(PRIORITIES);
  const dragIndex = useRef(null);
  const dragOverIndex = useRef(null);

  const moveItem = (from, to) => {
    if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setItems(updated);
  };

  const handleDragStart = (e, index) => {
    dragIndex.current = index;
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging');
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === index) return;
    dragOverIndex.current = index;
    moveItem(dragIndex.current, index);
    dragIndex.current = index;
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    dragIndex.current = null;
    dragOverIndex.current = null;
  };

  const handleSubmit = () => {
    const ranked = items.map((item, idx) => ({ ...item, rank: idx + 1 }));
    onComplete(ranked);
  };

  return (
    <>
      <div className="progress-container">
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: '15%' }} />
        </div>
      </div>
      <div className="page-wrapper" style={{ maxWidth: '700px' }}>
        <div className="animate-in">
          <button className="back-btn" onClick={onBack} style={{ marginBottom: '1rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back
          </button>

          <div style={{ marginBottom: '1rem' }}>
            <span className="landing-badge" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>Step 2 of 4</span>
            <h2 className="question-text" style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>What Matters Most to Your Organization?</h2>
            <p style={{ color: 'var(--slate-light)', fontSize: '0.85rem', lineHeight: '1.6' }}>
              Rank these priorities from most to least important. This shapes how we evaluate your automation choices.
              <br />
              <span style={{ color: 'var(--slate)', fontSize: '0.78rem' }}>Drag to reorder, or use the arrows. #1 is your top priority.</span>
            </p>
          </div>

          <div className="priority-list">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="priority-item"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                <span className="priority-rank">{index + 1}</span>
                <div className="priority-content">
                  <span className="priority-label">{item.label}</span>
                  <span className="priority-desc">{item.description}</span>
                </div>
                <div className="priority-arrows">
                  <button
                    className="priority-arrow-btn"
                    disabled={index === 0}
                    onClick={() => moveItem(index, index - 1)}
                    aria-label="Move up"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
                  </button>
                  <button
                    className="priority-arrow-btn"
                    disabled={index === items.length - 1}
                    onClick={() => moveItem(index, index + 1)}
                    aria-label="Move down"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-primary" onClick={handleSubmit}>
              Continue
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
