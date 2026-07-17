import React, { useState, useEffect, useRef } from 'react';

const HelpIcon = ({ text }) => {
    const [show, setShow] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShow(false);
            }
        }
        if (show) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [show]);

    return (
        <span className="help-icon-wrapper" ref={wrapperRef}>
            <span 
                className="help-icon" 
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShow(!show);
                }}
                title="Click for more info"
            >
                ?
            </span>
            {show && (
                <div className="help-tooltip">
                    {text}
                </div>
            )}
        </span>
    );
};

export default function SettingsModal({ appState, isOpen, onClose, onSave }) {
    const [baseScore, setBaseScore] = useState(0);
    const [classValue, setClassValue] = useState(0.326667);
    const [startMonth, setStartMonth] = useState('7');
    const [startYear, setStartYear] = useState('');
    const [endMonth, setEndMonth] = useState('2');
    const [endYear, setEndYear] = useState('');
    
    useEffect(() => {
        if (isOpen) {
            setBaseScore(appState.baseScore || 0);
            setClassValue(appState.classValue || 0.326667);
            setStartMonth(appState.startMonth || '7');
            setStartYear(appState.startYear || new Date().getFullYear());
            setEndMonth(appState.endMonth || '2');
            setEndYear(appState.endYear || new Date().getFullYear() + 1);
        }
    }, [isOpen, appState]);

    const handleAutoCalculate = () => {
        const sM = parseInt(startMonth);
        const sY = parseInt(startYear);
        const eM = parseInt(endMonth);
        const eY = parseInt(endYear);
        
        const start = new Date(sY, sM - 1, 1);
        const end = new Date(eY, eM, 0); 
        
        if (end < start) {
            alert("End date must be after start date.");
            return;
        }

        let workingDays = 0;
        let curr = new Date(start);
        while (curr <= end) {
            const day = curr.getDay();
            if (day !== 0) workingDays++;
            curr.setDate(curr.getDate() + 1);
        }
        
        const totalClasses = workingDays * 6;
        if (totalClasses > 0) {
            const classVal = 100 / totalClasses;
            setClassValue(classVal.toFixed(6));
            alert(`Calculated ~${workingDays} working days, 6 classes per day = ${totalClasses} total classes.\n1 Class is roughly ${classVal.toFixed(6)}%`);
        }
    };

    const handleSave = () => {
        onSave({
            baseScore: parseFloat(baseScore) || 0,
            classValue: parseFloat(classValue) || 0,
            startMonth,
            startYear,
            endMonth,
            endYear
        });
    };

    if (!isOpen) return null;

    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 2; i <= currentYear + 5; i++) {
        years.push(i);
    }

    const months = [
        { val: '1', label: 'Jan' }, { val: '2', label: 'Feb' }, { val: '3', label: 'Mar' },
        { val: '4', label: 'Apr' }, { val: '5', label: 'May' }, { val: '6', label: 'Jun' },
        { val: '7', label: 'Jul' }, { val: '8', label: 'Aug' }, { val: '9', label: 'Sep' },
        { val: '10', label: 'Oct' }, { val: '11', label: 'Nov' }, { val: '12', label: 'Dec' }
    ];

    return (
        <div className="modal active">
            <div className="modal-content glass">
                <div className="modal-header">
                    <h2>Configuration</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label>
                            Base Score (%) 
                            <HelpIcon text="This is your starting point at the beginning of the semester. Usually set to 0, your Progress Score will build up from this base number as you attend classes." />
                        </label>
                        <input 
                            type="number" step="0.01" 
                            value={baseScore} onChange={e => setBaseScore(e.target.value)} 
                        />
                    </div>
                    <div className="form-group">
                        <label>
                            Value Per Class (%)
                            <HelpIcon text="This is the exact percentage point value assigned to a single class. Every time you attend a class, your Progress Score increases by this exact amount. Every time you miss a class, your score decreases by this exact amount." />
                        </label>
                        <input 
                            type="number" step="0.000001" 
                            value={classValue} onChange={e => setClassValue(e.target.value)} 
                        />
                    </div>
                    
                    <h3 className="subsection-title">
                        Term Duration
                        <HelpIcon text="This defines the start and end dates of your academic semester. The app uses this timeframe to automatically estimate your total working days and perfectly calculate what your 'Value Per Class' should be." />
                    </h3>
                    
                    <div className="form-group row">
                        <div className="half">
                            <label>Start Month</label>
                            <select className="custom-select" value={startMonth} onChange={e => setStartMonth(e.target.value)}>
                                {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                            </select>
                        </div>
                        <div className="half">
                            <label>Start Year</label>
                            <select className="custom-select" value={startYear} onChange={e => setStartYear(e.target.value)}>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-group row">
                        <div className="half">
                            <label>End Month</label>
                            <select className="custom-select" value={endMonth} onChange={e => setEndMonth(e.target.value)}>
                                {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                            </select>
                        </div>
                        <div className="half">
                            <label>End Year</label>
                            <select className="custom-select" value={endYear} onChange={e => setEndYear(e.target.value)}>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <button onClick={handleAutoCalculate} className="btn secondary-btn">Auto-calculate per Class</button>
                    <span className="hint calc-hint">Estimates total term days (Mon-Sat) &times; 6 classes.</span>
                </div>
                <div className="modal-footer">
                    <button onClick={handleSave} className="btn primary-btn">Save Content</button>
                </div>
            </div>
        </div>
    );
}
