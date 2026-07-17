// app.js

const DEFAULT_STATE = {
    baseScore: 0.0,
    classValue: 0.326667,
    startMonth: '7',
    startYear: new Date().getFullYear().toString(),
    endMonth: '2',
    endYear: (new Date().getFullYear() + 1).toString(),
    history: {} 
    // Legacy support: We still store arrays in history exactly like before, e.g.:
    // { '2023-10-01': ['attend', 'attend', 'attend', 'attend', 'attend', 'attend'] }
    // This allows the exact mathematical accumulator logic from earlier to work flawlessly.
};

let appState = JSON.parse(localStorage.getItem('attendanceTrackerState')) || DEFAULT_STATE;
if (!appState.history) appState.history = {};

// Hot-fix Migration: if their browser still holds onto the old 0.3344 value, forcefully overwrite it to exactly yield 1.96% per 6 classes
if (appState.classValue === 0.3344) {
    appState.classValue = 0.326667;
    localStorage.setItem('attendanceTrackerState', JSON.stringify(appState));
}

let activeDateStr = null;

// DOM Elements
const settingsModal = document.getElementById('settings-modal');
const todoListContainer = document.getElementById('todo-list');
const customDateInput = document.getElementById('custom-date');
const actionArea = document.getElementById('action-area');
const emptyState = document.getElementById('empty-state');
const actionDateTitle = document.getElementById('action-date-title');
const alreadyLoggedArea = document.getElementById('already-logged-area');
const loggedStatusText = document.getElementById('logged-status-text');

// Helper
function formatDateToISO(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getTodayStr() { return formatDateToISO(new Date()); }

function saveState() {
    localStorage.setItem('attendanceTrackerState', JSON.stringify(appState));
}

function initUI() {
    populateYearDropdowns();
    
    customDateInput.max = getTodayStr();
    
    // Generate the 6-day todo list
    generateTodoList();
    
    updateScoreDisplay();

    // Event listeners
    customDateInput.addEventListener('change', (e) => {
        if (e.target.value) selectDate(e.target.value);
    });

    // Option buttons
    document.getElementById('btn-present-all').addEventListener('click', () => {
        if (!activeDateStr) return;
        saveDateAction(activeDateStr, 6, 0);
    });

    document.querySelectorAll('.absent-num-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (!activeDateStr) return;
            const absentCount = parseInt(e.target.getAttribute('data-val'));
            const attendCount = 6 - absentCount;
            saveDateAction(activeDateStr, attendCount, absentCount);
        });
    });

    document.getElementById('btn-clear-day').addEventListener('click', () => {
        if (!activeDateStr) return;
        delete appState.history[activeDateStr];
        saveState();
        updateScoreDisplay();
        generateTodoList(); // redraw pills
        selectDate(activeDateStr); // refresh action area
    });

    // Settings listeners
    document.getElementById('settings-btn').addEventListener('click', openSettings);
    document.getElementById('close-modal-btn').addEventListener('click', closeSettings);
    document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
    document.getElementById('calculate-value-btn').addEventListener('click', autoCalculateClassValue);
}

// Data saving layer
function saveDateAction(dateStr, attendCount, absentCount) {
    let dayArr = [];
    // Populate attends
    for(let i=0; i<attendCount; i++) dayArr.push('attend');
    // Populate absents
    for(let i=0; i<absentCount; i++) dayArr.push('absent');
    
    // Safety check, pad with none if less than 6
    while(dayArr.length < 6) dayArr.push('none');

    appState.history[dateStr] = dayArr;
    saveState();
    
    updateScoreDisplay();
    generateTodoList();        // Refresh list visually (pill status)
    selectDate(dateStr);       // Refresh action panel
}


// UI Generation Layer
function generateTodoList() {
    todoListContainer.innerHTML = '';
    
    // Calculate last 6 days ignoring purely future dates. We won't ignore weekends so you can log them if you needed to.
    const today = new Date();
    const daysToShow = 6;
    
    for (let i = 0; i < daysToShow; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = formatDateToISO(d);
        
        createDayCard(d, dateStr);
    }
}

function createDayCard(dateObj, dateStr) {
    const card = document.createElement('div');
    card.className = `day-card ${dateStr === activeDateStr ? 'active' : ''}`;
    
    const isToday = dateStr === getTodayStr();
    const dayName = isToday ? 'Today' : dateObj.toLocaleDateString([], { weekday: 'long' });
    const fullDate = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    
    // Get status from history
    let pillClass = 'status-missing';
    let pillText = 'Missing';
    
    if (appState.history[dateStr] && appState.history[dateStr].length > 0) {
        pillClass = 'status-logged';
        pillText = 'Logged ✓';
    }

    card.innerHTML = `
        <div class="day-info">
            <div class="day-name">${dayName}</div>
            <div class="full-date">${fullDate}</div>
        </div>
        <div class="day-status">
            <span class="status-pill ${pillClass}">${pillText}</span>
        </div>
    `;
    
    card.onclick = () => {
        // clear custom date if we picked from list
        customDateInput.value = '';
        selectDate(dateStr);
    };
    todoListContainer.appendChild(card);
}

function selectDate(dateStr) {
    activeDateStr = dateStr;
    
    // Highlight list
    document.querySelectorAll('.day-card').forEach(c => c.classList.remove('active'));
    // we must regenerate list to ensure active highlight since we recreate dom often
    generateTodoList(); 
    
    emptyState.classList.add('hidden');
    actionArea.classList.remove('hidden');
    
    const d = new Date(dateStr);
    // Because of timezone offsets when parsing ISO string without time, let's fix it:
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    actionDateTitle.innerText = d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

    // Check if recorded
    if (appState.history[dateStr]) {
        // Show already logged
        document.getElementById('btn-present-all').classList.add('hidden');
        document.querySelector('.absent-section').classList.add('hidden');
        alreadyLoggedArea.classList.remove('hidden');
        
        let localAtt = 0, localAbs = 0;
        appState.history[dateStr].forEach(st => {
            if (st === 'attend') localAtt++;
            if (st === 'absent') localAbs++;
        });
        loggedStatusText.innerText = `Attended ${localAtt}/6 classes`;
        if (localAbs > 0) loggedStatusText.innerText += ` (${localAbs} missed)`;
    } else {
        // Show options
        document.getElementById('btn-present-all').classList.remove('hidden');
        document.querySelector('.absent-section').classList.remove('hidden');
        alreadyLoggedArea.classList.add('hidden');
    }
    
    // On mobile screens, automatically scroll down to the action section for a magical user experience
    if (window.innerWidth <= 1024) {
        setTimeout(() => {
            document.querySelector('.right-panel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}


// Stats engine
function gatherStats() {
    let totalHeld = 0;
    let totalAttended = 0;
    let totalAbsent = 0;

    Object.values(appState.history).forEach(dayArr => {
        dayArr.forEach(st => {
            if (st !== 'none') totalHeld++;
            if (st === 'attend') totalAttended++;
            if (st === 'absent') totalAbsent++;
        });
    });

    return { totalHeld, totalAttended, totalAbsent };
}

function updateScoreDisplay() {
    const stats = gatherStats();
    
    const base = parseFloat(appState.baseScore || 0);
    const value = parseFloat(appState.classValue || 0);
    
    const formulaScore = base + (stats.totalAttended * value) - (stats.totalAbsent * value);
    const standardScore = stats.totalHeld > 0 ? (stats.totalAttended / stats.totalHeld) * 100 : 0;

    animateValue('formula-score', parseFloat(document.getElementById('formula-score').innerText), formulaScore.toFixed(3));
    animateValue('standard-score', parseFloat(document.getElementById('standard-score').innerText), standardScore.toFixed(2));
    
    document.getElementById('total-held').innerText = stats.totalHeld;
    document.getElementById('total-attended').innerText = stats.totalAttended;
    document.getElementById('total-absent').innerText = stats.totalAbsent;
}

function animateValue(id, start, endStr) {
    const obj = document.getElementById(id);
    const end = parseFloat(endStr) || 0;
    if (isNaN(start)) return (obj.innerHTML = endStr);
    let startTimestamp = null;
    const duration = 500;
    
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = start + progress * (end - start);
        obj.innerHTML = current.toFixed(id === 'formula-score' ? 3 : 2);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = endStr; 
        }
    };
    window.requestAnimationFrame(step);
}

// Setup Settings Drops
function populateYearDropdowns() {
    const startY = document.getElementById('start-year');
    const endY = document.getElementById('end-year');
    
    const curr = new Date().getFullYear();
    for (let i = curr - 2; i <= curr + 5; i++) {
        startY.appendChild(new Option(i, i));
        endY.appendChild(new Option(i, i));
    }
}

function openSettings() {
    document.getElementById('base-score').value = appState.baseScore || 0;
    document.getElementById('class-value').value = appState.classValue || 0.3344;
    
    document.getElementById('start-month').value = appState.startMonth || '7';
    document.getElementById('start-year').value = appState.startYear || new Date().getFullYear();
    document.getElementById('end-month').value = appState.endMonth || '2';
    document.getElementById('end-year').value = appState.endYear || new Date().getFullYear()+1;
    
    settingsModal.classList.add('active');
}

function closeSettings() {
    settingsModal.classList.remove('active');
}

function saveSettings() {
    appState.baseScore = parseFloat(document.getElementById('base-score').value) || 0;
    appState.classValue = parseFloat(document.getElementById('class-value').value) || 0;
    appState.startMonth = document.getElementById('start-month').value;
    appState.startYear = document.getElementById('start-year').value;
    appState.endMonth = document.getElementById('end-month').value;
    appState.endYear = document.getElementById('end-year').value;
    
    saveState();
    updateScoreDisplay();
    closeSettings();
}

function autoCalculateClassValue() {
    const sM = parseInt(document.getElementById('start-month').value);
    const sY = parseInt(document.getElementById('start-year').value);
    const eM = parseInt(document.getElementById('end-month').value);
    const eY = parseInt(document.getElementById('end-year').value);
    
    const start = new Date(sY, sM - 1, 1);
    const end = new Date(eY, eM, 0); // Last day of end month
    
    if (end < start) {
        alert("End date must be after start date.");
        return;
    }

    let workingDays = 0;
    let curr = new Date(start);
    while (curr <= end) {
        const day = curr.getDay();
        if (day !== 0 && day !== 6) workingDays++;
        curr.setDate(curr.getDate() + 1);
    }
    
    const totalClasses = workingDays * 6;
    if (totalClasses > 0) {
        const classVal = 100 / totalClasses;
        document.getElementById('class-value').value = classVal.toFixed(4);
        alert(`Calculated ~${workingDays} working days, 6 classes per day = ${totalClasses} total classes.\n1 Class is roughly ${classVal.toFixed(4)}%`);
    }
}

// Bootstrap
window.onload = initUI;
