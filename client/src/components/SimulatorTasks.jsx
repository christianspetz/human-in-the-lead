import React, { useState, useMemo } from 'react';
import {
  AUTOMATION_LEVELS, getTasksForDepartment, calculateMeters,
  getTaskTier, getConsequenceCallout, getMeterDescription,
  getMeterInterpretation, getPostureAnalysis,
} from '../data/simulatorData';

const METER_KEYS = [
  { key: 'cost', label: 'Cost Impact' },
  { key: 'risk', label: 'Risk Exposure' },
  { key: 'speed', label: 'Speed / Throughput' },
  { key: 'morale', label: 'Employee Morale' },
  { key: 'quality', label: 'Quality / Accuracy' },
];

const TIER_ICONS = { critical: '!!', judgment: '!', routine: '' };
const TIER_LABELS = { critical: 'High-stakes', judgment: 'Judgment-dependent', routine: '' };

function getMeterZone(val) {
  if (val >= 67) return 'green';
  if (val >= 34) return 'yellow';
  return 'red';
}

export default function SimulatorTasks({ industry, departments, priorities, onComplete, onBack }) {
  const [assignments, setAssignments] = useState({});
  const [activeDept, setActiveDept] = useState(0);

  const deptTasks = useMemo(() => {
    const map = {};
    departments.forEach(dept => {
      map[dept.id] = getTasksForDepartment(industry, dept.id);
    });
    return map;
  }, [industry, departments]);

  const taskLabels = useMemo(() => {
    const labels = {};
    Object.values(deptTasks).flat().forEach(t => { labels[t.id] = t.label; });
    return labels;
  }, [deptTasks]);

  const taskDeptMap = useMemo(() => {
    const map = {};
    Object.entries(deptTasks).forEach(([deptId, tasks]) => {
      tasks.forEach(t => { map[t.id] = deptId; });
    });
    return map;
  }, [deptTasks]);

  const totalTasks = Object.values(deptTasks).flat().length;
  const assignedCount = Object.keys(assignments).length;
  const meters = useMemo(() => calculateMeters(assignments, industry, taskLabels), [assignments, industry, taskLabels]);
  const posture = useMemo(() => getPostureAnalysis(assignments, industry), [assignments, industry]);
  const progress = totalTasks > 0 ? 20 + ((assignedCount / totalTasks) * 55) : 20;

  const handleAssign = (taskId, levelId) => {
    setAssignments(prev => ({ ...prev, [taskId]: levelId }));
  };

  const currentDept = departments[activeDept];
  const currentTasks = deptTasks[currentDept.id] || [];

  const deptAssignedCount = (deptId) => {
    const tasks = deptTasks[deptId] || [];
    return tasks.filter(t => assignments[t.id]).length;
  };

  const allAssigned = assignedCount === totalTasks && totalTasks > 0;

  return (
    <>
      <div className="progress-container">
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="page-wrapper" style={{ maxWidth: '1100px' }}>
        <div className="animate-in">
          <button className="back-btn" onClick={onBack} style={{ marginBottom: '1rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back
          </button>

          <div style={{ marginBottom: '1.5rem' }}>
            <span className="landing-badge" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>{industry}</span>
            <h2 className="question-text" style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>Design Your Human-AI Operating Model</h2>
            <p style={{ color: 'var(--slate-light)', fontSize: '0.85rem' }}>
              Every choice has consequences. Assign automation levels and watch the trade-offs shift in real time.
            </p>
          </div>

          <div className="simulator-tasks-layout">
            {/* Left: Department tabs + tasks */}
            <div>
              <div className="simulator-dept-tabs">
                {departments.map((dept, idx) => {
                  const total = (deptTasks[dept.id] || []).length;
                  const done = deptAssignedCount(dept.id);
                  return (
                    <button
                      key={dept.id}
                      className={`simulator-dept-tab${idx === activeDept ? ' active' : ''}`}
                      onClick={() => setActiveDept(idx)}
                    >
                      {dept.label}
                      <span className="simulator-tab-badge">{done}/{total}</span>
                    </button>
                  );
                })}
              </div>

              <div className="simulator-task-list">
                {currentTasks.map(task => {
                  const tier = getTaskTier(task.label);
                  const currentLevel = assignments[task.id];
                  const callout = currentLevel ? getConsequenceCallout(task.label, currentLevel, industry) : null;

                  return (
                    <div className={`simulator-task-block${callout ? ' has-callout' : ''}`} key={task.id}>
                      <div className="simulator-task-row">
                        <div className="simulator-task-label-wrap">
                          {tier !== 'routine' && (
                            <span className={`simulator-tier-badge tier-${tier}`} title={TIER_LABELS[tier]}>
                              {TIER_ICONS[tier]}
                            </span>
                          )}
                          <span className="simulator-task-label">{task.label}</span>
                        </div>
                        <div className="simulator-level-buttons">
                          {AUTOMATION_LEVELS.map(level => (
                            <button
                              key={level.id}
                              className={`simulator-level-btn${currentLevel === level.id ? ' selected' : ''}`}
                              data-level={level.id}
                              onClick={() => handleAssign(task.id, level.id)}
                              title={level.label}
                            >
                              {level.shortLabel}
                            </button>
                          ))}
                        </div>
                      </div>
                      {callout && (
                        <div className={`simulator-callout callout-${callout.severity}`}>
                          <span className="callout-icon">{callout.severity === 'danger' ? '!!' : '!'}</span>
                          <span>{callout.text}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Posture + Meters */}
            <div className="simulator-meters-panel">
              {/* Aggregate Posture */}
              {posture && (
                <div className="simulator-posture">
                  <h3 className="meter-panel-heading">Automation Posture</h3>
                  <div className="posture-bar">
                    {posture.pct.full_ai > 0 && <div className="posture-segment" data-level="full_ai" style={{ width: `${posture.pct.full_ai}%` }} title={`Full AI: ${posture.pct.full_ai}%`} />}
                    {posture.pct.ai_led > 0 && <div className="posture-segment" data-level="ai_led" style={{ width: `${posture.pct.ai_led}%` }} title={`AI-Led: ${posture.pct.ai_led}%`} />}
                    {posture.pct.human_led > 0 && <div className="posture-segment" data-level="human_led" style={{ width: `${posture.pct.human_led}%` }} title={`Human-Led: ${posture.pct.human_led}%`} />}
                    {posture.pct.full_human > 0 && <div className="posture-segment" data-level="full_human" style={{ width: `${posture.pct.full_human}%` }} title={`Full Human: ${posture.pct.full_human}%`} />}
                  </div>
                  <div className="posture-legend">
                    {AUTOMATION_LEVELS.map(l => (
                      <span key={l.id} className="posture-legend-item">
                        <span className="posture-dot" style={{ background: l.color }} />
                        {posture.pct[l.id]}%
                      </span>
                    ))}
                  </div>
                  <p className="posture-interpretation">{posture.interpretation}</p>
                </div>
              )}

              {/* Trade-off Meters */}
              <h3 className="meter-panel-heading" style={{ marginTop: posture ? '1.25rem' : 0 }}>Trade-off Analysis</h3>
              {METER_KEYS.map(m => {
                const value = meters[m.key];
                const zone = getMeterZone(value);
                const desc = getMeterDescription(industry, m.key);
                const interp = getMeterInterpretation(m.key, value, industry, priorities);
                return (
                  <div className="tradeoff-meter" key={m.key}>
                    <div className="tradeoff-meter-header">
                      <span className="tradeoff-meter-label">{m.label}</span>
                      <span className={`tradeoff-meter-value zone-${zone}`}>{value}</span>
                    </div>
                    <div className="tradeoff-meter-track">
                      <div
                        className="tradeoff-meter-fill"
                        style={{ width: `${value}%` }}
                        data-zone={zone}
                      />
                    </div>
                    <span className="tradeoff-meter-desc">{desc}</span>
                    {assignedCount > 0 && (
                      <span className={`tradeoff-meter-interp zone-${zone}`}>{interp}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="simulator-bottom-bar">
            <span style={{ fontSize: '0.85rem', color: 'var(--slate-light)' }}>
              {assignedCount} of {totalTasks} tasks assigned
            </span>
            <button
              className="btn-primary"
              style={{ padding: '0.8rem 2rem', fontSize: '0.95rem' }}
              disabled={!allAssigned}
              onClick={() => onComplete(assignments, meters, taskLabels, taskDeptMap)}
            >
              Generate Blueprint
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
