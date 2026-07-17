import React, { useState } from 'react';

function formatDateToISO(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function HolidayCalendar({ holidays, onAddHoliday, onRemoveHoliday, mode = 'holiday', onSelectDate }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const todayStr = formatDateToISO(new Date());

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const handleDayClick = (dayStr) => {
        if (mode === 'holiday') {
            if (holidays.includes(dayStr)) {
                onRemoveHoliday(dayStr);
            } else {
                onAddHoliday(dayStr);
            }
        } else if (mode === 'select') {
            if (dayStr > todayStr) return; // prevent future dates in select mode
            onSelectDate(dayStr);
        }
    };

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        days.push({
            dayNum: i,
            dateStr: formatDateToISO(d),
            isSunday: d.getDay() === 0
        });
    }

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="holiday-calendar-container">
            <h2 className="action-title">{mode === 'holiday' ? 'Manage Holidays' : 'Select a Date'}</h2>
            <p className="action-subtitle">
                {mode === 'holiday' ? 'Click on a day to toggle it as a holiday.' : 'Click on a past date to log attendance.'}
            </p>
            
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
                        
                        const isHoliday = holidays.includes(day.dateStr);
                        let cellClass = "calendar-cell";
                        
                        if (isHoliday) cellClass += " holiday-active";
                        if (day.isSunday && !isHoliday) cellClass += " sunday-cell";
                        if (mode === 'select' && day.dateStr > todayStr) cellClass += " future-cell"; // styling for unselectable

                        return (
                            <div 
                                key={day.dateStr} 
                                className={cellClass}
                                onClick={() => handleDayClick(day.dateStr)}
                            >
                                <span className="day-num">{day.dayNum}</span>
                                {isHoliday && <span className="holiday-label">Holiday</span>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
