// ========================================
// COTE: ULTIMATUM - OAA Website Script
// Comprehensive Rewrite with Unified Systems
// ========================================

// ========================================
// STATE MANAGEMENT
// ========================================

const state = {
    currentScreen: 'lock-screen',
    currentClass: null,
    currentStudent: null,
    currentOAAView: 'oaa-dashboard',
    currentSort: 'default',
    navigationHistory: [],
    keysHeld: {},
    mouseX: 0,
    mouseY: 0,
    favorites: JSON.parse(localStorage.getItem('cote-favorites') || '[]'),
    compareList: [],
    compareMode: false,
    showFavoritesOnly: false
};

// Audio context
let audioContext = null;

// ========================================
// SOUND DESIGN SYSTEM
// ========================================
// Consistent sound categories:
// - 'boot'    : System startup (first interaction only)
// - 'unlock'  : Unlocking/accessing (subsequent unlocks)
// - 'open'    : Opening apps, navigating forward, expanding
// - 'back'    : Going back, closing, collapsing
// - 'select'  : UI state changes (sort, focus, toggle)
// - 'click'   : Primary actions (selecting items, confirming)
// - 'hover'   : Hover feedback (very subtle)
// - 'type'    : Keyboard input in fields
// - 'success' : Positive feedback (favoriting, etc.)
// - 'error'   : Negative feedback

function playSound(type) {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const now = audioContext.currentTime;

    switch (type) {
        case 'boot':
            // Rising three-tone chime
            oscillator.frequency.setValueAtTime(300, now);
            oscillator.frequency.setValueAtTime(450, now + 0.15);
            oscillator.frequency.setValueAtTime(600, now + 0.3);
            gainNode.gain.setValueAtTime(0.08, now);
            gainNode.gain.setValueAtTime(0.1, now + 0.15);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            oscillator.start(now);
            oscillator.stop(now + 0.5);
            break;

        case 'unlock':
            // Rising sweep
            oscillator.frequency.setValueAtTime(400, now);
            oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.15);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            oscillator.start(now);
            oscillator.stop(now + 0.2);
            break;

        case 'open':
            // Rising tone
            oscillator.frequency.setValueAtTime(500, now);
            oscillator.frequency.exponentialRampToValueAtTime(700, now + 0.1);
            gainNode.gain.setValueAtTime(0.08, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            oscillator.start(now);
            oscillator.stop(now + 0.1);
            break;

        case 'back':
            // Falling tone
            oscillator.frequency.setValueAtTime(600, now);
            oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.08);
            gainNode.gain.setValueAtTime(0.06, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            oscillator.start(now);
            oscillator.stop(now + 0.08);
            break;

        case 'select':
            // Quick high blip
            oscillator.frequency.setValueAtTime(1000, now);
            gainNode.gain.setValueAtTime(0.05, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
            oscillator.start(now);
            oscillator.stop(now + 0.03);
            break;

        case 'click':
            // Medium blip
            oscillator.frequency.setValueAtTime(800, now);
            oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.05);
            gainNode.gain.setValueAtTime(0.08, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            oscillator.start(now);
            oscillator.stop(now + 0.05);
            break;

        case 'hover':
            // Very subtle tick
            oscillator.frequency.setValueAtTime(1400, now);
            gainNode.gain.setValueAtTime(0.012, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.012);
            oscillator.start(now);
            oscillator.stop(now + 0.012);
            break;

        case 'type':
            // Soft keystroke
            oscillator.frequency.setValueAtTime(1200, now);
            gainNode.gain.setValueAtTime(0.02, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
            oscillator.start(now);
            oscillator.stop(now + 0.02);
            break;

        case 'success':
            // Pleasant two-tone
            oscillator.frequency.setValueAtTime(600, now);
            oscillator.frequency.setValueAtTime(900, now + 0.1);
            gainNode.gain.setValueAtTime(0.08, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            oscillator.start(now);
            oscillator.stop(now + 0.2);
            break;

        case 'error':
            // Low buzz
            oscillator.frequency.setValueAtTime(200, now);
            oscillator.type = 'square';
            gainNode.gain.setValueAtTime(0.05, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            oscillator.start(now);
            oscillator.stop(now + 0.15);
            break;
    }
}

// ========================================
// GLITCH EFFECT SYSTEM
// ========================================

function triggerGlitch(element, duration = 150) {
    if (!element) return;
    element.classList.add('glitching');
    setTimeout(() => element.classList.remove('glitching'), duration);
}

function triggerScreenGlitch() {
    const overlay = document.getElementById('glitch-overlay');
    if (overlay) {
        overlay.classList.add('active');
        setTimeout(() => overlay.classList.remove('active'), 150);
    }
}

function triggerScreenFlicker() {
    document.body.classList.add('screen-flicker');
    setTimeout(() => document.body.classList.remove('screen-flicker'), 100);
}

function initGlitchEffects() {
    // Glitch on hover for app icons
    document.querySelectorAll('.app-icon-image').forEach(icon => {
        icon.addEventListener('mouseenter', () => triggerGlitch(icon));
    });

    // Glitch on hover for COTE title
    const lockTitle = document.querySelector('.lock-title');
    if (lockTitle) {
        lockTitle.addEventListener('mouseenter', () => triggerGlitch(lockTitle));
    }

    // Glitch on hover for home brand title
    const homeBrandTitle = document.querySelector('.home-brand-title');
    if (homeBrandTitle) {
        homeBrandTitle.addEventListener('mouseenter', () => triggerGlitch(homeBrandTitle));
    }
}

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
    initKeyboardHintClicks();
    initCollapsibleSections();
    initTypingEffect();
    initParallax();
});

// ========================================
// CLICKABLE KEYBOARD HINTS
// ========================================

function initCollapsibleSections() {
    document.querySelectorAll('.events-section.collapsible .events-section-header').forEach(header => {
        header.addEventListener('click', () => {
            const section = header.closest('.events-section');
            const content = section.querySelector('.collapsible-content');

            if (content.classList.contains('collapsed')) {
                content.classList.remove('collapsed');
                section.classList.add('expanded');
                playSound('open');
            } else {
                content.classList.add('collapsed');
                section.classList.remove('expanded');
                playSound('back');
            }
        });

        header.addEventListener('mouseenter', () => playSound('hover'));
    });
}

function initKeyboardHintClicks() {
    document.querySelectorAll('.key-hint').forEach(hint => {
        hint.style.cursor = 'pointer';

        const handleHintClick = () => {
            const keyEl = hint.querySelector('.key');
            if (!keyEl) return;
            const key = keyEl.textContent.trim().toUpperCase();

            // Simulate the keyboard action
            switch (key) {
                case 'ESC':
                    if (state.currentScreen === 'oaa-app' || state.currentScreen === 'events-app') {
                        playSound('back');
                        goBack();
                    } else if (state.currentScreen === 'home-screen') {
                        playSound('back');
                        state.navigationHistory = [];
                        showScreen('lock-screen', false);
                    }
                    break;
                case '/':
                    if (state.currentScreen === 'oaa-app' && state.currentOAAView === 'oaa-dashboard') {
                        const searchInput = document.querySelector('.search-input');
                        if (searchInput) searchInput.focus();
                    }
                    break;
                case 'F':
                    if (state.currentScreen === 'oaa-app' && state.currentOAAView === 'oaa-dashboard') {
                        toggleFavoritesFilter();
                    }
                    break;
                case 'C':
                    if (state.currentScreen === 'oaa-app' &&
                        (state.currentOAAView === 'oaa-dashboard' || state.currentOAAView === 'oaa-class')) {
                        toggleCompareMode();
                    }
                    break;
                case '1':
                    if (state.currentScreen === 'home-screen') {
                        playSound('open');
                        openApp('oaa');
                    }
                    break;
                case '2':
                    if (state.currentScreen === 'home-screen') {
                        playSound('open');
                        openApp('events');
                    }
                    break;
                case 'LOCK':
                    if (state.currentScreen === 'home-screen') {
                        playSound('back');
                        state.navigationHistory = [];
                        showScreen('lock-screen', false);
                    }
                    break;
            }
        };

        // Support both click and touch
        hint.addEventListener('click', handleHintClick);
        hint.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleHintClick();
        });

        // Add hover sound
        hint.addEventListener('mouseenter', () => playSound('hover'));
    });
}

// ========================================
// STARFIELD & PARTICLES
// ========================================

function createStarfield() {
    const starfield = document.getElementById('starfield');
    if (!starfield) return;

    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        const size = Math.random() * 2.5 + 0.5;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.setProperty('--duration', (Math.random() * 3 + 2) + 's');
        star.style.setProperty('--opacity', Math.random() * 0.5 + 0.4);
        star.style.setProperty('--depth', Math.random());
        star.style.animationDelay = (Math.random() * 5) + 's';

        if (Math.random() < 0.2) {
            star.style.background = '#4dc9e6';
            star.style.boxShadow = '0 0 6px rgba(77, 201, 230, 0.8)';
        } else if (Math.random() < 0.05) {
            star.style.background = '#9a2e48';
            star.style.boxShadow = '0 0 6px rgba(154, 46, 72, 0.8)';
        }
        starfield.appendChild(star);
    }
}

function createParticles() {
    const starfield = document.getElementById('starfield');
    if (!starfield) return;

    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.setProperty('--duration', (Math.random() * 15 + 12) + 's');
        particle.style.setProperty('--opacity', Math.random() * 0.4 + 0.15);
        particle.style.animationDelay = (Math.random() * 20) + 's';
        starfield.appendChild(particle);
    }
}

function initShootingStars() {
    function scheduleShootingStar() {
        setTimeout(() => {
            createShootingStar();
            scheduleShootingStar();
        }, Math.random() * 8000 + 4000);
    }
    setTimeout(scheduleShootingStar, 2000);
}

function createShootingStar() {
    const starfield = document.getElementById('starfield');
    if (!starfield) return;

    const star = document.createElement('div');
    star.className = 'shooting-star';
    star.style.left = (Math.random() * 80 + 10) + '%';
    star.style.top = (Math.random() * 30 + 5) + '%';
    const angle = Math.random() * 30 + 25;
    star.style.setProperty('--angle', angle + 'deg');
    const distance = Math.random() * 200 + 150;
    star.style.setProperty('--distance-x', (distance * Math.cos(angle * Math.PI / 180)) + 'px');
    star.style.setProperty('--distance-y', (distance * Math.sin(angle * Math.PI / 180)) + 'px');
    star.style.setProperty('--tail-length', (Math.random() * 60 + 40) + 'px');
    star.style.setProperty('--duration', '0.8s');
    starfield.appendChild(star);
    setTimeout(() => star.remove(), 1000);
}

// ========================================
// PARALLAX
// ========================================

function initParallax() {
    document.addEventListener('mousemove', (e) => {
        state.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        state.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        updateParallax();
    });
}

function updateParallax() {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        const depth = parseFloat(star.style.getPropertyValue('--depth')) || 0.5;
        star.style.transform = `translate(${state.mouseX * 15 * depth}px, ${state.mouseY * 15 * depth}px)`;
    });
}

// ========================================
// TYPING EFFECT
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

let typingTimeout = null;

function initTypingEffect() {
    const quoteText = document.querySelector('.quote-text');
    if (quoteText) quoteText.textContent = '';
}

function triggerQuoteTyping() {
    const quoteText = document.querySelector('.quote-text');
    const quoteAttribution = document.querySelector('.quote-attribution');
    if (!quoteText) return;

    if (typingTimeout) clearTimeout(typingTimeout);
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteText.textContent = '';
    if (quoteAttribution) {
        quoteAttribution.textContent = quote.attribution;
        quoteAttribution.style.opacity = '0';
    }

    typingTimeout = setTimeout(() => {
        typeText(quoteText, quote.text, 0, () => {
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
        typingTimeout = setTimeout(() => typeText(element, text, index + 1, onComplete), 30);
    } else if (onComplete) {
        onComplete();
    }
}

// ========================================
// TIME DISPLAY
// ========================================

function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    ['lock-time', 'home-time', 'oaa-time', 'events-time'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = timeStr;
    });
    const lockDate = document.getElementById('lock-date');
    if (lockDate) lockDate.textContent = dateStr;
}

// ========================================
// SCREEN NAVIGATION
// ========================================

function showScreen(screenId, addToHistory = true) {
    if (addToHistory && state.currentScreen !== screenId) {
        state.navigationHistory.push({
            screen: state.currentScreen,
            oaaView: state.currentOAAView,
            classData: state.currentClass ? { ...state.currentClass } : null
        });
    }

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active');
        state.currentScreen = screenId;
        if (screenId === 'home-screen') triggerQuoteTyping();
    }
}

function goBack() {
    if (state.navigationHistory.length > 0) {
        const prev = state.navigationHistory.pop();
        if (prev.screen === 'oaa-app') {
            showScreen('oaa-app', false);
            if (prev.oaaView === 'oaa-class' && prev.classData) {
                showClassView(prev.classData.year, prev.classData.className, false);
            } else {
                showOAAView(prev.oaaView, false);
            }
        } else {
            showScreen(prev.screen, false);
        }
        return;
    }

    // Fallback
    if (state.currentScreen === 'oaa-app') {
        if (state.currentOAAView === 'oaa-profile') showOAAView('oaa-class', false);
        else if (state.currentOAAView === 'oaa-class') showOAAView('oaa-dashboard', false);
        else showScreen('home-screen', false);
    } else if (state.currentScreen === 'events-app') {
        showScreen('home-screen', false);
    } else if (state.currentScreen === 'home-screen') {
        showScreen('lock-screen', false);
    }
}

// ========================================
// LOCK SCREEN
// ========================================

function initLockScreen() {
    const lockScreen = document.getElementById('lock-screen');
    if (lockScreen) {
        // Support both click and touch for mobile
        lockScreen.addEventListener('click', handleUnlock);
        lockScreen.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleUnlock();
        });
    }
}

function handleUnlock() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        playSound('boot');
    } else {
        playSound('unlock');
    }
    state.navigationHistory = [];
    showScreen('home-screen');
}

// ========================================
// HOME SCREEN
// ========================================

function initHomeScreen() {
    document.querySelectorAll('.app-icon').forEach(icon => {
        icon.addEventListener('mouseenter', () => playSound('hover'));
        icon.addEventListener('click', () => {
            playSound('open');
            const appId = icon.dataset.app;
            openApp(appId);
        });
    });

    const lockBtn = document.getElementById('lock-btn');
    if (lockBtn) {
        lockBtn.addEventListener('mouseenter', () => playSound('hover'));
        lockBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playSound('back');
            state.navigationHistory = [];
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
        btn.addEventListener('mouseenter', () => playSound('hover'));
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (action === 'back') {
                playSound('back');
                goBack();
            } else if (action === 'home') {
                playSound('back');
                state.navigationHistory = [];
                showScreen('home-screen', false);
            }
        });
    });
}

// ========================================
// KEYBOARD NAVIGATION
// ========================================

function initKeyboardNav() {
    document.addEventListener('keydown', (e) => {
        if (state.keysHeld[e.key]) return;
        state.keysHeld[e.key] = true;

        // Enter to unlock
        if (e.key === 'Enter' && state.currentScreen === 'lock-screen') {
            handleUnlock();
            return;
        }

        // ESC to go back
        if (e.key === 'Escape') {
            // Close comparison modal first if open
            const modal = document.querySelector('.comparison-modal.active');
            if (modal) {
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 300);
                playSound('back');
                return;
            }

            const searchInput = document.querySelector('.search-input');
            if (searchInput && document.activeElement === searchInput) {
                searchInput.blur();
                searchInput.value = '';
                filterStudents('');
                playSound('back');
            } else if (state.compareMode) {
                exitCompareMode();
                playSound('back');
            } else {
                playSound('back');
                goBack();
            }
            return;
        }

        // "/" to focus search (uses 'select' sound - same as clicking it)
        if (e.key === '/' && state.currentScreen === 'oaa-app' && state.currentOAAView === 'oaa-dashboard') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-input');
            if (searchInput) {
                searchInput.focus();
                // Sound plays via focus event
            }
            return;
        }

        // Number keys for apps
        if (state.currentScreen === 'home-screen') {
            if (e.key === '1') {
                playSound('open');
                openApp('oaa');
            } else if (e.key === '2') {
                playSound('open');
                openApp('events');
            }
        }

        // C key for compare mode toggle
        if (e.key === 'c' && state.currentScreen === 'oaa-app' &&
            (state.currentOAAView === 'oaa-dashboard' || state.currentOAAView === 'oaa-class')) {
            if (!document.activeElement || document.activeElement.tagName !== 'INPUT') {
                toggleCompareMode();
            }
        }

        // F key for favorites filter
        if (e.key === 'f' && state.currentScreen === 'oaa-app' && state.currentOAAView === 'oaa-dashboard') {
            if (!document.activeElement || document.activeElement.tagName !== 'INPUT') {
                toggleFavoritesFilter();
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        state.keysHeld[e.key] = false;
    });
}

// ========================================
// OAA APP
// ========================================

let studentLookup = {};

function initOAAApp() {
    buildStudentLookup();
    renderClassCards();
    initSearch();
    initSorting();
    initCompareMode();
    initFavoritesFilter();
    updateFavoritesUI();
}

function showOAAView(viewId, addToHistory = true) {
    if (addToHistory && state.currentOAAView !== viewId) {
        state.navigationHistory.push({
            screen: 'oaa-app',
            oaaView: state.currentOAAView,
            classData: state.currentClass ? { ...state.currentClass } : null
        });
    }

    document.querySelectorAll('#oaa-app .app-view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(viewId);
    if (target) {
        target.classList.add('active');
        state.currentOAAView = viewId;
        target.scrollTop = 0;
    }
}

function buildStudentLookup() {
    if (typeof studentData === 'undefined') return;
    studentData.forEach(s => studentLookup[s.id] = s);
}

// ========================================
// SORTING
// ========================================

function initSorting() {
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => playSound('hover'));
        btn.addEventListener('click', () => {
            playSound('select');
            const sortValue = btn.dataset.sort;
            state.currentSort = sortValue;
            updateAllSortButtons(sortValue);

            if (state.currentOAAView === 'oaa-dashboard') {
                renderClassCards();
            } else if (state.currentOAAView === 'oaa-class' && state.currentClass) {
                showClassView(state.currentClass.year, state.currentClass.className, false);
            }
        });
    });
}

function updateAllSortButtons(sortValue) {
    document.querySelectorAll('.sort-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.sort === sortValue);
    });
}

function getSortedStudents(students, sortBy) {
    if (sortBy === 'default') return students;
    return [...students].sort((a, b) => {
        const valueA = sortBy === 'overall' ? calculateOverallValue(a.stats) : (a.stats[sortBy] || 50);
        const valueB = sortBy === 'overall' ? calculateOverallValue(b.stats) : (b.stats[sortBy] || 50);
        return valueB - valueA;
    });
}

function calculateOverallValue(stats) {
    return (stats.academic + stats.intelligence + stats.decision + stats.physical + stats.cooperativeness) / 5;
}

// ========================================
// SEARCH
// ========================================

function initSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;

    searchInput.addEventListener('focus', () => playSound('select'));
    searchInput.addEventListener('input', (e) => {
        playSound('type');
        filterStudents(e.target.value.toLowerCase().trim());
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
        classCards.forEach(card => {
            card.style.display = '';
            card.querySelectorAll('.student-preview').forEach(p => p.style.display = '');
        });
        return;
    }

    classCards.forEach(card => {
        const previews = card.querySelectorAll('.student-preview');
        let hasMatch = false;
        previews.forEach(preview => {
            const name = preview.querySelector('.student-preview-name').textContent.toLowerCase();
            const id = preview.querySelector('.student-preview-id').textContent.toLowerCase();
            const match = name.includes(query) || id.includes(query);
            preview.style.display = match ? '' : 'none';
            if (match) hasMatch = true;
        });
        const classLabel = card.querySelector('.class-label').textContent.toLowerCase();
        if (classLabel.includes(query)) {
            hasMatch = true;
            previews.forEach(p => p.style.display = '');
        }
        card.style.display = hasMatch ? '' : 'none';
    });
}

// ========================================
// CLASS CARDS
// ========================================

function renderClassCards() {
    const container = document.getElementById('first-year-classes');
    if (!container) return;

    container.innerHTML = '';
    let totalStudents = 0;
    let displayedStudents = 0;

    ['A', 'B', 'C', 'D'].forEach(className => {
        let students = getStudentsByClass(1, className);
        totalStudents += students.length;

        // Filter by favorites if enabled
        if (state.showFavoritesOnly) {
            students = students.filter(s => state.favorites.includes(s.id));
        }
        displayedStudents += students.length;

        const card = createClassCard(1, className, getSortedStudents(students, state.currentSort));
        container.appendChild(card);
    });

    const countEl = document.getElementById('first-year-count');
    if (countEl) {
        countEl.textContent = state.showFavoritesOnly
            ? `${displayedStudents} favorites`
            : `${totalStudents} total`;
    }

    // Reattach hover sounds to new elements
    attachHoverSounds(container);
}

function createClassCard(year, className, students) {
    const card = document.createElement('div');
    card.className = `class-card class-${className.toLowerCase()}`;

    const previewStudents = students.slice(0, 3);
    const points = (typeof classPoints !== 'undefined' && classPoints[year]) ? classPoints[year][className] || 0 : 0;
    const rank = getClassRank(year, className);
    const rankSuffix = ['', 'st', 'nd', 'rd'][rank] || 'th';

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
            ${previewStudents.map(s => createStudentPreviewHTML(s)).join('')}
            ${students.length === 0 ? '<div class="empty-class">No students enrolled</div>' : ''}
        </div>
        ${students.length > 3 ? `<div class="view-all-link">View all ${students.length} students</div>` : ''}
    `;

    // Student preview clicks
    card.querySelectorAll('.student-preview').forEach(preview => {
        preview.addEventListener('click', (e) => {
            e.stopPropagation();
            const student = studentLookup[preview.dataset.studentId];
            if (student) {
                if (state.compareMode) {
                    toggleCompareSelection(student);
                } else {
                    playSound('click');
                    state.currentClass = { year: student.year, className: student.class };
                    state.navigationHistory.push({ screen: 'oaa-app', oaaView: 'oaa-dashboard', classData: null });
                    state.navigationHistory.push({ screen: 'oaa-app', oaaView: 'oaa-class', classData: { year: student.year, className: student.class } });
                    showStudentProfile(student, false);
                }
            }
        });
    });

    // Card click
    card.addEventListener('click', () => {
        playSound('click');
        showClassView(year, className);
    });

    return card;
}

function createStudentPreviewHTML(student) {
    const initials = getInitials(student.name);
    const isFavorite = state.favorites.includes(student.id);
    const isComparing = state.compareList.includes(student.id);

    return `
        <div class="student-preview ${isComparing ? 'comparing' : ''}" data-student-id="${student.id}">
            ${student.image
                ? `<img class="student-avatar" src="${student.image}" alt="${student.name}">`
                : `<div class="student-avatar-placeholder">${initials}</div>`}
            <div class="student-preview-info">
                <div class="student-preview-name">${student.name} ${isFavorite ? '<span class="favorite-star">★</span>' : ''}</div>
                <div class="student-preview-id">${student.id}</div>
            </div>
            ${state.compareMode ? `<div class="compare-checkbox ${isComparing ? 'checked' : ''}"></div>` : ''}
        </div>
    `;
}

// ========================================
// CLASS VIEW
// ========================================

function showClassView(year, className, addToHistory = true) {
    state.currentClass = { year, className };
    const students = getSortedStudents(getStudentsByClass(year, className), state.currentSort);

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
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 3rem;">No students enrolled</p>';
    } else {
        students.forEach(student => container.appendChild(createStudentCard(student)));
    }

    showOAAView('oaa-class', addToHistory);
    attachHoverSounds(container);
}

function createStudentCard(student) {
    const card = document.createElement('div');
    const isFavorite = state.favorites.includes(student.id);
    const isComparing = state.compareList.includes(student.id);
    card.className = `student-card ${isComparing ? 'comparing' : ''}`;
    card.dataset.studentId = student.id;

    card.innerHTML = `
        ${state.compareMode ? `<div class="compare-checkbox ${isComparing ? 'checked' : ''}"></div>` : ''}
        ${student.image
            ? `<img class="student-card-avatar" src="${student.image}" alt="${student.name}">`
            : `<div class="student-card-avatar-placeholder">${getInitials(student.name)}</div>`}
        <div class="student-card-info">
            <div class="student-card-name">${student.name} ${isFavorite ? '<span class="favorite-star">★</span>' : ''}</div>
            <div class="student-card-class">${student.year}${getYearSuffix(student.year)} Year - Class ${student.class}</div>
        </div>
        <div class="student-card-rating">
            <span class="rating-grade">${calculateOverallGrade(student.stats)}</span>
            <span class="rating-label">OAA</span>
        </div>
    `;

    card.addEventListener('click', () => {
        if (state.compareMode) {
            toggleCompareSelection(student);
        } else {
            playSound('click');
            showStudentProfile(student);
        }
    });

    return card;
}

// ========================================
// PROFILE VIEW
// ========================================

function showStudentProfile(student, addToHistory = true) {
    state.currentStudent = student;
    const isFavorite = state.favorites.includes(student.id);

    document.getElementById('profile-name').innerHTML = `${student.name} <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-student-id="${student.id}">${isFavorite ? '★' : '☆'}</button>`;
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

    document.getElementById('profile-overall').textContent = calculateOverallGrade(student.stats);

    const statList = document.getElementById('stat-list');
    statList.innerHTML = '';
    const statNames = ['Academic Ability', 'Intelligence', 'Decision Making', 'Physical Ability', 'Cooperativeness'];
    const statKeys = ['academic', 'intelligence', 'decision', 'physical', 'cooperativeness'];

    statKeys.forEach((key, i) => {
        const value = student.stats[key] || 50;
        const row = document.createElement('div');
        row.className = 'stat-row';
        row.innerHTML = `
            <div class="stat-header">
                <span class="stat-label">${statNames[i]}</span>
                <span class="stat-value">${value}/100 <span class="stat-grade">${getGradeFromValue(value)}</span></span>
            </div>
            <div class="stat-bar"><div class="stat-bar-fill" style="width: 0%"></div></div>
        `;
        statList.appendChild(row);
        setTimeout(() => {
            const fill = row.querySelector('.stat-bar-fill');
            fill.style.width = value + '%';
            fill.classList.add(value < 40 ? 'stat-low' : value < 70 ? 'stat-medium' : 'stat-high');
        }, 100 + i * 80);
    });

    // Favorite button handler
    const favBtn = document.querySelector('.favorite-btn');
    if (favBtn) {
        favBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(student.id);
        });
    }

    showOAAView('oaa-profile', addToHistory);
}

// ========================================
// FAVORITES SYSTEM
// ========================================

function toggleFavorite(studentId) {
    const index = state.favorites.indexOf(studentId);
    if (index > -1) {
        state.favorites.splice(index, 1);
        playSound('back');
    } else {
        state.favorites.push(studentId);
        playSound('success');
    }
    localStorage.setItem('cote-favorites', JSON.stringify(state.favorites));
    updateFavoritesUI();
}

function updateFavoritesUI() {
    // Update favorite button in profile if visible
    const favBtn = document.querySelector('.favorite-btn');
    if (favBtn && state.currentStudent) {
        const isFav = state.favorites.includes(state.currentStudent.id);
        favBtn.textContent = isFav ? '★' : '☆';
        favBtn.classList.toggle('active', isFav);
    }

    // Update filter button state
    const filterBtn = document.getElementById('favorites-filter');
    if (filterBtn) {
        filterBtn.classList.toggle('active', state.showFavoritesOnly);
    }
}

function initFavoritesFilter() {
    const filterBtn = document.getElementById('favorites-filter');
    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            toggleFavoritesFilter();
        });
        filterBtn.addEventListener('mouseenter', () => playSound('hover'));
    }
}

function toggleFavoritesFilter() {
    state.showFavoritesOnly = !state.showFavoritesOnly;
    playSound('select');
    updateFavoritesUI();
    renderClassCards();
}

// ========================================
// COMPARE MODE
// ========================================

function initCompareMode() {
    // Compare bar at bottom
    const compareBar = document.createElement('div');
    compareBar.id = 'compare-bar';
    compareBar.className = 'compare-bar';
    compareBar.innerHTML = `
        <div class="compare-bar-content">
            <span class="compare-count">0 selected</span>
            <button class="compare-btn" disabled>Compare</button>
            <button class="compare-cancel">Cancel</button>
        </div>
    `;
    document.body.appendChild(compareBar);

    compareBar.querySelector('.compare-btn').addEventListener('click', showComparison);
    compareBar.querySelector('.compare-cancel').addEventListener('click', exitCompareMode);
}

function toggleCompareMode() {
    state.compareMode = !state.compareMode;
    playSound('select');
    document.body.classList.toggle('compare-mode', state.compareMode);

    if (!state.compareMode) {
        state.compareList = [];
    }

    updateCompareUI();

    // Re-render current view
    if (state.currentOAAView === 'oaa-dashboard') {
        renderClassCards();
    } else if (state.currentOAAView === 'oaa-class' && state.currentClass) {
        showClassView(state.currentClass.year, state.currentClass.className, false);
    }
}

function exitCompareMode() {
    state.compareMode = false;
    state.compareList = [];
    document.body.classList.remove('compare-mode');
    updateCompareUI();

    if (state.currentOAAView === 'oaa-dashboard') {
        renderClassCards();
    } else if (state.currentOAAView === 'oaa-class' && state.currentClass) {
        showClassView(state.currentClass.year, state.currentClass.className, false);
    }
}

function toggleCompareSelection(student) {
    const index = state.compareList.indexOf(student.id);
    if (index > -1) {
        state.compareList.splice(index, 1);
        playSound('back');
    } else if (state.compareList.length < 4) {
        state.compareList.push(student.id);
        playSound('select');
    } else {
        playSound('error');
        return;
    }
    updateCompareUI();

    // Update visual state
    document.querySelectorAll(`[data-student-id="${student.id}"]`).forEach(el => {
        el.classList.toggle('comparing', state.compareList.includes(student.id));
        const checkbox = el.querySelector('.compare-checkbox');
        if (checkbox) checkbox.classList.toggle('checked', state.compareList.includes(student.id));
    });
}

function updateCompareUI() {
    const bar = document.getElementById('compare-bar');
    if (!bar) return;

    const count = state.compareList.length;
    bar.querySelector('.compare-count').textContent = `${count} selected`;
    bar.querySelector('.compare-btn').disabled = count < 2;
    bar.classList.toggle('active', state.compareMode);
}

function showComparison() {
    if (state.compareList.length < 2) return;

    playSound('open');
    const students = state.compareList.map(id => studentLookup[id]).filter(Boolean);

    // Create comparison modal
    const modal = document.createElement('div');
    modal.className = 'comparison-modal';
    modal.innerHTML = `
        <div class="comparison-content">
            <div class="comparison-header">
                <h2>Student Comparison</h2>
                <button class="comparison-close">×</button>
            </div>
            <div class="comparison-grid" style="grid-template-columns: repeat(${students.length}, 1fr)">
                ${students.map(s => `
                    <div class="comparison-student">
                        <div class="comparison-avatar">
                            ${s.image ? `<img src="${s.image}" alt="${s.name}">` : `<div class="avatar-placeholder">${getInitials(s.name)}</div>`}
                        </div>
                        <h3>${s.name}</h3>
                        <p>Class ${s.class}</p>
                        <div class="comparison-grade">${calculateOverallGrade(s.stats)}</div>
                    </div>
                `).join('')}
            </div>
            <div class="comparison-stats">
                ${['Academic Ability', 'Intelligence', 'Decision Making', 'Physical Ability', 'Cooperativeness'].map((name, i) => {
                    const key = ['academic', 'intelligence', 'decision', 'physical', 'cooperativeness'][i];
                    return `
                        <div class="comparison-stat-row">
                            <span class="stat-name">${name}</span>
                            <div class="stat-values">
                                ${students.map(s => `<span class="stat-val ${getBestClass(students, key, s)}">${s.stats[key]}</span>`).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);

    modal.querySelector('.comparison-close').addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
        playSound('back');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
            playSound('back');
        }
    });
}

function getBestClass(students, key, current) {
    const max = Math.max(...students.map(s => s.stats[key]));
    return current.stats[key] === max ? 'best' : '';
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
    const sorted = Object.entries(classPoints[year]).sort((a, b) => b[1] - a[1]);
    return sorted.findIndex(([c]) => c === className) + 1;
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getYearSuffix(year) {
    return ['', 'st', 'nd', 'rd'][year] || 'th';
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
    const avg = calculateOverallValue(stats);
    return getGradeFromValue(avg);
}

function attachHoverSounds(container) {
    const selectors = '.student-preview, .student-card, .view-all-link, .class-card';
    container.querySelectorAll(selectors).forEach(el => {
        el.addEventListener('mouseenter', () => playSound('hover'));
    });
}
