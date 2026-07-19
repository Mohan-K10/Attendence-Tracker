import React, { useState, useEffect, useCallback } from 'react';
import LeftPanel from './components/LeftPanel';
import MiddlePanel from './components/MiddlePanel';
import RightPanel from './components/RightPanel';
import SettingsModal from './components/SettingsModal';

const DEFAULT_STATE = {
    baseScore: 0.0,
    classValue: 0.326667,
    startMonth: '7',
    startYear: new Date().getFullYear().toString(),
    endMonth: '2',
    endYear: (new Date().getFullYear() + 1).toString(),
    history: {},
    holidays: []
};

export default function App() {
    const [appState, setAppState] = useState(() => {
        try {
            const saved = localStorage.getItem('attendanceTrackerState');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (!parsed.history) parsed.history = {};
                if (!parsed.holidays) parsed.holidays = [];
                if (parsed.classValue === 0.3344) {
                    parsed.classValue = 0.326667;
                    localStorage.setItem('attendanceTrackerState', JSON.stringify(parsed));
                }
                return parsed;
            }
        } catch (e) {}
        return DEFAULT_STATE;
    });

    const [activeDateStr, setActiveDateStr] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [calendarMode, setCalendarMode] = useState(null); // 'holiday' | 'select' | null
    const [scrollTrigger, setScrollTrigger] = useState(0);

    useEffect(() => {
        localStorage.setItem('attendanceTrackerState', JSON.stringify(appState));
    }, [appState]);


    const gatherStats = useCallback(() => {
        let totalHeld = 0, totalAttended = 0, totalAbsent = 0;
        let weightedAttended = 0, weightedAbsent = 0;
        Object.entries(appState.history).forEach(([dateStr, dayArr]) => {
            if (appState.holidays && appState.holidays.includes(dateStr)) return;
            
            let localHeld = 0, localAtt = 0, localAbs = 0;
            dayArr.forEach(st => {
                if (st !== 'none') localHeld++;
                if (st === 'attend') localAtt++;
                if (st === 'absent') localAbs++;
            });
            
            totalHeld += localHeld;
            totalAttended += localAtt;
            totalAbsent += localAbs;
            
            if (localHeld > 0) {
                const multiplier = 6 / localHeld;
                weightedAttended += (localAtt * multiplier);
                weightedAbsent += (localAbs * multiplier);
            }
        });
        return { totalHeld, totalAttended, totalAbsent, weightedAttended, weightedAbsent };
    }, [appState.history, appState.holidays]);

    const handleSaveAction = (dateStr, attendCount, absentCount) => {
        let dayArr = [];
        for(let i=0; i<attendCount; i++) dayArr.push('attend');
        for(let i=0; i<absentCount; i++) dayArr.push('absent');

        setAppState(prev => {
            const newState = {
                ...prev,
                history: {
                    ...prev.history,
                    [dateStr]: dayArr
                }
            };
            localStorage.setItem('attendanceTrackerState', JSON.stringify(newState));
            return newState;
        });
    };

    const handleClearDay = (dateStr) => {
        setAppState(prev => {
            const newHistory = { ...prev.history };
            delete newHistory[dateStr];
            const newState = { ...prev, history: newHistory };
            localStorage.setItem('attendanceTrackerState', JSON.stringify(newState));
            return newState;
        });
    };

    const handleSaveSettings = (newSettings) => {
        setAppState(prev => {
            const newState = { ...prev, ...newSettings };
            localStorage.setItem('attendanceTrackerState', JSON.stringify(newState));
            return newState;
        });
        setIsSettingsOpen(false);
    };

    const handleAddHoliday = (dateStr) => {
        if (!dateStr) return;
        setAppState(prev => {
            if (prev.holidays.includes(dateStr)) return prev;
            const newState = { ...prev, holidays: [...prev.holidays, dateStr] };
            localStorage.setItem('attendanceTrackerState', JSON.stringify(newState));
            return newState;
        });
    };

    const handleRemoveHoliday = (dateStr) => {
        setAppState(prev => {
            const newState = {
                ...prev,
                holidays: prev.holidays.filter(d => d !== dateStr)
            };
            localStorage.setItem('attendanceTrackerState', JSON.stringify(newState));
            return newState;
        });
    };

    const handleDateSelect = (dateStr) => {
        setActiveDateStr(dateStr);
        setCalendarMode(null);
        setScrollTrigger(prev => prev + 1);
    };

    return (
        <div className="dashboard-layout">
            <LeftPanel 
                appState={appState} 
                stats={gatherStats()} 
                onOpenSettings={() => setIsSettingsOpen(true)}
                isHolidayView={calendarMode === 'holiday'}
                onToggleHolidayView={() => {
                    setCalendarMode(calendarMode === 'holiday' ? null : 'holiday');
                    setScrollTrigger(prev => prev + 1);
                }}
                isAttendanceView={calendarMode === 'attendance'}
                onToggleAttendanceView={() => {
                    setCalendarMode(calendarMode === 'attendance' ? null : 'attendance');
                    setScrollTrigger(prev => prev + 1);
                }}
            />
            <MiddlePanel 
                appState={appState} 
                activeDateStr={activeDateStr} 
                onSelectDate={handleDateSelect}
                isSelectMode={calendarMode === 'select'}
                onToggleSelectMode={() => {
                    setCalendarMode(calendarMode === 'select' ? null : 'select');
                    setScrollTrigger(prev => prev + 1);
                }}
            />
            <RightPanel 
                activeDateStr={activeDateStr}
                appState={appState}
                onSaveAction={handleSaveAction}
                onClearDay={handleClearDay}
                calendarMode={calendarMode}
                onAddHoliday={handleAddHoliday}
                onRemoveHoliday={handleRemoveHoliday}
                onSelectDate={handleDateSelect}
                scrollTrigger={scrollTrigger}
            />
            <SettingsModal 
                isOpen={isSettingsOpen} 
                appState={appState} 
                onClose={() => setIsSettingsOpen(false)} 
                onSave={handleSaveSettings} 
            />
        </div>
    );
}
