import React from 'react';

function formatDateToISO(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getTodayStr() { return formatDateToISO(new Date()); }

export default function MiddlePanel({ appState, activeDateStr, onSelectDate, isSelectMode, onToggleSelectMode }) {
    const today = new Date();
    const daysToShow = 6;
    const days = [];
    
    let d = new Date(today);
    while (days.length < daysToShow) {
        if (d.getDay() !== 0 && (!appState.holidays || !appState.holidays.includes(formatDateToISO(d)))) {
            days.push({
                dateObj: new Date(d),
                dateStr: formatDateToISO(d)
            });
        }
        d.setDate(d.getDate() - 1);
    }

    const handleCustomDateChange = (e) => {
        if (e.target.value) onSelectDate(e.target.value);
    };

    return (
        <section className="panel middle-panel">
            <h2>Days To Log</h2>
            <p className="panel-desc">Last 6 working days</p>
            
            <div className="todo-list">
                {days.map((day) => {
                    const isToday = day.dateStr === getTodayStr();
                    const dayName = isToday ? 'Today' : day.dateObj.toLocaleDateString([], { weekday: 'long' });
                    const fullDate = day.dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
                    
                    const isLogged = appState.history[day.dateStr] && appState.history[day.dateStr].length > 0;
                    const pillClass = isLogged ? 'status-logged' : 'status-missing';
                    const pillText = isLogged ? 'Logged ✓' : 'Missing';
                    
                    return (
                        <div 
                            key={day.dateStr}
                            className={`day-card ${day.dateStr === activeDateStr ? 'active' : ''}`}
                            onClick={() => onSelectDate(day.dateStr)}
                        >
                            <div className="day-info">
                                <div className="day-name">{dayName}</div>
                                <div className="full-date">{fullDate}</div>
                            </div>
                            <div className="day-status">
                                <span className={`status-pill ${pillClass}`}>{pillText}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="custom-date-section">
                <h3>Log Older Date</h3>
                <button 
                    className="btn secondary-btn" 
                    onClick={onToggleSelectMode} 
                    style={{width: '100%'}}
                >
                    {isSelectMode ? 'Close Calendar' : 'Browse Calendar'}
                </button>
            </div>
        </section>
    );
}
