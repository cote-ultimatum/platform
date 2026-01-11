// ========================================
// COTE: ULTIMATUM - OAA Website Script
// PC-Optimized Version
// ========================================

// State
let currentScreen = 'lock-screen';
let currentClass = null;
let currentStudent = null;
let currentOAAView = 'oaa-dashboard';

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    createStarfield();
    createParticles();
    updateTime();
    setInterval(updateTime, 1000);
    initLockScreen();
    initHomeScreen();
    initNavButtons();
    initOAAApp();
    initKeyboardNav();
});

// ========================================
// STARFIELD & PARTICLES
// ========================================

function createStarfield() {
    const starfield = document.getElementById('starfield');
    if (!starfield) return;

    const starCount = 80;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';

        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';

        const size = Math.random() * 2 + 1;
        star.style.width = size + 'px';
        star.style.height = size + 'px';

        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 5;
        star.style.setProperty('--duration', duration + 's');
        star.style.setProperty('--opacity', Math.random() * 0.5 + 0.2);
        star.style.animationDelay = delay + 's';

        starfield.appendChild(star);
    }
}

function createParticles() {
    const starfield = document.getElementById('starfield');
    if (!starfield) return;

    const particleCount = 12;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        particle.style.left = Math.random() * 100 + '%';

        const size = Math.random() * 3 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';

        const duration = Math.random() * 15 + 15;
        const delay = Math.random() * 20;
        particle.style.setProperty('--duration', duration + 's');
        particle.style.setProperty('--opacity', Math.random() * 0.3 + 0.1);
        particle.style.animationDelay = delay + 's';

        starfield.appendChild(particle);
    }
}

// ========================================
// TIME DISPLAY
// ========================================

function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    const lockTime = document.getElementById('lock-time');
    const lockDate = document.getElementById('lock-date');
    const homeTime = document.getElementById('home-time');

    if (lockTime) lockTime.textContent = timeStr;
    if (lockDate) lockDate.textContent = dateStr;
    if (homeTime) homeTime.textContent = timeStr;
}

// ========================================
// SCREEN NAVIGATION
// ========================================

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active');
        currentScreen = screenId;
    }
}

function goBack() {
    if (currentScreen === 'oaa-app') {
        if (currentOAAView === 'oaa-profile') {
            showOAAView('oaa-class');
        } else if (currentOAAView === 'oaa-class') {
            showOAAView('oaa-dashboard');
        } else {
            showScreen('home-screen');
        }
    } else if (currentScreen === 'events-app') {
        showScreen('home-screen');
    } else if (currentScreen === 'home-screen') {
        showScreen('lock-screen');
    }
}

// ========================================
// LOCK SCREEN
// ========================================

function initLockScreen() {
    const lockScreen = document.getElementById('lock-screen');
    if (lockScreen) {
        lockScreen.addEventListener('click', () => {
            showScreen('home-screen');
        });
    }
}

// ========================================
// HOME SCREEN
// ========================================

function initHomeScreen() {
    // App icons
    document.querySelectorAll('.app-icon').forEach(icon => {
        icon.addEventListener('click', () => {
            const appId = icon.dataset.app;
            openApp(appId);
        });
    });

    // Lock button
    const lockBtn = document.getElementById('lock-btn');
    if (lockBtn) {
        lockBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showScreen('lock-screen');
        });
    }
}

function openApp(appId) {
    if (appId === 'oaa') {
        showScreen('oaa-app');
        showOAAView('oaa-dashboard');
    } else if (appId === 'events') {
        showScreen('events-app');
    }
}

// ========================================
// NAVIGATION BUTTONS
// ========================================

function initNavButtons() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (action === 'back') {
                goBack();
            } else if (action === 'home') {
                showScreen('home-screen');
            }
        });
    });

    document.querySelectorAll('.back-link').forEach(link => {
        link.addEventListener('click', () => {
            const target = link.dataset.view;
            showOAAView(target);
        });
    });
}

// ========================================
// KEYBOARD NAVIGATION
// ========================================

function initKeyboardNav() {
    document.addEventListener('keydown', (e) => {
        // Enter to unlock
        if (e.key === 'Enter' && currentScreen === 'lock-screen') {
            showScreen('home-screen');
            return;
        }

        // ESC to go back
        if (e.key === 'Escape') {
            goBack();
            return;
        }

        // Number keys for apps (from home screen)
        if (currentScreen === 'home-screen') {
            if (e.key === '1') {
                openApp('oaa');
            } else if (e.key === '2') {
                openApp('events');
            }
        }
    });
}

// ========================================
// OAA APP
// ========================================

function showOAAView(viewId) {
    document.querySelectorAll('#oaa-app .app-view').forEach(view => {
        view.classList.remove('active');
    });
    const target = document.getElementById(viewId);
    if (target) {
        target.classList.add('active');
        currentOAAView = viewId;
    }
}

function initOAAApp() {
    renderClassCards();
}

function renderClassCards() {
    const container = document.getElementById('first-year-classes');
    if (!container) return;

    const classes = ['A', 'B', 'C', 'D'];
    container.innerHTML = '';

    let totalStudents = 0;

    classes.forEach(className => {
        const students = getStudentsByClass(1, className);
        totalStudents += students.length;
        const card = createClassCard(1, className, students);
        container.appendChild(card);
    });

    // Update total count
    const countEl = document.getElementById('first-year-count');
    if (countEl) {
        countEl.textContent = `${totalStudents} total`;
    }
}

function createClassCard(year, className, students) {
    const card = document.createElement('div');
    card.className = `class-card class-${className.toLowerCase()}`;
    card.addEventListener('click', () => {
        showClassView(year, className);
    });

    const previewStudents = students.slice(0, 3);
    const studentPreviews = previewStudents.map(s => createStudentPreview(s, className)).join('');

    const emptyMessage = students.length === 0
        ? '<div class="empty-class">No students enrolled</div>'
        : '';

    const viewAllLink = students.length > 3
        ? `<div class="view-all-link">View all ${students.length} students</div>`
        : '';

    card.innerHTML = `
        <div class="class-card-header">
            <div class="class-badge">
                <div class="class-letter">${className}</div>
                <span class="class-label">Class ${className}</span>
            </div>
            <span class="class-card-count">${students.length}</span>
        </div>
        <div class="class-card-students">
            ${studentPreviews}
            ${emptyMessage}
        </div>
        ${viewAllLink}
    `;

    return card;
}

function createStudentPreview(student, className) {
    const initials = getInitials(student.name);
    const avatarHtml = student.image
        ? `<img class="student-avatar" src="${student.image}" alt="${student.name}">`
        : `<div class="student-avatar-placeholder">${initials}</div>`;

    return `
        <div class="student-preview">
            ${avatarHtml}
            <div class="student-preview-info">
                <div class="student-preview-name">${student.name}</div>
                <div class="student-preview-id">${student.id}</div>
            </div>
        </div>
    `;
}

function showClassView(year, className) {
    currentClass = { year, className };
    const students = getStudentsByClass(year, className);

    // Update badge
    const badge = document.getElementById('class-badge');
    if (badge) {
        badge.textContent = className;
        badge.className = `class-view-badge class-${className.toLowerCase()}`;
    }

    document.getElementById('class-title').textContent = `${year}${getYearSuffix(year)} Year - Class ${className}`;
    document.getElementById('student-count').textContent = `${students.length} Students`;

    const container = document.getElementById('student-list');
    container.innerHTML = '';

    if (students.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 3rem;">No students enrolled in this class</p>';
    } else {
        students.forEach(student => {
            const card = createStudentCard(student);
            container.appendChild(card);
        });
    }

    const backLink = document.querySelector('#oaa-class .back-link');
    if (backLink) {
        backLink.dataset.view = 'oaa-dashboard';
    }

    showOAAView('oaa-class');
}

function createStudentCard(student) {
    const card = document.createElement('div');
    card.className = 'student-card';
    card.addEventListener('click', () => {
        showStudentProfile(student);
    });

    const initials = getInitials(student.name);
    const avatarHtml = student.image
        ? `<img class="student-card-avatar" src="${student.image}" alt="${student.name}">`
        : `<div class="student-card-avatar-placeholder">${initials}</div>`;

    card.innerHTML = `
        ${avatarHtml}
        <div class="student-card-info">
            <div class="student-card-name">${student.name}</div>
            <div class="student-card-class">${student.year}${getYearSuffix(student.year)} Year - Class ${student.class}</div>
        </div>
        <div class="student-card-id">${student.id}</div>
    `;

    return card;
}

function showStudentProfile(student) {
    currentStudent = student;

    document.getElementById('profile-name').textContent = student.name;
    document.getElementById('profile-class').textContent = `${student.year}${getYearSuffix(student.year)} Year - Class ${student.class}`;
    document.getElementById('profile-id').textContent = student.id;

    const profileImage = document.getElementById('profile-image');
    const profilePlaceholder = document.getElementById('profile-placeholder');

    if (student.image) {
        profileImage.src = student.image;
        profileImage.style.display = 'block';
        if (profilePlaceholder) profilePlaceholder.style.display = 'none';
    } else {
        profileImage.style.display = 'none';
        if (profilePlaceholder) profilePlaceholder.style.display = 'flex';
    }

    // Calculate and display overall grade
    const overall = calculateOverallGrade(student.stats);
    document.getElementById('profile-overall').textContent = overall;

    // Render stats
    const statList = document.getElementById('stat-list');
    statList.innerHTML = '';

    const statNames = [
        'Academic Ability',
        'Intelligence',
        'Decision Making',
        'Physical Ability',
        'Cooperativeness'
    ];

    const statKeys = ['academic', 'intelligence', 'decision', 'physical', 'cooperativeness'];

    statKeys.forEach((key, index) => {
        const value = student.stats[key] || 50;
        const grade = getGradeFromValue(value);
        const statRow = document.createElement('div');
        statRow.className = 'stat-row';
        statRow.innerHTML = `
            <div class="stat-header">
                <span class="stat-label">${statNames[index]}</span>
                <span class="stat-value">${value}/100 <span class="stat-grade">${grade}</span></span>
            </div>
            <div class="stat-bar">
                <div class="stat-bar-fill" style="width: 0%"></div>
            </div>
        `;
        statList.appendChild(statRow);

        // Animate bar
        setTimeout(() => {
            statRow.querySelector('.stat-bar-fill').style.width = value + '%';
        }, 100 + index * 80);
    });

    const backLink = document.querySelector('#oaa-profile .back-link');
    if (backLink) {
        backLink.dataset.view = 'oaa-class';
    }

    showOAAView('oaa-profile');
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function getStudentsByClass(year, className) {
    if (typeof studentData === 'undefined') return [];
    return studentData.filter(s => s.year === year && s.class === className);
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getYearSuffix(year) {
    if (year === 1) return 'st';
    if (year === 2) return 'nd';
    if (year === 3) return 'rd';
    return 'th';
}

function getGradeFromValue(value) {
    if (value >= 90) return 'A+';
    if (value >= 85) return 'A';
    if (value >= 80) return 'A-';
    if (value >= 75) return 'B+';
    if (value >= 70) return 'B';
    if (value >= 65) return 'B-';
    if (value >= 60) return 'C+';
    if (value >= 55) return 'C';
    if (value >= 50) return 'C-';
    if (value >= 45) return 'D+';
    if (value >= 40) return 'D';
    if (value >= 35) return 'D-';
    return 'E';
}

function calculateOverallGrade(stats) {
    const values = [
        stats.academic || 50,
        stats.intelligence || 50,
        stats.decision || 50,
        stats.physical || 50,
        stats.cooperativeness || 50
    ];
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    return getGradeFromValue(average);
}
