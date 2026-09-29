import React, { useState } from 'react';

function formatDateToISO(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function HolidayCalendar({ holidays, onAddHoliday, onRemoveHoliday, mode = 'holiday', onSelectDate, onSaveMultiple }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDates, setSelectedDates] = useState([]);

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
            
            // Multi-select logic
            setSelectedDates(prev => {
                if (prev.includes(dayStr)) {
                    return prev.filter(d => d !== dayStr);
                }
                return [...prev, dayStr];
            });
        }
    };

    const handleMarkPresent = () => {
        if (onSaveMultiple && selectedDates.length > 0) {
            onSaveMultiple(selectedDates, 6, 0); // Assuming default 6 classes
            setSelectedDates([]);
        }
    };

    const handleMarkAbsent = () => {
        if (onSaveMultiple && selectedDates.length > 0) {
            onSaveMultiple(selectedDates, 0, 6); // Assuming default 6 classes
            setSelectedDates([]);
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
        <div 
            className="holiday-calendar-container" 
            style={{ 
                position: 'relative',
                paddingBottom: (mode === 'select' && selectedDates.length > 0) ? '180px' : '0'
            }}
        >
            <h2 className="action-title">{mode === 'holiday' ? 'Manage Holidays' : 'Select Dates'}</h2>
            <p className="action-subtitle">
                {mode === 'holiday' ? 'Click on a day to toggle it as a holiday.' : 'Click on past dates to select them and log attendance.'}
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
                        const isSelected = mode === 'select' && selectedDates.includes(day.dateStr);
                        
                        let inlineStyle = {};
                        if (isSelected) {
                            cellClass += " selected";
                            inlineStyle = { 
                                outline: '3px solid #4285F4', 
                                outlineOffset: '-3px',
                                boxShadow: 'inset 0 0 10px rgba(66, 133, 244, 0.5)',
                                transform: 'scale(0.95)'
                            };
                        }

                        return (
                            <div 
                                key={day.dateStr} 
                                className={cellClass}
                                style={{ ...inlineStyle, cursor: (mode === 'select' && day.dateStr > todayStr) ? 'not-allowed' : 'pointer' }}
                                onClick={() => handleDayClick(day.dateStr)}
                            >
                                <span className="day-num">{day.dayNum}</span>
                                {isHoliday && <span className="holiday-label">Holiday</span>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {mode === 'select' && selectedDates.length > 0 && (
                <div className="floating-action-card">
                    <div className="floating-card-content">
                        <span className="selected-count">{selectedDates.length} day{selectedDates.length > 1 ? 's' : ''} selected</span>
                        <div className="floating-actions">
                            <button className="btn present-btn" onClick={handleMarkPresent}>Mark Present</button>
                            <button className="btn absent-btn" style={{ background: '#f44336', borderColor: '#f44336' }} onClick={handleMarkAbsent}>Mark Absent</button>
                            <button className="btn secondary-btn" onClick={() => setSelectedDates([])}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
