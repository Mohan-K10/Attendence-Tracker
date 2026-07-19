import React, { useState } from 'react';

function formatDateToISO(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function AttendanceCalendar({ history }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        days.push({
            dayNum: i,
            dateStr: formatDateToISO(d),
        });
    }

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="holiday-calendar-container">
            <h2 className="action-title">Attendance History</h2>
            <p className="action-subtitle">Green for present, Red for absent</p>
            
            <div className="calendar-card">
                <div className="calendar-header">
                    <button className="icon-btn" onClick={prevMonth}>&larr;</button>
                    <h3>{monthName} {year}</h3>
                    <button className="icon-btn" onClick={nextMonth}>&rarr;</button>
                </div>
                
                <div className="calendar-grid">
                    {weekDays.map(wd => (
                        <div key={wd} className="calendar-weekday">{wd}</div>
                    ))}
                    
                    {days.map((day, idx) => {
                        if (!day) return <div key={`empty-${idx}`} className="calendar-cell empty"></div>;
                        
                        const dayHistory = history[day.dateStr] || [];
                        let attend = 0;
                        let absent = 0;
                        
                        dayHistory.forEach(st => {
                            if (st === 'attend') attend++;
                            if (st === 'absent') absent++;
                        });
                        
                        let cellClass = "calendar-cell";
                        let inlineStyle = {};
                        
                        if (dayHistory.length > 0) {
                            if (absent === 0) {
                                // All present
                                inlineStyle = { backgroundColor: 'rgba(76, 175, 80, 0.4)', borderColor: '#4CAF50' };
                            } else if (attend === 0) {
                                // All absent
                                inlineStyle = { backgroundColor: 'rgba(244, 67, 54, 0.4)', borderColor: '#F44336' };
                            } else {
                                // Mixed
                                inlineStyle = { background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.4) 50%, rgba(244, 67, 54, 0.4) 50%)', borderColor: '#FF9800' };
                            }
                        }

                        return (
                            <div 
                                key={day.dateStr} 
                                className={cellClass}
                                style={inlineStyle}
                            >
                                <span className="day-num">{day.dayNum}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
