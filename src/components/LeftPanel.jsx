import React from 'react';

export default function LeftPanel({ appState, stats, onOpenSettings, isHolidayView, onToggleHolidayView }) {
  const base = parseFloat(appState.baseScore || 0);
  const value = parseFloat(appState.classValue || 0);
  
  const formulaScore = base + (stats.weightedAttended * value) - (stats.weightedAbsent * value);
  const standardScore = stats.totalHeld > 0 ? (stats.totalAttended / stats.totalHeld) * 100 : 0;

  return (
    <aside className="panel left-panel">
      <header>
          <div className="logo">
              <img src="/logo.svg" alt="Tracker" className="tracker-logo" />
          </div>
          <button onClick={onOpenSettings} className="icon-btn" title="Configuration">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </button>
      </header>
      
      <div className="stats-overview">
          <div className="stat-card primary">
              <h3>Progress Score</h3>
              <div className="score-display">
                  <span>{formulaScore.toFixed(3)}</span><span className="percent">%</span>
              </div>
              <p className="subtitle">Your semester progression</p>
          </div>
          <div className="stat-card secondary">
              <h3>Standard %</h3>
              <div className="score-display">
                  <span>{standardScore.toFixed(2)}</span><span className="percent">%</span>
              </div>
              <p className="subtitle">Attended / Total Held</p>
          </div>
      </div>

      <div className="detailed-stats">
          <div className="mini-stat">
              <span>Total Classes</span>
              <strong>{stats.totalHeld}</strong>
          </div>
          <div className="mini-stat attend">
              <span>Attended</span>
              <strong>{stats.totalAttended}</strong>
          </div>
          <div className="mini-stat absent">
              <span>Absent</span>
              <strong>{stats.totalAbsent}</strong>
          </div>
      </div>
      
      <div className="instructions-card">
          <p>Select a day from the middle column to record your attendance.</p>
      </div>

      <button className="btn secondary-btn" onClick={onToggleHolidayView} style={{marginTop: '1rem'}}>
          {isHolidayView ? 'Close Holidays' : 'Manage Holidays'}
      </button>
    </aside>
  );
}
