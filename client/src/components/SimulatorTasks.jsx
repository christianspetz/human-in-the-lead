import React, { useState, useEffect, useMemo } from 'react';
import { AUTOMATION_LEVELS, getTasksForDepartment, calculateMeters } from '../data/simulatorData';

const METER_CONFIG = [
  { key: 'cost', label: 'Cost Impact', desc: 'Savings vs. AI licensing costs' },
  { key: 'risk', label: 'Risk Exposure', desc: 'Compliance, errors, accountability' },
  { key: 'speed', label: 'Speed / Throughput', desc: 'Processing speed gain' },
  { key: 'morale', label: 'Employee Morale', desc: 'Workforce sentiment impact' },
  { key: 'quality', label: 'Quality / Accuracy', desc: 'Output accuracy and consistency' },
];

function getMeterZone(val) {
  if (val >= 67) return 'green';
  if (val >= 34) return 'yellow';
  return 'red';
}

export default function SimulatorTasks({ industry, departments, onComplete, onBack }) {
  const [assignments, setAssignments] = useState({});
  const [activeDept, setActiveDept] = useState(0);

  // Build task lists and label map
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

  // Map each taskId to its department ID (for server-side grouping)
  const taskDeptMap = useMemo(() => {
    const map = {};
    Object.entries(deptTasks).forEach(([deptId, tasks]) => {
      tasks.forEach(t => { map[t.id] = deptId; });
    });
    return map;
  }, [deptTasks]);

  // Count totals
  const totalTasks = Object.values(deptTasks).flat().length;
  const assignedCount = Object.keys(assignments).length;

  // Calculate meters
  const meters = useMemo(() => calculateMeters(assignments, industry), [assignments, industry]);

  // Progress percentage
  const progress = totalTasks > 0 ? 10 + ((assignedCount / totalTasks) * 70) : 10;

  const handleAssign = (taskId, levelId) => {
    setAssignments(prev => ({ ...prev, [taskId]: levelId }));
  };

  const currentDept = departments[activeDept];
  const currentTasks = deptTasks[currentDept.id] || [];

  // Count assigned per department
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
            Back to Setup
          </button>

          <div style={{ marginBottom: '1.5rem' }}>
            <span className="landing-badge" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>{industry}</span>
            <h2 className="question-text" style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>Assign Automation Levels</h2>
            <p style={{ color: 'var(--slate-light)', fontSize: '0.85rem' }}>
              For each task, choose how much AI involvement you want. Watch the trade-off meters respond in real time.
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
                {currentTasks.map(task => (
                  <div className="simulator-task-row" key={task.id}>
                    <span className="simulator-task-label">{task.label}</span>
                    <div className="simulator-level-buttons">
                      {AUTOMATION_LEVELS.map(level => (
                        <button
                          key={level.id}
                          className={`simulator-level-btn${assignments[task.id] === level.id ? ' selected' : ''}`}
                          data-level={level.id}
                          onClick={() => handleAssign(task.id, level.id)}
                          title={level.label}
                        >
                          {level.shortLabel}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Trade-off meters */}
            <div className="simulator-meters-panel">
              <h3 style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: '1.25rem', fontWeight: 600 }}>
                Trade-off Analysis
              </h3>
              {METER_CONFIG.map(m => (
                <div className="tradeoff-meter" key={m.key}>
                  <div className="tradeoff-meter-header">
                    <span className="tradeoff-meter-label">{m.label}</span>
                    <span className="tradeoff-meter-value">{meters[m.key]}</span>
                  </div>
                  <div className="tradeoff-meter-track">
                    <div
                      className="tradeoff-meter-fill"
                      style={{ width: `${meters[m.key]}%` }}
                      data-zone={getMeterZone(meters[m.key])}
                    />
                  </div>
                  <span className="tradeoff-meter-desc">{m.desc}</span>
                </div>
              ))}
              <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--slate)', lineHeight: '1.5' }}>
                Meters adjust based on your automation choices and <strong style={{ color: 'var(--slate-light)' }}>{industry}</strong> risk profile.
              </div>
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
