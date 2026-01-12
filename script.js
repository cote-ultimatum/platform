// ========================================
// COTE: ULTIMATUM - OAA Website Script
// PC-Optimized Version with Enhanced Features
// ========================================

// State
let currentScreen = 'lock-screen';
let currentClass = null;
let currentStudent = null;
let currentOAAView = 'oaa-dashboard';

// Navigation history for proper back navigation
let navigationHistory = [];

// Mouse position for parallax
let mouseX = 0;
let mouseY = 0;

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    createStarfield();
    createParticles();
    initShootingStars();
    initGlitchEffects();
    updateTime();
    setInterval(updateTime, 1000);
    initLockScreen();
    initHomeScreen();
    initNavButtons();
    initOAAApp();
    initKeyboardNav();
    initRippleEffect();
    initParallax();
    initTypingEffect();
});

// ========================================
// STARFIELD & PARTICLES
// ========================================

function createStarfield() {
    const starfield = document.getElementById('starfield');
    if (!starfield) return;

    const starCount = 100; // Increased for better effect

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';

        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';

        const size = Math.random() * 2.5 + 0.5;
        star.style.width = size + 'px';
        star.style.height = size + 'px';

        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 5;
        star.style.setProperty('--duration', duration + 's');
        star.style.setProperty('--opacity', Math.random() * 0.5 + 0.4); // Increased visibility
        star.style.setProperty('--depth', Math.random()); // For parallax
        star.style.animationDelay = delay + 's';

        // 20% chance of cyan-tinted star
        if (Math.random() < 0.2) {
            star.style.background = '#4dc9e6';
            star.style.boxShadow = '0 0 6px rgba(77, 201, 230, 0.8)';
        }
        // 5% chance of crimson-tinted star
        else if (Math.random() < 0.05) {
            star.style.background = '#9a2e48';
            star.style.boxShadow = '0 0 6px rgba(154, 46, 72, 0.8)';
        }

        starfield.appendChild(star);
    }
}

function createParticles() {
    const starfield = document.getElementById('starfield');
    if (!starfield) return;

    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        particle.style.left = Math.random() * 100 + '%';

        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';

        const duration = Math.random() * 15 + 12;
        const delay = Math.random() * 20;
        particle.style.setProperty('--duration', duration + 's');
        particle.style.setProperty('--opacity', Math.random() * 0.4 + 0.15);
        particle.style.animationDelay = delay + 's';

        starfield.appendChild(particle);
    }
}

// ========================================
// SHOOTING STARS
// ========================================

function initShootingStars() {
    // Create shooting stars at random intervals
    function scheduleShootingStar() {
        const delay = Math.random() * 8000 + 4000; // 4-12 seconds between shooting stars
        setTimeout(() => {
            createShootingStar();
            scheduleShootingStar();
        }, delay);
    }

    // Start after initial delay
    setTimeout(scheduleShootingStar, 2000);
}

// ========================================
// GLITCH EFFECTS
// ========================================

function initGlitchEffects() {
    // Random glitch at intervals
    function scheduleGlitch() {
        const delay = Math.random() * 20000 + 15000; // 15-35 seconds between glitches
        setTimeout(() => {
            triggerRandomGlitch();
            scheduleGlitch();
        }, delay);
    }

    // Start after initial delay
    setTimeout(scheduleGlitch, 8000);
}

function triggerRandomGlitch() {
    const glitchType = Math.random();

    if (glitchType < 0.5) {
        // Glitch overlay flash
        const overlay = document.getElementById('glitch-overlay');
        if (overlay) {
            overlay.classList.add('active');
            setTimeout(() => overlay.classList.remove('active'), 150);
        }
    } else if (glitchType < 0.8) {
        // Scan line glitch
        const scanLine = document.getElementById('scan-glitch');
        if (scanLine) {
            scanLine.classList.add('active');
            setTimeout(() => scanLine.classList.remove('active'), 400);
        }
    } else {
        // Screen flicker
        document.body.classList.add('screen-flicker');
        setTimeout(() => document.body.classList.remove('screen-flicker'), 100);
    }
}

function createShootingStar() {
    const starfield = document.getElementById('starfield');
    if (!starfield) return;

    const shootingStar = document.createElement('div');
    shootingStar.className = 'shooting-star';

    // Random starting position (upper portion of screen)
    const startX = Math.random() * 80 + 10; // 10-90% from left
    const startY = Math.random() * 30 + 5;  // 5-35% from top

    shootingStar.style.left = startX + '%';
    shootingStar.style.top = startY + '%';

    // Angle: mostly diagonal down-right, with some variation
    const angle = Math.random() * 30 + 25; // 25-55 degrees
    shootingStar.style.setProperty('--angle', angle + 'deg');

    // Distance traveled
    const distance = Math.random() * 200 + 150;
    const distanceX = distance * Math.cos(angle * Math.PI / 180);
    const distanceY = distance * Math.sin(angle * Math.PI / 180);
    shootingStar.style.setProperty('--distance-x', distanceX + 'px');
    shootingStar.style.setProperty('--distance-y', distanceY + 'px');

    // Tail length and duration
    const tailLength = Math.random() * 60 + 40;
    shootingStar.style.setProperty('--tail-length', tailLength + 'px');
    shootingStar.style.setProperty('--duration', '0.8s');

    starfield.appendChild(shootingStar);

    // Remove after animation
    setTimeout(() => {
        shootingStar.remove();
    }, 1000);
}

// ========================================
// PARALLAX EFFECT
// ========================================

function initParallax() {
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        updateParallax();
    });
}

function updateParallax() {
    const starfield = document.getElementById('starfield');
    if (!starfield) return;

    const stars = starfield.querySelectorAll('.star');
    stars.forEach(star => {
        const depth = parseFloat(star.style.getPropertyValue('--depth')) || 0.5;
        const moveX = mouseX * 15 * depth;
        const moveY = mouseY * 15 * depth;
        star.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
}

// ========================================
// TYPING EFFECT WITH ROTATING QUOTES
// ========================================

const quotes = [
    { text: 'All people are nothing but tools. In this world, winning is everything.', attribution: '- Kiyotaka Ayanokōji' },
    { text: 'I\'ve never once thought of you as an ally. Not you. Not Kushida. Not Hirata.', attribution: '- Kiyotaka Ayanokōji' },
    { text: 'Class D is an assemblage of defective products.', attribution: '- Sae Chabashira' },
    { text: 'Violence is the most powerful weapon. True strength means the power to use it.', attribution: '- Kakeru Ryūen' },
    { text: 'Smiling means letting your guard down in front of another person, even if just a little.', attribution: '- Kiyotaka Ayanokōji' },
    { text: 'There are two things that define a person: their patience when they have nothing, and their attitude when they have everything.', attribution: '- Arisu Sakayanagi' },
    { text: 'Those who remember there was someone named Kiyotaka Ayanokōji will never forget.', attribution: '- Manabu Horikita' },
    { text: 'It doesn\'t matter what needs to be sacrificed. As long as I win in the end, that\'s all that matters.', attribution: '- Kiyotaka Ayanokōji' }
];

let currentTypingTimeout = null;

function initTypingEffect() {
    const quoteText = document.querySelector('.quote-text');
    if (quoteText) {
        quoteText.textContent = '';
    }
}

function triggerQuoteTyping() {
    const quoteText = document.querySelector('.quote-text');
    const quoteAttribution = document.querySelector('.quote-attribution');
    if (!quoteText) return;

    // Clear any ongoing typing
    if (currentTypingTimeout) {
        clearTimeout(currentTypingTimeout);
    }

    // Select random quote
    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    // Reset and start fresh
    quoteText.textContent = '';
    if (quoteAttribution) {
        quoteAttribution.textContent = quote.attribution;
        quoteAttribution.style.opacity = '0';
    }

    // Small delay before typing starts
    currentTypingTimeout = setTimeout(() => {
        typeText(quoteText, quote.text, 0, () => {
            // Show attribution after typing completes
            if (quoteAttribution) {
                quoteAttribution.style.transition = 'opacity 0.5s ease';
                quoteAttribution.style.opacity = '1';
            }
        });
    }, 400);
}

function typeText(element, text, index, onComplete) {
    if (index < text.length) {
        element.textContent += text.charAt(index);
        currentTypingTimeout = setTimeout(() => typeText(element, text, index + 1, onComplete), 30);
    } else if (onComplete) {
        onComplete();
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
    const oaaTime = document.getElementById('oaa-time');
    const eventsTime = document.getElementById('events-time');

    if (lockTime) lockTime.textContent = timeStr;
    if (lockDate) lockDate.textContent = dateStr;
    if (homeTime) homeTime.textContent = timeStr;
    if (oaaTime) oaaTime.textContent = timeStr;
    if (eventsTime) eventsTime.textContent = timeStr;
}

// ========================================
// SCREEN NAVIGATION (with history)
// ========================================

function showScreen(screenId, addToHistory = true) {
    // Add current state to history before changing
    if (addToHistory && currentScreen !== screenId) {
        navigationHistory.push({
            screen: currentScreen,
            oaaView: currentOAAView,
            classData: currentClass ? { ...currentClass } : null
        });
    }

    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active');
        currentScreen = screenId;

        // Trigger quote typing when home screen is shown
        if (screenId === 'home-screen') {
            triggerQuoteTyping();
        }
    }
}

function goBack() {
    // If we have history, use it
    if (navigationHistory.length > 0) {
        const previous = navigationHistory.pop();

        if (previous.screen === 'oaa-app') {
            showScreen('oaa-app', false);

            // Restore the correct OAA view
            if (previous.oaaView === 'oaa-class' && previous.classData) {
                // Restore class view
                showClassView(previous.classData.year, previous.classData.className, false);
            } else {
                showOAAView(previous.oaaView, false);
            }
        } else {
            showScreen(previous.screen, false);
        }
        return;
    }

    // Fallback logic if no history
    if (currentScreen === 'oaa-app') {
        if (currentOAAView === 'oaa-profile') {
            showOAAView('oaa-class', false);
        } else if (currentOAAView === 'oaa-class') {
            showOAAView('oaa-dashboard', false);
        } else {
            showScreen('home-screen', false);
        }
    } else if (currentScreen === 'events-app') {
        showScreen('home-screen', false);
    } else if (currentScreen === 'home-screen') {
        showScreen('lock-screen', false);
    }
}

// ========================================
// LOCK SCREEN
// ========================================

function initLockScreen() {
    const lockScreen = document.getElementById('lock-screen');
    if (lockScreen) {
        lockScreen.addEventListener('click', () => {
            navigationHistory = []; // Clear history when unlocking
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
            navigationHistory = []; // Clear history when locking
            showScreen('lock-screen', false);
        });
    }
}

function openApp(appId) {
    if (appId === 'oaa') {
        showScreen('oaa-app');
        showOAAView('oaa-dashboard', false);
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
                navigationHistory = []; // Clear history when going home
                showScreen('home-screen', false);
            }
        });
    });

    document.querySelectorAll('.back-link').forEach(link => {
        link.addEventListener('click', () => {
            goBack();
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
            navigationHistory = [];
            showScreen('home-screen');
            return;
        }

        // ESC to go back (but not if in search)
        if (e.key === 'Escape') {
            const searchInput = document.querySelector('.search-input');
            if (searchInput && document.activeElement === searchInput) {
                searchInput.blur();
                searchInput.value = '';
                filterStudents('');
            } else {
                goBack();
            }
            return;
        }

        // Ctrl+K or / to focus search (when in OAA app)
        if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && currentScreen === 'oaa-app')) {
            e.preventDefault();
            const searchInput = document.querySelector('.search-input');
            if (searchInput && currentScreen === 'oaa-app' && currentOAAView === 'oaa-dashboard') {
                searchInput.focus();
            }
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

function showOAAView(viewId, addToHistory = true) {
    // Add to history if changing views within OAA
    if (addToHistory && currentOAAView !== viewId) {
        navigationHistory.push({
            screen: 'oaa-app',
            oaaView: currentOAAView,
            classData: currentClass ? { ...currentClass } : null
        });
    }

    document.querySelectorAll('#oaa-app .app-view').forEach(view => {
        view.classList.remove('active');
    });
    const target = document.getElementById(viewId);
    if (target) {
        target.classList.add('active');
        currentOAAView = viewId;
        // Scroll to top of view
        target.scrollTop = 0;
    }
}

function initOAAApp() {
    buildStudentLookup();
    renderClassCards();
    initSearch();
    initSorting();
}

// ========================================
// SORTING FUNCTIONALITY
// ========================================

let currentSort = 'default';

function initSorting() {
    const sortButtons = document.querySelectorAll('.sort-btn');
    sortButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            sortButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Apply sort
            currentSort = btn.dataset.sort;
            renderClassCards();
        });
    });
}

function getSortedStudents(students, sortBy) {
    if (sortBy === 'default') {
        return students;
    }

    return [...students].sort((a, b) => {
        let valueA, valueB;

        if (sortBy === 'overall') {
            valueA = calculateOverallValue(a.stats);
            valueB = calculateOverallValue(b.stats);
        } else {
            valueA = a.stats[sortBy] || 50;
            valueB = b.stats[sortBy] || 50;
        }

        return valueB - valueA; // Descending order (highest first)
    });
}

function calculateOverallValue(stats) {
    const values = [
        stats.academic || 50,
        stats.intelligence || 50,
        stats.decision || 50,
        stats.physical || 50,
        stats.cooperativeness || 50
    ];
    return values.reduce((a, b) => a + b, 0) / values.length;
}

// ========================================
// SEARCH FUNCTIONALITY
// ========================================

function initSearch() {
    const searchContainer = document.querySelector('.search-container');
    if (!searchContainer) return;

    const searchInput = searchContainer.querySelector('.search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        filterStudents(query);
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            filterStudents('');
            searchInput.blur();
        }
    });
}

function filterStudents(query) {
    const classCards = document.querySelectorAll('.class-card');

    if (!query) {
        // Show all
        classCards.forEach(card => {
            card.style.display = '';
            card.querySelectorAll('.student-preview').forEach(preview => {
                preview.style.display = '';
            });
        });
        return;
    }

    classCards.forEach(card => {
        const previews = card.querySelectorAll('.student-preview');
        let hasMatch = false;

        previews.forEach(preview => {
            const name = preview.querySelector('.student-preview-name').textContent.toLowerCase();
            const id = preview.querySelector('.student-preview-id').textContent.toLowerCase();

            if (name.includes(query) || id.includes(query)) {
                preview.style.display = '';
                hasMatch = true;
            } else {
                preview.style.display = 'none';
            }
        });

        // Also check class name
        const classLabel = card.querySelector('.class-label').textContent.toLowerCase();
        if (classLabel.includes(query)) {
            hasMatch = true;
            previews.forEach(preview => preview.style.display = '');
        }

        card.style.display = hasMatch ? '' : 'none';
    });
}

function renderClassCards() {
    const container = document.getElementById('first-year-classes');
    if (!container) return;

    const classes = ['A', 'B', 'C', 'D'];
    container.innerHTML = '';

    let totalStudents = 0;

    classes.forEach(className => {
        const students = getStudentsByClass(1, className);
        const sortedStudents = getSortedStudents(students, currentSort);
        totalStudents += students.length;
        const card = createClassCard(1, className, sortedStudents);
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

    const previewStudents = students.slice(0, 3);
    const studentPreviews = previewStudents.map(s => createStudentPreview(s, className)).join('');

    const emptyMessage = students.length === 0
        ? '<div class="empty-class">No students enrolled</div>'
        : '';

    const viewAllLink = students.length > 3
        ? `<div class="view-all-link">View all ${students.length} students</div>`
        : '';

    // Get class points and ranking
    const points = (typeof classPoints !== 'undefined' && classPoints[year])
        ? classPoints[year][className] || 0
        : 0;

    // Calculate rank
    const rank = getClassRank(year, className);
    const rankSuffix = rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th';

    card.innerHTML = `
        <div class="class-card-header">
            <div class="class-badge">
                <div class="class-letter">${className}</div>
                <span class="class-label">Class ${className}</span>
            </div>
            <div class="class-card-stats">
                <div class="class-rank">${rank}${rankSuffix}</div>
                <span class="class-points">${points.toLocaleString()} CP</span>
            </div>
        </div>
        <div class="class-card-students">
            ${studentPreviews}
            ${emptyMessage}
        </div>
        ${viewAllLink}
    `;

    // Add click handlers for student previews
    card.querySelectorAll('.student-preview').forEach(preview => {
        preview.addEventListener('click', (e) => {
            e.stopPropagation();
            const studentId = preview.dataset.studentId;
            const student = studentLookup[studentId];
            if (student) {
                // First navigate to class view (in history), then to profile
                currentClass = { year: student.year, className: student.class };

                // Add dashboard to history
                navigationHistory.push({
                    screen: 'oaa-app',
                    oaaView: 'oaa-dashboard',
                    classData: null
                });

                // Add class view to history
                navigationHistory.push({
                    screen: 'oaa-app',
                    oaaView: 'oaa-class',
                    classData: { year: student.year, className: student.class }
                });

                // Now show profile
                showStudentProfile(student, false);
            }
        });
    });

    // Card click goes to class view
    card.addEventListener('click', () => {
        showClassView(year, className);
    });

    return card;
}

function createStudentPreview(student, className) {
    const initials = getInitials(student.name);
    const avatarHtml = student.image
        ? `<img class="student-avatar" src="${student.image}" alt="${student.name}">`
        : `<div class="student-avatar-placeholder">${initials}</div>`;

    return `
        <div class="student-preview" data-student-id="${student.id}">
            ${avatarHtml}
            <div class="student-preview-info">
                <div class="student-preview-name">${student.name}</div>
                <div class="student-preview-id">${student.id}</div>
            </div>
        </div>
    `;
}

// Store students for quick lookup
let studentLookup = {};

function buildStudentLookup() {
    if (typeof studentData === 'undefined') return;
    studentData.forEach(s => {
        studentLookup[s.id] = s;
    });
}

function showClassView(year, className, addToHistory = true) {
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

    showOAAView('oaa-class', addToHistory);
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

    const overallGrade = calculateOverallGrade(student.stats);

    card.innerHTML = `
        ${avatarHtml}
        <div class="student-card-info">
            <div class="student-card-name">${student.name}</div>
            <div class="student-card-class">${student.year}${getYearSuffix(student.year)} Year - Class ${student.class}</div>
        </div>
        <div class="student-card-rating">
            <span class="rating-grade">${overallGrade}</span>
            <span class="rating-label">OAA</span>
        </div>
    `;

    return card;
}

function showStudentProfile(student, addToHistory = true) {
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

        // Animate bar with color class
        setTimeout(() => {
            const fill = statRow.querySelector('.stat-bar-fill');
            fill.style.width = value + '%';
            // Add color class based on value
            if (value < 40) {
                fill.classList.add('stat-low');
            } else if (value < 70) {
                fill.classList.add('stat-medium');
            } else {
                fill.classList.add('stat-high');
            }
        }, 100 + index * 80);
    });

    showOAAView('oaa-profile', addToHistory);
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function getStudentsByClass(year, className) {
    if (typeof studentData === 'undefined') return [];
    return studentData.filter(s => s.year === year && s.class === className);
}

function getClassRank(year, className) {
    if (typeof classPoints === 'undefined' || !classPoints[year]) return 0;

    const yearPoints = classPoints[year];
    const classes = Object.entries(yearPoints)
        .sort((a, b) => b[1] - a[1]); // Sort by points descending

    const rank = classes.findIndex(([cls]) => cls === className) + 1;
    return rank || 0;
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

// ========================================
// RIPPLE EFFECT
// ========================================

function initRippleEffect() {
    // Add ripple to buttons and interactive elements
    const rippleTargets = document.querySelectorAll('.nav-btn, .lock-btn, .app-icon-image');

    rippleTargets.forEach(target => {
        target.classList.add('ripple-container');
        target.addEventListener('click', createRipple);
    });
}

function createRipple(e) {
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();

    const ripple = document.createElement('span');
    ripple.className = 'ripple';

    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';

    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

    element.appendChild(ripple);

    // Remove ripple after animation
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

