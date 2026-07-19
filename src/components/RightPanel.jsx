import React, { useState, useEffect, useRef } from 'react';
import HolidayCalendar from './HolidayCalendar';
import AttendanceCalendar from './AttendanceCalendar';

export default function RightPanel({ activeDateStr, appState, onSaveAction, onClearDay, calendarMode, onAddHoliday, onRemoveHoliday, onSelectDate, scrollTrigger }) {
    const actionAreaRef = useRef(null);
    const [customTotalClasses, setCustomTotalClasses] = useState(6);
    const [showCustomizer, setShowCustomizer] = useState(false);

    useEffect(() => {
        setCustomTotalClasses(6);
        setShowCustomizer(false);
    }, [activeDateStr]);

    useEffect(() => {
        if ((activeDateStr || calendarMode) && window.innerWidth <= 1024 && actionAreaRef.current) {
            setTimeout(() => {
                actionAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    }, [activeDateStr, calendarMode, scrollTrigger]);

    if (calendarMode === 'attendance') {
        return (
            <section className="panel right-panel" ref={actionAreaRef}>
                <AttendanceCalendar history={appState.history} />
            </section>
        );
    }

    if (calendarMode === 'holiday' || calendarMode === 'select') {
        return (
            <section className="panel right-panel" ref={actionAreaRef}>
                <HolidayCalendar 
                    holidays={appState.holidays || []} 
                    onAddHoliday={onAddHoliday} 
                    onRemoveHoliday={onRemoveHoliday} 
                    mode={calendarMode}
                    onSelectDate={onSelectDate}
                />
            </section>
        );
    }

    let title = "Select a Day";
    if (activeDateStr) {
        const d = new Date(activeDateStr);
        d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
        title = d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    }

    const isLogged = activeDateStr && appState.history[activeDateStr];

    let localAtt = 0, localAbs = 0;
    if (isLogged) {
        appState.history[activeDateStr].forEach(st => {
            if (st === 'attend') localAtt++;
            if (st === 'absent') localAbs++;
        });
    }

    return (
        <section className="panel right-panel" ref={actionAreaRef}>
            <h2 className="action-title">{title}</h2>
            
            {!activeDateStr ? (
                <div className="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
            ) : (
                <div className="action-area" style={{ marginTop: '1.5rem' }}>
                    {isLogged ? (
                        <div className="already-logged-area">
                            <p>Status: <strong>Attended {localAtt}/{localAtt + localAbs} classes {localAbs > 0 && `(${localAbs} missed)`}</strong></p>
                            <button onClick={() => onClearDay(activeDateStr)} className="btn secondary-btn">Clear Log</button>
                        </div>
                    ) : (
                        <>
                            <p className="action-subtitle">How was your attendance for this day?</p>
                            
                            <button onClick={() => onSaveAction(activeDateStr, customTotalClasses, 0)} className="btn gigantic-btn present-btn">
                                PRESENT ALL DAY ({customTotalClasses}/{customTotalClasses})
                            </button>

                            <div className="absent-section" style={{ position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '1rem', gap: '1rem' }}>
                                    <div>
                                        <h3 className="absent-title" style={{ margin: 0 }}>Or mark absences</h3>
                                        <p className="absent-desc" style={{ margin: '0.2rem 0 0 0' }}>How many classes did you miss?</p>
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <button 
                                            className="btn secondary-btn" 
                                            style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem', margin: '0.2rem 0' }} 
                                            onClick={() => setShowCustomizer(!showCustomizer)}
                                        >
                                            Total Classes: {customTotalClasses} ⚙️
                                        </button>
                                        {showCustomizer && (
                                            <>
                                                <div 
                                                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, background: 'rgba(0,0,0,0.5)' }} 
                                                    onClick={() => setShowCustomizer(false)} 
                                                />
                                                <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--bg-card, #1e1e1e)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.5rem', zIndex: 1000, boxShadow: '0 8px 32px rgba(0,0,0,0.8)', width: '90%', maxWidth: '400px' }}>
                                                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', textAlign: 'center' }}>Select total classes held</h4>
                                                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                                                        {[1, 2, 3, 4, 5, 6].map(val => (
                                                            <button 
                                                                key={val}
                                                                className={`btn absent-num-btn`}
                                                                style={{ padding: '0.6rem 0.5rem', fontSize: '1.1rem', flex: '1 1 auto', minWidth: '2.5rem', background: val === customTotalClasses ? '#4285F4' : '', borderColor: val === customTotalClasses ? '#4285F4' : '' }}
                                                                onClick={() => { setCustomTotalClasses(val); setShowCustomizer(false); }}
                                                            >
                                                                {val}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="absent-toggles">
                                    {Array.from({length: customTotalClasses}, (_, i) => i + 1).map(val => (
                                        <button 
                                            key={val} 
                                            className="btn absent-num-btn" 
                                            onClick={() => onSaveAction(activeDateStr, customTotalClasses - val, val)}
                                        >
                                            {val === customTotalClasses ? `All (${customTotalClasses})` : val}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </section>
    );
}
