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
    showFavoritesOnly: false,
    // Database state
    dbConnected: false,
    dbClassPoints: null,
    dbStudents: null,
    pointDeltas: {}
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
            gainNode.gain.setValueAtTime(0.08, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            oscillator.start(now);
            oscillator.stop(now + 0.08);
            break;

        case 'select':
            // Quick high blip
            oscillator.frequency.setValueAtTime(1000, now);
            gainNode.gain.setValueAtTime(0.06, now);
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
            gainNode.gain.setValueAtTime(0.06, now);
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

function startContinuousGlitch(element) {
    if (!element || element.glitchInterval) return;
    triggerGlitch(element);
    element.glitchInterval = setInterval(() => triggerGlitch(element), 200);
}

function stopContinuousGlitch(element) {
    if (!element || !element.glitchInterval) return;
    clearInterval(element.glitchInterval);
    element.glitchInterval = null;
    element.classList.remove('glitching');
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
    // Skip hover-based glitch on touch devices
    if (window.matchMedia('(hover: none)').matches) return;

    // Continuous glitch on hover for app icons
    document.querySelectorAll('.app-icon-image').forEach(icon => {
        icon.addEventListener('mouseenter', () => startContinuousGlitch(icon));
        icon.addEventListener('mouseleave', () => stopContinuousGlitch(icon));
    });

    // Continuous glitch on hover for COTE title
    const lockTitle = document.querySelector('.lock-title');
    if (lockTitle) {
        lockTitle.addEventListener('mouseenter', () => startContinuousGlitch(lockTitle));
        lockTitle.addEventListener('mouseleave', () => stopContinuousGlitch(lockTitle));
    }

    // Continuous glitch on hover for home brand title
    const homeBrandTitle = document.querySelector('.home-brand-title');
    if (homeBrandTitle) {
        homeBrandTitle.addEventListener('mouseenter', () => startContinuousGlitch(homeBrandTitle));
        homeBrandTitle.addEventListener('mouseleave', () => stopContinuousGlitch(homeBrandTitle));
    }

    // Continuous glitch on hover for all app header brand titles
    document.querySelectorAll('.header-brand .brand-title').forEach(title => {
        title.addEventListener('mouseenter', () => startContinuousGlitch(title));
        title.addEventListener('mouseleave', () => stopContinuousGlitch(title));
    });
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Global UX: blur selects after change and buttons after click so they
    // don't stay in a focused/highlighted state after the user picks something.
    document.addEventListener('change', (e) => {
        if (e.target && e.target.tagName === 'SELECT') e.target.blur();
    });
    document.addEventListener('click', (e) => {
        const btn = e.target && e.target.closest && e.target.closest('button');
        // Don't blur form-submit-style buttons mid-action; only blur after the
        // browser dispatches the synthetic click for selection-style controls.
        if (btn && !btn.matches('input')) btn.blur();
    });

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
    initDatabase();
    createDbStatusIndicator();
});

// ========================================
// CLICKABLE KEYBOARD HINTS
// ========================================

function initCollapsibleSections() {
    document.querySelectorAll('.events-section.collapsible .events-section-header').forEach(header => {
        const section = header.closest('.events-section');
        const content = section.querySelector('.collapsible-content');
        const arrow = header.querySelector('.collapse-icon');

        // Set initial arrow state (collapsed = pointing right)
        if (content.classList.contains('collapsed') && arrow) {
            arrow.textContent = '▶';
        }

        header.addEventListener('click', () => {
            if (content.classList.contains('collapsed')) {
                content.classList.remove('collapsed');
                section.classList.add('expanded');
                if (arrow) arrow.textContent = '▼';
                playSound('open');
            } else {
                content.classList.add('collapsed');
                section.classList.remove('expanded');
                if (arrow) arrow.textContent = '▶';
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
                    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
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
                case '3':
                    if (state.currentScreen === 'home-screen') {
                        playSound('open');
                        openApp('creator');
                    }
                    break;
                case '4':
                    if (state.currentScreen === 'home-screen') {
                        playSound('open');
                        openApp('admin');
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

    ['lock-time', 'home-time', 'oaa-time', 'events-time', 'admin-time', 'creator-time'].forEach(id => {
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

        // Crossfade music tracks
        if (screenId === 'admin-app') {
            switchTrack('admin');
        } else if (musicState.activeTrack === 'admin') {
            switchTrack('main');
        }
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
        startMusic();
    } else {
        playSound('unlock');
    }
    state.navigationHistory = [];
    showScreen('home-screen');
}

// ========================================
// BACKGROUND MUSIC
// ========================================

const musicState = {
    maxVolume: 0.15,
    crossfadeDuration: 1200,  // track-to-track crossfade
    toggleDuration: 400,       // mute/unmute fade
    startupDuration: 700,      // initial fade-in
    activeTrack: 'main',
    muted: false,
    initialized: false
};

function fadeMusic(audio, from, to, duration, onDone) {
    const start = performance.now();
    function step(now) {
        const t = Math.min((now - start) / duration, 1);
        const v = from + (to - from) * t;
        audio.volume = Math.max(0, Math.min(1, v));
        if (t < 1) {
            requestAnimationFrame(step);
        } else {
            audio.volume = Math.max(0, Math.min(1, to));
            if (onDone) onDone();
        }
    }
    requestAnimationFrame(step);
}

function getTrack(name) {
    return document.getElementById(name === 'admin' ? 'bg-music-admin' : 'bg-music');
}

// Robust play helper — handles unloaded audio by waiting for it
function playWhenReady(audio, onPlaying) {
    const attempt = () => {
        const p = audio.play();
        if (p && typeof p.then === 'function') {
            p.then(onPlaying).catch(() => {
                const onReady = () => {
                    audio.removeEventListener('canplaythrough', onReady);
                    audio.removeEventListener('loadeddata', onReady);
                    audio.play().then(onPlaying).catch(() => {});
                };
                audio.addEventListener('canplaythrough', onReady);
                audio.addEventListener('loadeddata', onReady);
                if (audio.readyState === 0) audio.load();
            });
        }
    };
    attempt();
}

// Start both tracks playing — admin silent, main at target volume
function startBothTracks(targetVolume, duration) {
    const main = getTrack('main');
    const admin = getTrack('admin');
    main.volume = 0;
    admin.volume = 0;
    playWhenReady(main, () => fadeMusic(main, 0, targetVolume, duration));
    playWhenReady(admin, () => {});  // play silently
}

function switchTrack(trackName) {
    if (musicState.activeTrack === trackName) return;

    const oldAudio = getTrack(musicState.activeTrack);
    const newAudio = getTrack(trackName);
    musicState.activeTrack = trackName;

    if (musicState.muted) return;  // both already paused; unmute will play correct one

    fadeMusic(oldAudio, oldAudio.volume, 0, musicState.crossfadeDuration);
    fadeMusic(newAudio, newAudio.volume, musicState.maxVolume, musicState.crossfadeDuration);
}

function startMusic() {
    if (musicState.initialized) return;
    musicState.initialized = true;

    const toggle = document.getElementById('music-toggle');
    if (!toggle) return;

    toggle.classList.add('visible');

    // Pre-load both tracks
    getTrack('main').load();
    getTrack('admin').load();

    // Start both tracks after short delay (avoid competing with boot sound)
    setTimeout(() => {
        if (!musicState.muted) {
            startBothTracks(musicState.maxVolume, musicState.startupDuration);
        }
    }, 500);

    toggle.addEventListener('click', () => {
        playSound('select');
        toggle.blur();
        const main = getTrack('main');
        const admin = getTrack('admin');
        const activeAudio = getTrack(musicState.activeTrack);
        const inactiveAudio = activeAudio === main ? admin : main;

        if (musicState.muted) {
            // Unmute — resume both, fade up active
            musicState.muted = false;
            toggle.classList.remove('muted');
            inactiveAudio.volume = 0;
            playWhenReady(inactiveAudio, () => {});
            playWhenReady(activeAudio, () => {
                fadeMusic(activeAudio, 0, musicState.maxVolume, musicState.toggleDuration);
            });
        } else {
            // Mute — fade down active, pause both at end
            musicState.muted = true;
            toggle.classList.add('muted');
            fadeMusic(activeAudio, activeAudio.volume, 0, musicState.toggleDuration, () => {
                main.pause();
                admin.pause();
            });
        }
    });
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
    } else if (appId === 'admin') {
        showScreen('admin-app');
        initAdminApp();
    } else if (appId === 'creator') {
        showScreen('creator-app');
        initCreatorApp();
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

            // Close compare mode first if active
            if (state.compareMode) {
                exitCompareMode();
            }

            // Close comparison modal if open
            const modal = document.querySelector('.comparison-modal.active');
            if (modal) {
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 300);
            }

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

        // Enter confirms top-most active admin modal (logout / delete student)
        if (e.key === 'Enter') {
            const deleteStudentModal = document.getElementById('admin-delete-student-modal');
            if (deleteStudentModal && deleteStudentModal.classList.contains('active')) {
                e.preventDefault();
                confirmDeleteStudent();
                return;
            }
            const logoutModal = document.getElementById('admin-logout-modal');
            if (logoutModal && logoutModal.classList.contains('active')) {
                e.preventDefault();
                confirmAdminLogout();
                return;
            }
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

            // Top-most modals first (they layer on top of others)
            const deleteStudentModal = document.getElementById('admin-delete-student-modal');
            if (deleteStudentModal && deleteStudentModal.classList.contains('active')) {
                cancelDeleteStudent();
                return;
            }

            const logoutModal = document.getElementById('admin-logout-modal');
            if (logoutModal && logoutModal.classList.contains('active')) {
                cancelAdminLogout();
                return;
            }

            const confirmModal = document.getElementById('admin-confirm-modal');
            if (confirmModal && confirmModal.classList.contains('active')) {
                hideSaveConfirmModal();
                playSound('back');
                return;
            }

            const studentModal = document.getElementById('admin-student-modal');
            if (studentModal && studentModal.classList.contains('active')) {
                closeStudentModal();
                playSound('back');
                return;
            }

            const searchInput = document.querySelector('.search-input');
            if (searchInput && document.activeElement === searchInput) {
                searchInput.blur();
                searchInput.value = '';
                filterStudents('');
                playSound('back');
            } else if (state.compareMode && state.currentOAAView === 'oaa-dashboard') {
                exitCompareMode();
                playSound('back');
            } else if (state.compareMode) {
                playSound('back');
                goBack();
            } else if (state.currentScreen === 'creator-app') {
                // In Creator app: close quiz modal if open, otherwise go to previous step
                const quizModal = document.getElementById('trait-quiz-modal');
                if (quizModal && quizModal.classList.contains('active')) {
                    quizModal.classList.remove('active');
                    playSound('back');
                } else {
                    const steps = ['info', 'bio', 'abilities', 'export'];
                    const currentIndex = steps.indexOf(creatorState.currentStep);
                    if (currentIndex > 0) {
                        // Go to previous step
                        goToCreatorStep(steps[currentIndex - 1], true);
                        playSound('back');
                    } else {
                        // On first step, exit to home
                        playSound('back');
                        goBack();
                    }
                }
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
            } else if (e.key === '3') {
                playSound('open');
                openApp('admin');
            } else if (e.key === '4') {
                playSound('open');
                openApp('creator');
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

    // Update keyboard hints based on current view
    const searchHint = document.querySelector('.oaa-hint-search');
    const favHint = document.querySelector('.oaa-hint-favorites');
    const compareHint = document.querySelector('.oaa-hint-compare');
    if (searchHint) searchHint.style.display = viewId === 'oaa-dashboard' ? '' : 'none';
    if (favHint) favHint.style.display = viewId === 'oaa-dashboard' ? '' : 'none';
    if (compareHint) compareHint.style.display = (viewId === 'oaa-dashboard' || viewId === 'oaa-class') ? '' : 'none';
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
            e.stopPropagation();
            searchInput.value = '';
            filterStudents('');
            searchInput.blur();
            playSound('back');
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
    const yearConfigs = [
        { year: 1, containerId: 'first-year-classes', countId: 'first-year-count' },
        { year: 2, containerId: 'second-year-classes', countId: 'second-year-count' },
        { year: 3, containerId: 'third-year-classes', countId: 'third-year-count' }
    ];

    yearConfigs.forEach(({ year, containerId, countId }) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        let totalStudents = 0;
        let displayedStudents = 0;

        // Sort classes by rank (1st to 4th based on points)
        const classes = ['A', 'B', 'C', 'D'].sort((a, b) => {
            const rankA = getClassRank(year, a);
            const rankB = getClassRank(year, b);
            return rankA - rankB;
        });

        classes.forEach(className => {
            let students = getStudentsByClass(year, className);
            totalStudents += students.length;

            // Filter by favorites if enabled
            if (state.showFavoritesOnly) {
                students = students.filter(s => state.favorites.includes(s.id));
            }
            displayedStudents += students.length;

            const card = createClassCard(year, className, getSortedStudents(students, state.currentSort));
            container.appendChild(card);
        });

        const countEl = document.getElementById(countId);
        if (countEl) {
            countEl.textContent = state.showFavoritesOnly
                ? `${displayedStudents} favorites`
                : `${totalStudents} total`;
        }

        // Reattach hover sounds to new elements
        attachHoverSounds(container);
    });
}

function createClassCard(year, className, students) {
    const card = document.createElement('div');
    card.className = `class-card class-${className.toLowerCase()}`;

    const previewStudents = students.slice(0, 3);
    const activePoints = getActiveClassPoints();
    const points = (activePoints && activePoints[year]) ? activePoints[year][className] || 0 : 0;
    const delta = getPointDelta(year, className);
    const rank = getClassRank(year, className);
    const rankSuffix = ['', 'st', 'nd', 'rd'][rank] || 'th';

    // Build delta indicator HTML (arrow indicates direction, no +/- needed)
    let deltaHTML = '';
    if (delta !== 0) {
        const deltaClass = delta > 0 ? 'positive' : 'negative';
        deltaHTML = `<span class="points-delta ${deltaClass}"><span class="delta-arrow"></span>${Math.abs(delta)}</span>`;
    }

    card.innerHTML = `
        <div class="class-card-header">
            <div class="class-badge">
                <div class="class-letter">${className}</div>
                <span class="class-label">Class ${className}</span>
            </div>
            <div class="class-card-stats">
                <div class="class-rank">${rank}${rankSuffix}</div>
                <span class="class-points">${points.toLocaleString()} CP${deltaHTML}</span>
            </div>
        </div>
        <div class="class-card-students">
            ${previewStudents.map(s => createStudentPreviewHTML(s)).join('')}
            ${students.length === 0 ? `<div class="empty-class">${state.showFavoritesOnly ? 'No favorites in this class' : 'No students enrolled'}</div>` : ''}
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
                    // Only push current view to history - back from profile goes directly to dashboard
                    state.navigationHistory.push({ screen: 'oaa-app', oaaView: 'oaa-dashboard', classData: null });
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

    // Create mini stat bars HTML
    const statKeys = ['academic', 'intelligence', 'decision', 'physical', 'cooperativeness'];
    const miniStatsHTML = statKeys.map(stat => {
        const value = student.stats[stat] || 50;
        const height = Math.round((value / 100) * 12);
        return `<div class="stat-mini-bar stat-${stat}" style="--bar-height: ${height}px;"></div>`;
    }).join('');

    return `
        <div class="student-preview ${isComparing ? 'comparing' : ''}" data-student-id="${student.id}">
            ${student.image
                ? `<span class="student-avatar-frame"><img class="student-avatar" src="${student.image}" alt="${student.name}" style="${getImageFrameStyle(student)}"></span>`
                : `<div class="student-avatar-placeholder">${initials}</div>`}
            <div class="student-preview-info">
                <div class="student-preview-name">${student.name} ${isFavorite ? '<span class="favorite-star">★</span>' : ''}</div>
                <div class="student-preview-id">${student.id}</div>
            </div>
            <div class="student-preview-stats">${miniStatsHTML}</div>
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
        const message = state.showFavoritesOnly ? 'No favorites in this class' : 'No students enrolled';
        container.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 3rem;">${message}</p>`;
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

    // Create mini stat bars HTML
    const statKeys = ['academic', 'intelligence', 'decision', 'physical', 'cooperativeness'];
    const miniStatsHTML = statKeys.map(stat => {
        const value = student.stats[stat] || 50;
        const height = Math.round((value / 100) * 16);
        return `<div class="stat-mini-bar stat-${stat}" style="--bar-height: ${height}px;"></div>`;
    }).join('');

    card.innerHTML = `
        ${state.compareMode ? `<div class="compare-checkbox ${isComparing ? 'checked' : ''}"></div>` : ''}
        ${student.image
            ? `<span class="student-card-avatar-frame"><img class="student-card-avatar" src="${student.image}" alt="${student.name}" style="${getImageFrameStyle(student)}"></span>`
            : `<div class="student-card-avatar-placeholder">${getInitials(student.name)}</div>`}
        <div class="student-card-info">
            <div class="student-card-name">${student.name} ${isFavorite ? '<span class="favorite-star">★</span>' : ''}</div>
            <div class="student-card-class">${student.year}${getYearSuffix(student.year)} Year - Class ${student.class}</div>
            <div class="student-card-stats-preview">${miniStatsHTML}</div>
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
    const profileImageContainer = document.querySelector('.profile-image-container');

    // Add class-specific glow to profile image
    if (profileImageContainer) {
        profileImageContainer.classList.remove('class-a-glow', 'class-b-glow', 'class-c-glow', 'class-d-glow');
        profileImageContainer.classList.add(`class-${student.class.toLowerCase()}-glow`);
    }

    const profileImageFrame = document.getElementById('profile-image-frame');
    if (student.image) {
        profileImage.src = student.image;
        const fr = student.imageFrame;
        if (fr) {
            profileImage.style.transform = `translate(${fr.x || 0}%, ${fr.y || 0}%) scale(${fr.zoom || 1})`;
            profileImage.style.transformOrigin = 'center';
        } else {
            profileImage.style.transform = '';
        }
        if (profileImageFrame) profileImageFrame.style.display = 'block';
        if (profilePlaceholder) profilePlaceholder.style.display = 'none';
    } else {
        if (profileImageFrame) profileImageFrame.style.display = 'none';
        if (profilePlaceholder) profilePlaceholder.style.display = 'flex';
    }

    document.getElementById('profile-overall').textContent = calculateOverallGrade(student.stats);

    const statList = document.getElementById('stat-list');
    statList.innerHTML = '';
    const statNames = ['Academic Ability', 'Intelligence', 'Decision Making', 'Physical Ability', 'Cooperativeness'];
    const statKeys = ['academic', 'intelligence', 'decision', 'physical', 'cooperativeness'];

    statKeys.forEach((key, i) => {
        const value = student.stats[key] || 50;
        const trait = student.traits?.[key];
        let traitHTML = '';
        if (trait) {
            const isPositive = traitDefinitions[key]?.positive?.includes(trait);
            const icon = isPositive
                ? '<span class="trait-icon positive">▲</span>'
                : '<span class="trait-icon negative">▼</span>';
            traitHTML = `<span class="trait-badge ${isPositive ? 'positive' : 'negative'}">${icon}<span class="trait-name">${trait}</span></span>`;
        }
        const row = document.createElement('div');
        row.className = 'stat-row';
        row.innerHTML = `
            <div class="stat-header">
                <span class="stat-label">${statNames[i]}</span>
                <span class="stat-value">${value}/100 <span class="stat-grade">${getGradeFromValue(value)}</span></span>
            </div>
            <div class="stat-bar"><div class="stat-bar-fill stat-${key}" style="width: 0%"></div></div>
            ${traitHTML}
        `;
        statList.appendChild(row);
        setTimeout(() => {
            const fill = row.querySelector('.stat-bar-fill');
            fill.style.width = value + '%';
            fill.classList.add(`stat-${key}`);
        }, 100 + i * 80);
    });

    // Download button handler
    const dlBtn = document.getElementById('profile-download-btn');
    if (dlBtn && !dlBtn.dataset.bound) {
        dlBtn.dataset.bound = '1';
        dlBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playSound('click');
            if (state.currentStudent) exportEnrolledStudent(state.currentStudent);
        });
        dlBtn.addEventListener('mouseenter', () => playSound('hover'));
    }

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
    compareBar.querySelector('.compare-btn').addEventListener('mouseenter', () => playSound('hover'));
    compareBar.querySelector('.compare-cancel').addEventListener('click', () => {
        playSound('back');
        exitCompareMode();
    });
    compareBar.querySelector('.compare-cancel').addEventListener('mouseenter', () => playSound('hover'));
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
        showErrorToast('Maximum 4 students in comparison');
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
                        <div class="comparison-avatar class-${s.class.toLowerCase()}-glow">
                            ${s.image ? `<img src="${s.image}" alt="${s.name}" style="${getImageFrameStyle(s)}">` : `<div class="avatar-placeholder">${getInitials(s.name)}</div>`}
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
                                ${students.map(s => `<span class="stat-val ${getBestClass(students, key, s)} stat-color-${key}">${s.stats[key]}</span>`).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);

    const closeBtn = modal.querySelector('.comparison-close');
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
        playSound('back');
    });
    closeBtn.addEventListener('mouseenter', () => playSound('hover'));

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

function getClassGlowColor(className) {
    const colors = {
        'A': 'rgba(254, 205, 211, 0.5)',
        'B': 'rgba(253, 164, 175, 0.5)',
        'C': 'rgba(225, 29, 72, 0.5)',
        'D': 'rgba(136, 19, 55, 0.5)'
    };
    return colors[className] || 'rgba(77, 201, 230, 0.3)';
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function getAllStudents() {
    // Prefer Firebase students once loaded — even an empty array means
    // "the admin has actively cleared the roster", which we must respect.
    // Only fall back to local studentData if Firebase has never loaded yet.
    if (Array.isArray(state.dbStudents)) return state.dbStudents;
    if (typeof studentData !== 'undefined') return studentData;
    return [];
}

function getStudentsByClass(year, className) {
    return getAllStudents().filter(s => s.year === year && s.class === className && !s.retired);
}

function getClassRank(year, className) {
    const activePoints = getActiveClassPoints();
    if (!activePoints || !activePoints[year]) return 0;
    const sorted = Object.entries(activePoints[year]).sort((a, b) => b[1] - a[1]);
    return sorted.findIndex(([c]) => c === className) + 1;
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// ========================================
// IMAGE FRAMING (zoom + drag-to-pan)
// ========================================
// Stored on student/character as `imageFrame: { zoom, x, y }` where x/y are
// percent offsets applied via CSS transform. Default zoom=1, x=0, y=0 = no transform.

function getImageFrameStyle(obj) {
    const f = obj && obj.imageFrame;
    if (!f) return '';
    const zoom = typeof f.zoom === 'number' ? f.zoom : 1;
    const x = typeof f.x === 'number' ? f.x : 0;
    const y = typeof f.y === 'number' ? f.y : 0;
    if (zoom === 1 && x === 0 && y === 0) return '';
    return `transform: translate(${x}%, ${y}%) scale(${zoom}); transform-origin: center;`;
}

function applyImageFramer(container, zoomInput, frame) {
    if (!container) return;
    const img = container.querySelector('img');
    const f = frame || { zoom: 1, x: 0, y: 0 };
    if (img) {
        img.style.transform = `translate(${f.x || 0}%, ${f.y || 0}%) scale(${f.zoom || 1})`;
        img.style.transformOrigin = 'center';
    }
    if (zoomInput) {
        // Show one decimal so 1 → "1.0" but a typed 2.5 stays "2.5"
        const z = f.zoom || 1;
        zoomInput.value = Number.isInteger(z) ? z.toFixed(1) : String(z);
    }
}

// Toggle the framer controls on or off based on whether there's an image
// in the preview to actually frame.
function setImageFramerEnabled(controlsId, enabled) {
    const controls = document.getElementById(controlsId);
    if (controls) controls.classList.toggle('is-disabled', !enabled);
}

// Pre-render an image into a fixed-size canvas with contain semantics and
// a solid background. Returns a dataURL of the result. Used for the PDF
// export so html2canvas doesn't have to deal with object-fit or flex
// centering — both of which it handles unreliably and were causing
// uploaded images to render off-center / cropped.
function prerenderContainImage(srcUrl, size, bgColor, frame) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const finish = (success) => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            // Background fill so letterbox area looks intentional.
            ctx.fillStyle = bgColor || 'rgba(15,26,46,0.6)';
            ctx.fillRect(0, 0, size, size);
            if (success && img.naturalWidth > 0) {
                const w = img.naturalWidth, h = img.naturalHeight;
                const scale = Math.min(size / w, size / h);
                const dw = w * scale;
                const dh = h * scale;
                // Apply imageFrame (CSS: translate(x%,y%) scale(z) around center).
                // Translate %s are relative to the element size (= `size`),
                // applied after scale per CSS right-to-left transform order.
                const z = (frame && typeof frame.zoom === 'number') ? frame.zoom : 1;
                const fx = (frame && typeof frame.x === 'number') ? frame.x : 0;
                const fy = (frame && typeof frame.y === 'number') ? frame.y : 0;
                ctx.save();
                // Clip to the visible square so zoomed/panned content matches CSS overflow:hidden
                ctx.beginPath();
                ctx.rect(0, 0, size, size);
                ctx.clip();
                ctx.translate(size / 2, size / 2);
                ctx.translate((fx / 100) * size, (fy / 100) * size);
                ctx.scale(z, z);
                ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
                ctx.restore();
            }
            resolve(canvas.toDataURL('image/png'));
        };
        img.onload = () => finish(true);
        img.onerror = () => finish(false);
        img.src = srcUrl;
    });
}


// Idempotent: first call wires listeners, subsequent calls just re-apply state.
// frameRef: getter returning the live frame object to mutate.
function bindImageFramer(container, zoomSlider, resetBtn, frameRef) {
    if (!container) return;
    if (container.dataset.framerBound === '1') {
        applyImageFramer(container, zoomSlider, frameRef());
        return;
    }
    container.dataset.framerBound = '1';

    const apply = () => applyImageFramer(container, zoomSlider, frameRef());

    if (zoomSlider) {
        zoomSlider.addEventListener('input', () => {
            const f = frameRef();
            const v = parseFloat(zoomSlider.value);
            // Guard against empty / NaN while the user is mid-typing
            if (!isNaN(v) && v >= 1) f.zoom = v;
            apply();
        });
    }
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const f = frameRef();
            f.zoom = 1; f.x = 0; f.y = 0;
            apply();
            try { playSound('back'); } catch (e) {}
        });
    }

    let dragging = false;
    let startX = 0, startY = 0, startFX = 0, startFY = 0;
    container.style.cursor = 'grab';

    const onDown = (clientX, clientY, target) => {
        if (!target || target.tagName !== 'IMG') return;
        dragging = true;
        startX = clientX; startY = clientY;
        const f = frameRef();
        startFX = f.x || 0; startFY = f.y || 0;
        container.style.cursor = 'grabbing';
    };
    const onMove = (clientX, clientY) => {
        if (!dragging) return;
        const rect = container.getBoundingClientRect();
        const f = frameRef();
        const z = f.zoom || 1;
        // 1px screen drag = 1px visual movement. Translate % is relative to the
        // image's own (untransformed) box, which equals the container size, so
        // no /zoom needed.
        const dx = ((clientX - startX) / rect.width) * 100;
        const dy = ((clientY - startY) / rect.height) * 100;
        // No clamp — let the user pan freely. They can always Reset.
        f.x = startFX + dx;
        f.y = startFY + dy;
        apply();
    };
    const onUp = () => {
        if (dragging) { dragging = false; container.style.cursor = 'grab'; }
    };

    container.addEventListener('mousedown', (e) => { onDown(e.clientX, e.clientY, e.target); e.preventDefault(); });
    window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onUp);

    container.addEventListener('touchstart', (e) => {
        const t = e.touches[0]; onDown(t.clientX, t.clientY, e.target);
    }, { passive: true });
    container.addEventListener('touchmove', (e) => {
        const t = e.touches[0]; onMove(t.clientX, t.clientY);
        if (dragging) e.preventDefault();
    }, { passive: false });
    container.addEventListener('touchend', onUp);

    apply();
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

// ========================================
// DATABASE INTEGRATION
// ========================================

function initDatabase() {
    // Check if COTEDB module is loaded
    if (typeof COTEDB === 'undefined') {
        console.log('Database module not loaded, using local data');
        updateDbStatus('local');
        return;
    }

    // Add listener for database events
    COTEDB.addListener(handleDatabaseEvent);

    // Initialize database connection
    COTEDB.init().then(success => {
        if (success) {
            console.log('Database connected');
            state.dbConnected = true;
            updateDbStatus('connected');
            loadStudentsFromDB();
        } else {
            console.log('Database not configured, using local data');
            updateDbStatus('local');
        }
    }).catch(err => {
        console.error('Database error:', err);
        updateDbStatus('disconnected');
    });
}

async function loadStudentsFromDB() {
    try {
        const students = await COTEDB.getStudents();
        // Always assign — even an empty array means "Firebase has no students"
        // and we must reflect that, not silently keep the previous list.
        state.dbStudents = Array.isArray(students) ? students : [];
        // Fully rebuild lookup from Firebase only (clear stale local entries
        // so deletions in admin actually disappear from the lookup).
        studentLookup = {};
        state.dbStudents.forEach(s => { studentLookup[s.id] = s; });
        // Always re-render the OAA dashboard, even if not currently visible.
        // initOAAApp runs before Firebase resolves, so the first render uses
        // local fallback data; this ensures the dashboard reflects Firebase
        // as soon as it loads, regardless of which screen the user is on.
        renderClassCards();
        if (state.currentScreen === 'oaa-app' &&
            state.currentOAAView === 'oaa-class' && state.currentClass) {
            showClassView(state.currentClass.year, state.currentClass.className, false);
        }
    } catch (err) {
        console.warn('Could not load students from DB:', err);
    }
}

function handleDatabaseEvent(event, data) {
    switch (event) {
        case 'connection':
            state.dbConnected = data;
            updateDbStatus(data ? 'connected' : 'disconnected');
            break;

        case 'classPoints':
            handleClassPointsUpdate(data.points, data.deltas);
            break;
    }
}

function handleClassPointsUpdate(newPoints, deltas) {
    state.dbClassPoints = newPoints;
    state.pointDeltas = deltas;

    // Re-render class cards to show new points and deltas
    if (state.currentOAAView === 'oaa-dashboard') {
        renderClassCards();
        playSound('success');
    }
}

function getActiveClassPoints() {
    // Use database points if available, otherwise use local
    return state.dbClassPoints || (typeof classPoints !== 'undefined' ? classPoints : null);
}

function getPointDelta(year, className) {
    if (state.pointDeltas && state.pointDeltas[year]) {
        return state.pointDeltas[year][className] || 0;
    }
    return 0;
}

// Database status indicator
function createDbStatusIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'db-status';
    indicator.className = 'db-status local';
    indicator.innerHTML = `
        <div class="db-status-dot"></div>
        <span class="db-status-text">Local Data</span>
    `;
    document.body.appendChild(indicator);
}

function updateDbStatus(status) {
    const indicator = document.getElementById('db-status');
    if (!indicator) return;

    indicator.classList.remove('connected', 'disconnected', 'local');
    indicator.classList.add(status);

    const textEl = indicator.querySelector('.db-status-text');
    if (textEl) {
        switch (status) {
            case 'connected':
                textEl.textContent = 'Live';
                break;
            case 'disconnected':
                textEl.textContent = 'Offline';
                break;
            case 'local':
                textEl.textContent = 'Local Data';
                break;
        }
    }
}


// ========================================
// ADMIN APP
// ========================================

const adminState = {
    loggedIn: false,
    currentUser: null,
    displayName: null,
    initialized: false,
    originalPoints: {}, // Track original values for change detection
    // Student management
    students: [],
    editingStudent: null,
    yearFilter: '',
    classFilter: ''
};

function initAdminApp() {
    if (adminState.initialized) {
        // Already initialized, just refresh view based on login state
        if (adminState.loggedIn) {
            showAdminPanel();
        }
        return;
    }

    adminState.initialized = true;

    // Get DOM elements
    const loginBtn = document.getElementById('admin-login-btn');
    const logoutBtn = document.getElementById('admin-logout-btn');
    const saveBtn = document.getElementById('admin-save-btn');
    const resetBtn = document.getElementById('admin-reset-btn');
    const usernameInput = document.getElementById('admin-username');
    const passwordInput = document.getElementById('admin-password');

    // Login button
    if (loginBtn) {
        loginBtn.addEventListener('click', handleAdminLogin);
        loginBtn.addEventListener('mouseenter', () => playSound('hover'));
    }

    // Enter key on password field
    if (passwordInput) {
        passwordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleAdminLogin();
            }
        });
        passwordInput.addEventListener('focus', () => playSound('select'));
        passwordInput.addEventListener('input', () => playSound('type'));
    }

    // Enter key on username field attempts login — handleAdminLogin's
    // validation will surface the missing-password error and focus the
    // password field for the user.
    if (usernameInput) {
        usernameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleAdminLogin();
            }
        });
        usernameInput.addEventListener('focus', () => playSound('select'));
        usernameInput.addEventListener('input', () => playSound('type'));
    }

    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleAdminLogout);
        logoutBtn.addEventListener('mouseenter', () => playSound('hover'));
    }

    // Save button
    if (saveBtn) {
        saveBtn.addEventListener('click', handleAdminSave);
        saveBtn.addEventListener('mouseenter', () => playSound('hover'));
    }

    // Reset button
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            loadAdminPointsFromDB();
            playSound('back');
        });
        resetBtn.addEventListener('mouseenter', () => playSound('hover'));
    }

    // Add sounds and number formatting to class point inputs
    const adminApp = document.getElementById('admin-app');
    if (adminApp) {
        adminApp.querySelectorAll('.admin-class-input input').forEach(input => {
            input.addEventListener('focus', () => {
                playSound('select');
                // Remove commas on focus for editing
                input.value = input.value.replace(/,/g, '');
            });
            input.addEventListener('blur', () => {
                // Format with commas on blur
                const num = parseInt(input.value.replace(/,/g, '')) || 0;
                input.value = num.toLocaleString();

                // Check if value changed from original
                const inputId = input.id; // format: admin-points-{year}-{class}
                const parts = inputId.split('-');
                const year = parseInt(parts[2]);
                const cls = parts[3];
                const original = adminState.originalPoints[year]?.[cls] ?? 1000;

                input.classList.remove('changed-up', 'changed-down');
                if (num > original) {
                    input.classList.add('changed-up');
                } else if (num < original) {
                    input.classList.add('changed-down');
                }
            });
            input.addEventListener('input', () => playSound('type'));

            // Format initial values
            const num = parseInt(input.value) || 0;
            input.value = num.toLocaleString();
        });
    }

    // Modal event listeners
    const modalConfirm = document.getElementById('admin-modal-confirm');
    const modalCancel = document.getElementById('admin-modal-cancel');
    const modalOverlay = document.getElementById('admin-confirm-modal');

    if (modalConfirm) {
        modalConfirm.addEventListener('click', confirmAdminSave);
        modalConfirm.addEventListener('mouseenter', () => playSound('hover'));
    }

    if (modalCancel) {
        modalCancel.addEventListener('click', () => {
            hideSaveConfirmModal();
            playSound('back');
        });
        modalCancel.addEventListener('mouseenter', () => playSound('hover'));
    }

    // Close modal on overlay click
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                hideSaveConfirmModal();
                playSound('back');
            }
        });
        // Enter key to confirm save
        modalOverlay.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                confirmAdminSave();
            }
        });
    }

    // Logout modal listeners
    const logoutConfirm = document.getElementById('admin-logout-confirm');
    const logoutCancel = document.getElementById('admin-logout-cancel');
    const logoutOverlay = document.getElementById('admin-logout-modal');

    if (logoutConfirm) {
        logoutConfirm.addEventListener('click', confirmAdminLogout);
        logoutConfirm.addEventListener('mouseenter', () => playSound('hover'));
    }

    if (logoutCancel) {
        logoutCancel.addEventListener('click', cancelAdminLogout);
        logoutCancel.addEventListener('mouseenter', () => playSound('hover'));
    }

    if (logoutOverlay) {
        logoutOverlay.addEventListener('click', (e) => {
            if (e.target === logoutOverlay) cancelAdminLogout();
        });
        logoutOverlay.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                confirmAdminLogout();
            }
        });
    }

    // Delete student modal listeners
    const deleteConfirm = document.getElementById('admin-delete-student-confirm');
    const deleteCancel = document.getElementById('admin-delete-student-cancel');
    const deleteOverlay = document.getElementById('admin-delete-student-modal');

    if (deleteConfirm) {
        deleteConfirm.addEventListener('click', confirmDeleteStudent);
        deleteConfirm.addEventListener('mouseenter', () => playSound('hover'));
    }

    if (deleteCancel) {
        deleteCancel.addEventListener('click', cancelDeleteStudent);
        deleteCancel.addEventListener('mouseenter', () => playSound('hover'));
    }

    if (deleteOverlay) {
        deleteOverlay.addEventListener('click', (e) => {
            if (e.target === deleteOverlay) cancelDeleteStudent();
        });
        deleteOverlay.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                confirmDeleteStudent();
            }
        });
    }

    // Student management initialization
    initStudentManagement();
}

async function handleAdminLogin() {
    const usernameInput = document.getElementById('admin-username');
    const passwordInput = document.getElementById('admin-password');
    const loginBtn = document.getElementById('admin-login-btn');

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username) {
        showErrorToast('Enter your username');
        usernameInput.focus();
        playSound('error');
        return;
    }
    if (!password) {
        showErrorToast('Enter your password');
        passwordInput.focus();
        playSound('error');
        return;
    }

    // Disable button while checking
    loginBtn.disabled = true;
    loginBtn.textContent = 'Verifying...';
    playSound('select');

    // Minimum delay to prevent flash (feels more intentional)
    const minDelay = new Promise(resolve => setTimeout(resolve, 800));

    try {
        // Check credentials against Firebase (runs in parallel with delay)
        const [result] = await Promise.all([
            COTEDB.verifyAdmin(username, password),
            minDelay
        ]);

        if (result.success) {
            adminState.loggedIn = true;
            adminState.currentUser = username;
            adminState.displayName = result.displayName;

            // Clear inputs
            usernameInput.value = '';
            passwordInput.value = '';

            playSound('success');
            showAdminPanel();
        } else {
            showErrorToast('Invalid credentials');
            loginBtn.disabled = false;
            loginBtn.textContent = 'Log In';
            passwordInput.value = '';
            passwordInput.focus();
            playSound('error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showErrorToast('Connection error. Try again.');
        loginBtn.disabled = false;
        loginBtn.textContent = 'Log In';
        playSound('error');
    }
}

function handleAdminLogout() {
    const modal = document.getElementById('admin-logout-modal');
    if (!modal) return;
    modal.classList.add('active');
    playSound('select');
    requestAnimationFrame(() => {
        document.getElementById('admin-logout-confirm')?.focus();
    });
}

function confirmAdminLogout() {
    const modal = document.getElementById('admin-logout-modal');
    if (modal) modal.classList.remove('active');

    adminState.loggedIn = false;
    adminState.currentUser = null;
    adminState.displayName = null;

    playSound('back');
    showAdminLogin();
}

function cancelAdminLogout() {
    const modal = document.getElementById('admin-logout-modal');
    if (modal) modal.classList.remove('active');
    playSound('back');
}

function showAdminLogin() {
    const loginView = document.getElementById('admin-login-view');
    const panelView = document.getElementById('admin-panel-view');
    const loginBtn = document.getElementById('admin-login-btn');

    if (panelView) panelView.style.display = 'none';
    if (loginView) {
        loginView.style.display = 'block';
        // Re-trigger animation
        const container = loginView.querySelector('.admin-login-container');
        if (container) {
            container.style.animation = 'none';
            container.offsetHeight; // Trigger reflow
            container.style.animation = '';
        }
    }
    // Reset login button state
    if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Log In';
    }
}

function showAdminPanel(animate = true) {
    const loginView = document.getElementById('admin-login-view');
    const panelView = document.getElementById('admin-panel-view');
    const userName = document.getElementById('admin-user-name');

    const transitioningFromLogin = animate && loginView && loginView.style.display !== 'none';

    const swap = () => {
        if (loginView) {
            loginView.style.display = 'none';
            loginView.classList.remove('fading-out');
        }
        if (panelView) panelView.style.display = 'block';
        if (userName) userName.textContent = adminState.displayName || adminState.currentUser;

        loadAdminPointsFromDB();
        loadAdminChangelog();
        loadAdminStudents();
    };

    if (transitioningFromLogin) {
        loginView.classList.add('fading-out');
        setTimeout(swap, 350);
    } else {
        swap();
    }
}

function loadAdminPointsFromDB() {
    const points = getActiveClassPoints();
    if (!points) return;

    // Store original values for change detection
    adminState.originalPoints = {};

    for (let year = 1; year <= 3; year++) {
        adminState.originalPoints[year] = {};
        ['A', 'B', 'C', 'D'].forEach(cls => {
            const input = document.getElementById(`admin-points-${year}-${cls}`);
            if (input && points[year]) {
                const value = points[year][cls] ?? 1000;
                input.value = value.toLocaleString();
                input.classList.remove('changed-up', 'changed-down');
                adminState.originalPoints[year][cls] = value;
            }
        });
    }
}

function getAdminPointsFromInputs() {
    const points = {};
    for (let year = 1; year <= 3; year++) {
        points[year] = {};
        ['A', 'B', 'C', 'D'].forEach(cls => {
            const input = document.getElementById(`admin-points-${year}-${cls}`);
            // Remove commas before parsing
            points[year][cls] = parseInt(input.value.replace(/,/g, '')) || 0;
        });
    }
    return points;
}

// Store pending changes for confirmation
let pendingChanges = null;
let pendingNewPoints = null;

function handleAdminSave() {
    const newPoints = getAdminPointsFromInputs();
    const oldPoints = getActiveClassPoints();

    // Build list of changes for logging
    const changes = [];
    for (let year = 1; year <= 3; year++) {
        ['A', 'B', 'C', 'D'].forEach(cls => {
            const oldVal = oldPoints?.[year]?.[cls] || 0;
            const newVal = newPoints[year][cls];
            if (oldVal !== newVal) {
                const diff = newVal - oldVal;
                const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
                changes.push({ text: `Year ${year} Class ${cls}: ${oldVal} → ${newVal} (${diffStr})`, diff });
            }
        });
    }

    if (changes.length === 0) {
        showErrorToast('No changes to save');
        return;
    }

    // Store for confirmation
    pendingChanges = changes;
    pendingNewPoints = newPoints;

    // Show confirmation modal
    showSaveConfirmModal(changes);
}

function showSaveConfirmModal(changes) {
    const modal = document.getElementById('admin-confirm-modal');
    const changesContainer = document.getElementById('admin-modal-changes');

    // Populate changes list with colors
    changesContainer.innerHTML = changes.map(c => {
        const colorClass = c.diff > 0 ? 'positive' : 'negative';
        return `<div class="admin-modal-change ${colorClass}">${c.text}</div>`;
    }).join('');

    modal.classList.add('active');
    playSound('select');

    // Focus confirm button
    document.getElementById('admin-modal-confirm').focus();
}

function hideSaveConfirmModal() {
    const modal = document.getElementById('admin-confirm-modal');
    modal.classList.remove('active');
    pendingChanges = null;
    pendingNewPoints = null;
}

async function confirmAdminSave() {
    if (!pendingChanges || !pendingNewPoints) return;

    // Save values before hiding modal (which clears them)
    const changes = pendingChanges;
    const newPoints = pendingNewPoints;

    const saveBtn = document.getElementById('admin-save-btn');

    // Hide modal
    hideSaveConfirmModal();

    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    saveBtn.classList.add('saving');
    playSound('select');

    // Minimum delay for visual feedback
    const minDelay = new Promise(resolve => setTimeout(resolve, 600));

    // Convert changes to string format for logging
    const changeStrings = changes.map(c => c.text);

    // Check if database is initialized
    if (!COTEDB.isInitialized()) {
        showErrorToast('Database not connected');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
        saveBtn.classList.remove('saving');
        return;
    }

    // Timeout wrapper to prevent hanging forever
    const withTimeout = (promise, ms) => {
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Save timed out. Check your connection.')), ms)
        );
        return Promise.race([promise, timeout]);
    };

    try {
        // Save to Firebase (runs in parallel with delay, with 10s timeout)
        const [success] = await Promise.all([
            withTimeout(COTEDB.setClassPointsWithLog(newPoints, adminState.displayName || adminState.currentUser, changeStrings), 10000),
            minDelay
        ]);

        if (success) {
            showSuccessToast(`Saved ${changes.length} change(s)`);

            // Update original points so changed styling clears
            for (let year = 1; year <= 3; year++) {
                ['A', 'B', 'C', 'D'].forEach(cls => {
                    adminState.originalPoints[year][cls] = newPoints[year][cls];
                    const input = document.getElementById(`admin-points-${year}-${cls}`);
                    if (input) input.classList.remove('changed-up', 'changed-down');
                });
            }

            // Refresh changelog
            loadAdminChangelog();
        } else {
            showErrorToast('Failed to save. Try again.');
        }
    } catch (error) {
        console.error('Save error:', error);
        showErrorToast(error.message || 'Unknown error');
    } finally {
        // Always reset button state
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
        saveBtn.classList.remove('saving');
    }
}

async function loadAdminChangelog() {
    const container = document.getElementById('admin-changelog');
    if (!container) return;

    try {
        const logs = await COTEDB.getChangelog(10);

        if (!logs || logs.length === 0) {
            container.innerHTML = '<div class="admin-changelog-empty">No changes recorded</div>';
            return;
        }

        container.innerHTML = logs.map(log => {
            const date = new Date(log.timestamp);
            const timeStr = date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Colorize each change based on +/-
            const colorizedChanges = log.changes.map(change => {
                if (change.includes('(+')) {
                    return `<span class="changelog-positive">${change}</span>`;
                } else if (change.includes('(-')) {
                    return `<span class="changelog-negative">${change}</span>`;
                }
                return change;
            }).join(', ');

            return `
                <div class="admin-changelog-item">
                    <div class="admin-changelog-info">
                        <div class="admin-changelog-action">${colorizedChanges}</div>
                        <div class="admin-changelog-user">${log.user}</div>
                    </div>
                    <div class="admin-changelog-time">${timeStr}</div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading changelog:', error);
        container.innerHTML = '<div class="admin-changelog-empty">Error loading changes</div>';
    }
}

// ========================================
// STUDENT MANAGEMENT
// ========================================

function initStudentManagement() {
    // Add student button
    const addBtn = document.getElementById('admin-add-student-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            openStudentModal(null);
            playSound('open');
        });
        addBtn.addEventListener('mouseenter', () => playSound('hover'));
    }

    // Filters
    const yearFilter = document.getElementById('admin-student-year-filter');
    const classFilter = document.getElementById('admin-student-class-filter');

    if (yearFilter) {
        yearFilter.addEventListener('change', () => {
            adminState.yearFilter = yearFilter.value;
            renderAdminStudentList();
            playSound('select');
        });
    }

    if (classFilter) {
        classFilter.addEventListener('change', () => {
            adminState.classFilter = classFilter.value;
            renderAdminStudentList();
            playSound('select');
        });
    }

    // Image URL preview
    const imageInput = document.getElementById('admin-student-image');
    if (imageInput) {
        imageInput.addEventListener('input', (e) => {
            updateAdminImagePreview(e.target.value);
            playSound('type');
        });
        imageInput.addEventListener('focus', () => playSound('select'));
    }

    // Modal buttons
    const modalClose = document.getElementById('admin-student-modal-close');
    const modalCancel = document.getElementById('admin-student-cancel');
    const modalSave = document.getElementById('admin-student-save');
    const modalDelete = document.getElementById('admin-student-delete');
    const modalOverlay = document.getElementById('admin-student-modal');

    if (modalClose) {
        modalClose.addEventListener('click', () => {
            closeStudentModal();
            playSound('back');
        });
    }

    if (modalCancel) {
        modalCancel.addEventListener('click', () => {
            closeStudentModal();
            playSound('back');
        });
        modalCancel.addEventListener('mouseenter', () => playSound('hover'));
    }

    if (modalSave) {
        modalSave.addEventListener('click', saveStudent);
        modalSave.addEventListener('mouseenter', () => playSound('hover'));
    }

    // Enter key to save in student modal
    const studentModal = document.getElementById('admin-student-modal');
    if (studentModal) {
        studentModal.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                // Don't trigger save if a confirmation modal is on top
                const deleteModal = document.getElementById('admin-delete-student-modal');
                if (deleteModal && deleteModal.classList.contains('active')) return;
                e.preventDefault();
                saveStudent();
            }
        });
    }

    if (modalDelete) {
        modalDelete.addEventListener('click', deleteCurrentStudent);
        modalDelete.addEventListener('mouseenter', () => playSound('hover'));
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeStudentModal();
                playSound('back');
            }
        });
    }
}

async function loadAdminStudents() {
    try {
        adminState.students = await COTEDB.getStudents();
        // Note: no auto-seeding from local studentData. Deletions must persist.
        // Keep the OAA-side cache in sync so add/edit/delete from admin
        // shows up in the OAA app without a full page reload.
        state.dbStudents = adminState.students;
        studentLookup = {};
        state.dbStudents.forEach(s => { studentLookup[s.id] = s; });
    } catch (error) {
        console.warn('Using local student data:', error);
        adminState.students = typeof studentData !== 'undefined' ? [...studentData] : [];
    }

    renderAdminStudentList();
}

function renderAdminStudentList() {
    const container = document.getElementById('admin-student-list');
    if (!container) return;

    // Filter students
    let filtered = adminState.students;

    if (adminState.yearFilter) {
        filtered = filtered.filter(s => s.year === parseInt(adminState.yearFilter));
    }

    if (adminState.classFilter) {
        filtered = filtered.filter(s => s.class === adminState.classFilter);
    }

    // Sort by name
    filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    if (filtered.length === 0) {
        container.innerHTML = '<div class="admin-student-empty">No students found</div>';
        return;
    }

    container.innerHTML = filtered.map(student => {
        const initials = getInitials(student.name || 'Unknown');
        const yearSuffix = ['', 'st', 'nd', 'rd'][student.year] || 'th';
        const overallGrade = calculateOverallGrade(student.stats || {});
        const retiredClass = student.retired ? ' retired' : '';
        const retireTitle = student.retired ? 'Reinstate student' : 'Retire student';

        return `
            <div class="admin-student-item${retiredClass}" data-student-key="${student._firebaseKey || student.id}">
                ${student.image
                    ? `<span class="admin-student-avatar-frame"><img class="admin-student-avatar" src="${student.image}" alt="${student.name}" style="${getImageFrameStyle(student)}"></span>`
                    : `<div class="admin-student-avatar-placeholder">${initials}</div>`
                }
                <div class="admin-student-info">
                    <div class="admin-student-name">${student.name || 'Unknown'}</div>
                    <div class="admin-student-meta">${student.year}${yearSuffix} Year - Class ${student.class || '?'} · ${student.id || 'No ID'}</div>
                </div>
                <div class="admin-student-grade">${overallGrade}</div>
                <button class="admin-student-download" data-download-key="${student._firebaseKey || student.id}" title="Download student card" aria-label="Download student card">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </button>
                <button class="admin-student-retire" data-retire-key="${student._firebaseKey || student.id}" title="${retireTitle}" aria-label="${retireTitle}">
                    ${student.retired
                        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
                        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
                    }
                </button>
            </div>
        `;
    }).join('');

    // Download button
    container.querySelectorAll('.admin-student-download').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const key = btn.dataset.downloadKey;
            const student = adminState.students.find(s => (s._firebaseKey || s.id) === key);
            if (student) {
                playSound('click');
                exportEnrolledStudent(student);
            }
        });
        btn.addEventListener('mouseenter', () => playSound('hover'));
    });

    // Click on item (excluding retire/download button) opens edit modal
    container.querySelectorAll('.admin-student-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('.admin-student-retire')) return;
            if (e.target.closest('.admin-student-download')) return;
            const key = item.dataset.studentKey;
            const student = adminState.students.find(s => (s._firebaseKey || s.id) === key);
            if (student) {
                openStudentModal(student);
                playSound('click');
            }
        });
        item.addEventListener('mouseenter', () => playSound('hover'));
    });

    // Retire toggle
    container.querySelectorAll('.admin-student-retire').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const key = btn.dataset.retireKey;
            const student = adminState.students.find(s => (s._firebaseKey || s.id) === key);
            if (!student || !student._firebaseKey) {
                showErrorToast('Cannot retire this student');
                return;
            }
            const newRetired = !student.retired;
            try {
                const success = await COTEDB.updateStudent(student._firebaseKey, { retired: newRetired });
                if (success) {
                    student.retired = newRetired;
                    showSuccessToast(newRetired ? 'Student retired' : 'Student reinstated');
                    renderAdminStudentList();
                    // Refresh OAA data so the change reflects there
                    await loadStudentsFromDB();
                }
            } catch (err) {
                console.error('Retire toggle failed:', err);
                showErrorToast('Failed to update');
            }
        });
        btn.addEventListener('mouseenter', () => playSound('hover'));
    });
}

function openStudentModal(student) {
    const modal = document.getElementById('admin-student-modal');
    const title = document.getElementById('admin-student-modal-title');
    const deleteBtn = document.getElementById('admin-student-delete');

    adminState.editingStudent = student;

    // Set title
    title.textContent = student ? 'Edit Student' : 'Add Student';

    // Show/hide delete button
    deleteBtn.style.display = student ? 'block' : 'none';

    // Fill form
    document.getElementById('admin-student-name').value = student?.name || '';
    document.getElementById('admin-student-year').value = student?.year || 1;
    document.getElementById('admin-student-class').value = student?.class || 'D';
    document.getElementById('admin-student-image').value = student?.image || '';
    // Initialize framing state for this edit (clone so we don't mutate the loaded record)
    adminState.editingImageFrame = student?.imageFrame
        ? { zoom: student.imageFrame.zoom || 1, x: student.imageFrame.x || 0, y: student.imageFrame.y || 0 }
        : { zoom: 1, x: 0, y: 0 };
    updateAdminImagePreview(student?.image || '');
    // Bind framer (idempotent — first call wires listeners, subsequent calls re-apply state)
    bindImageFramer(
        document.getElementById('admin-student-image-preview'),
        document.getElementById('admin-image-zoom'),
        document.getElementById('admin-image-reset'),
        () => adminState.editingImageFrame
    );
    document.getElementById('admin-student-academic').value = student?.stats?.academic || 50;
    document.getElementById('admin-student-intelligence').value = student?.stats?.intelligence || 50;
    document.getElementById('admin-student-decision').value = student?.stats?.decision || 50;
    document.getElementById('admin-student-physical').value = student?.stats?.physical || 50;
    document.getElementById('admin-student-cooperativeness').value = student?.stats?.cooperativeness || 50;

    // Populate + set trait dropdowns (build options from traitDefinitions)
    Object.keys(traitDefinitions).forEach(category => {
        const select = document.getElementById(`admin-student-trait-${category}`);
        if (!select) return;
        const def = traitDefinitions[category];
        select.innerHTML =
            `<option value="">No Trait</option>` +
            `<optgroup label="Positive">` +
            def.positive.map(t => `<option value="${t}">▲ ${t}</option>`).join('') +
            `</optgroup>` +
            `<optgroup label="Negative">` +
            def.negative.map(t => `<option value="${t}">▼ ${t}</option>`).join('') +
            `</optgroup>`;
        select.value = student?.traits?.[category] || '';
    });

    // Show modal
    modal.classList.add('active');
}

function closeStudentModal() {
    const modal = document.getElementById('admin-student-modal');
    modal.classList.remove('active');
    adminState.editingStudent = null;
}

function updateAdminImagePreview(url) {
    const preview = document.getElementById('admin-student-image-preview');
    if (!preview) return;

    if (url && url.trim()) {
        preview.innerHTML = `<img src="${url}" alt="Preview" onerror="this.parentElement.innerHTML='<svg viewBox=\\'0 0 64 64\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1.5\\'><circle cx=\\'32\\' cy=\\'24\\' r=\\'12\\'/><path d=\\'M12 56c0-11 9-20 20-20s20 9 20 20\\'/></svg>'">`;
        // Re-apply current framing to the freshly inserted img
        applyImageFramer(preview, document.getElementById('admin-image-zoom'), adminState.editingImageFrame);
        setImageFramerEnabled('admin-image-framer-controls', true);
    } else {
        preview.innerHTML = `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="32" cy="24" r="12"/><path d="M12 56c0-11 9-20 20-20s20 9 20 20"/></svg>`;
        setImageFramerEnabled('admin-image-framer-controls', false);
    }
}

async function saveStudent() {
    const name = document.getElementById('admin-student-name').value.trim();
    const year = parseInt(document.getElementById('admin-student-year').value);
    const studentClass = document.getElementById('admin-student-class').value;
    const image = document.getElementById('admin-student-image').value.trim();

    if (!name) {
        showErrorToast('Enter a student name');
        document.getElementById('admin-student-name')?.focus();
        playSound('error');
        return;
    }

    const saveBtn = document.getElementById('admin-student-save');
    if (saveBtn.disabled) return; // Prevent double-click

    // Show loading state
    saveBtn.disabled = true;
    saveBtn.classList.add('saving');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saving...';

    // Minimum delay so the loading state doesn't flash
    const minDelay = new Promise(resolve => setTimeout(resolve, 600));

    // Collect traits (only include keys with a selected trait)
    const traits = {};
    Object.keys(traitDefinitions).forEach(category => {
        const val = document.getElementById(`admin-student-trait-${category}`)?.value || '';
        if (val) traits[category] = val;
    });

    const studentData = {
        name: name,
        year: year,
        class: studentClass,
        image: image,
        imageFrame: adminState.editingImageFrame || { zoom: 1, x: 0, y: 0 },
        stats: {
            academic: parseInt(document.getElementById('admin-student-academic').value) || 50,
            intelligence: parseInt(document.getElementById('admin-student-intelligence').value) || 50,
            decision: parseInt(document.getElementById('admin-student-decision').value) || 50,
            physical: parseInt(document.getElementById('admin-student-physical').value) || 50,
            cooperativeness: parseInt(document.getElementById('admin-student-cooperativeness').value) || 50
        },
        traits: traits
    };

    // Clamp stats to 0-100
    Object.keys(studentData.stats).forEach(key => {
        studentData.stats[key] = Math.max(0, Math.min(100, studentData.stats[key]));
    });

    try {
        if (adminState.editingStudent) {
            // Update existing student
            const key = adminState.editingStudent._firebaseKey;
            if (key) {
                const [success] = await Promise.all([COTEDB.updateStudent(key, studentData), minDelay]);
                if (success) {
                    playSound('success');
                    closeStudentModal();
                    await loadAdminStudents();
                    // Refresh OAA view if visible
                    renderClassCards();
                } else {
                    playSound('error');
                }
            }
        } else {
            // Add new student
            const [result] = await Promise.all([COTEDB.addStudent(studentData), minDelay]);
            if (result.success) {
                playSound('success');
                closeStudentModal();
                await loadAdminStudents();
                renderClassCards();
            } else {
                playSound('error');
            }
        }
    } catch (error) {
        console.error('Error saving student:', error);
        playSound('error');
    } finally {
        // Reset loading state
        saveBtn.disabled = false;
        saveBtn.classList.remove('saving');
        saveBtn.textContent = originalText;
    }
}

function deleteCurrentStudent() {
    if (!adminState.editingStudent) return;
    if (!adminState.editingStudent._firebaseKey) {
        showErrorToast('Cannot delete this student');
        return;
    }

    const modal = document.getElementById('admin-delete-student-modal');
    const text = document.getElementById('admin-delete-student-text');
    if (text) text.textContent = `Are you sure you want to delete ${adminState.editingStudent.name}? This cannot be undone.`;
    if (modal) modal.classList.add('active');
    playSound('select');
    // Defer focus until visibility transition starts
    requestAnimationFrame(() => {
        document.getElementById('admin-delete-student-confirm')?.focus();
    });
}

async function confirmDeleteStudent() {
    const modal = document.getElementById('admin-delete-student-modal');
    if (modal) modal.classList.remove('active');

    if (!adminState.editingStudent) return;
    const key = adminState.editingStudent._firebaseKey;
    if (!key) return;

    const deleteBtn = document.getElementById('admin-student-delete');
    deleteBtn.disabled = true;
    const originalText = deleteBtn.textContent;
    deleteBtn.textContent = 'Deleting...';

    // Minimum delay so the loading state doesn't flash
    const minDelay = new Promise(resolve => setTimeout(resolve, 600));

    try {
        const [success] = await Promise.all([COTEDB.deleteStudent(key), minDelay]);
        if (success) {
            showSuccessToast('Student deleted');
            closeStudentModal();
            await loadAdminStudents();
            renderClassCards();
        } else {
            showErrorToast('Failed to delete');
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        showErrorToast(error.message || 'Failed to delete');
    } finally {
        deleteBtn.disabled = false;
        deleteBtn.textContent = originalText;
    }
}

function cancelDeleteStudent() {
    const modal = document.getElementById('admin-delete-student-modal');
    if (modal) modal.classList.remove('active');
    playSound('back');
}

// ========================================
// CREATOR APP
// ========================================

const creatorState = {
    initialized: false,
    currentStep: 'info',
    character: {
        name: '',
        year: 1,
        class: null,
        image: '',
        imageFrame: { zoom: 1, x: 0, y: 0 },
        stats: {
            academic: 50,
            intelligence: 50,
            decision: 50,
            physical: 50,
            cooperativeness: 50
        },
        traits: {},
        bio: '',
        personality: ''
    },
    quizState: {
        category: null,
        questionIndex: 0,
        scores: { positive: 0, negative: 0 },
        positiveType: 0,
        negativeType: 0
    }
};

// Trait definitions
const traitDefinitions = {
    academic: {
        positive: ['Scholar', 'Prodigy'],
        negative: ['Slacker', 'Scatterbrained'],
        descriptions: {
            'Scholar': 'Dedicated to learning, excels through hard work',
            'Prodigy': 'Natural academic talent, effortless high performance',
            'Slacker': 'Avoids academic effort, consistently unprepared',
            'Scatterbrained': 'Can\'t focus, jumps between interests'
        }
    },
    intelligence: {
        positive: ['Genius', 'Perceptive'],
        negative: ['Oblivious', 'Trusting'],
        descriptions: {
            'Genius': 'Exceptional problem-solving, complex reasoning',
            'Perceptive': 'Notices details, reads between the lines',
            'Oblivious': 'Misses obvious information, poor awareness',
            'Trusting': 'Believes in people, vulnerable to deception'
        }
    },
    decision: {
        positive: ['Tactician', 'Decisive'],
        negative: ['Impulsive', 'Cautious'],
        descriptions: {
            'Tactician': 'Plans ahead, outmaneuvers opponents',
            'Decisive': 'Quick confident choices, fully commits',
            'Impulsive': 'Acts on emotion, doesn\'t think ahead',
            'Cautious': 'Hesitates, struggles to commit under pressure'
        }
    },
    physical: {
        positive: ['Athlete', 'Combatant'],
        negative: ['Frail', 'Sluggish'],
        descriptions: {
            'Athlete': 'Peak condition, excels in sports/physical tasks',
            'Combatant': 'Skilled fighter, dominates confrontations',
            'Frail': 'Weak constitution, struggles physically',
            'Sluggish': 'Slow, avoids physical activity'
        }
    },
    cooperativeness: {
        positive: ['Diplomat', 'Loyal'],
        negative: ['Lone Wolf', 'Two-Faced'],
        descriptions: {
            'Diplomat': 'Mediates conflicts, builds alliances',
            'Loyal': 'Trustworthy, dedicated teammate',
            'Lone Wolf': 'Works alone, unreliable in teams',
            'Two-Faced': 'Hides true intentions, adapts persona'
        }
    }
};

// Get stat limits based on trait
// No trait = narrow middle (40-60), traits EXPAND the range
function getStatLimitsFromTrait(category) {
    const trait = creatorState.character.traits[category];

    if (!trait) {
        // No trait = narrow safe range in the middle
        return { min: 40, max: 60 };
    }

    const isPositive = traitDefinitions[category].positive.includes(trait);
    if (isPositive) {
        // Positive trait = expands upward (can reach 100)
        return { min: 40, max: 100 };
    } else {
        // Negative trait = expands downward (can go to 0)
        return { min: 0, max: 60 };
    }
}

// Apply trait limits to a stat slider
function applyTraitLimits(category) {
    const slider = document.getElementById(`creator-stat-${category}`);
    const display = document.getElementById(`creator-stat-${category}-display`);
    const bar = document.getElementById(`creator-stat-${category}-bar`);
    const lockedLeft = document.getElementById(`locked-left-${category}`);
    const lockedRight = document.getElementById(`locked-right-${category}`);
    const card = document.querySelector(`.eval-card[data-category="${category}"]`);
    const discoverBtn = document.querySelector(`.eval-card-discover[data-category="${category}"]`);

    if (!slider) return;

    const limits = getStatLimitsFromTrait(category);
    const trait = creatorState.character.traits[category];
    // Always keep slider 0-100 so thumb position matches the visual bar
    slider.min = 0;
    slider.max = 100;

    // Clamp current value to trait limits
    let currentValue = parseInt(slider.value);
    if (currentValue < limits.min) {
        currentValue = limits.min;
    } else if (currentValue > limits.max) {
        currentValue = limits.max;
    }

    slider.value = currentValue;
    creatorState.character.stats[category] = currentValue;
    if (display) display.textContent = currentValue;

    // Update slider track to show limited range
    slider.style.setProperty('--limit-min', limits.min + '%');
    slider.style.setProperty('--limit-max', limits.max + '%');

    // Fill bar starts from 0 so left locked area shows dimmed color
    if (bar) {
        bar.style.left = '0%';
        bar.style.width = `${currentValue}%`;
    }

    // Update locked area indicators
    if (lockedLeft) {
        // Left locked area: 0% to min%
        lockedLeft.style.width = `${limits.min}%`;
    }
    if (lockedRight) {
        // Right locked area: max% to 100%
        lockedRight.style.width = `${100 - limits.max}%`;
    }

    // Update card state
    if (card) {
        if (trait) {
            card.classList.add('has-trait');
            const isPositive = traitDefinitions[category]?.positive.includes(trait);
            card.classList.remove('trait-positive', 'trait-negative');
            card.classList.add(isPositive ? 'trait-positive' : 'trait-negative');
        } else {
            card.classList.remove('has-trait', 'trait-positive', 'trait-negative');
        }
    }

    // Hide discover button after trait is discovered
    if (discoverBtn) {
        discoverBtn.style.display = trait ? 'none' : '';
    }

    updateCreatorOverallGrade();
}

// Clear a trait and reset to "no trait" limits
function clearTrait(category) {
    creatorState.character.traits[category] = null;

    // Update UI - remove badge
    const resultEl = document.getElementById(`trait-result-${category}`);
    if (resultEl) {
        resultEl.innerHTML = '';
    }

    // Update quiz card - remove completed state (old layout compatibility)
    const card = document.querySelector(`.trait-quiz-card[data-category="${category}"]`);
    if (card) {
        card.classList.remove('completed');
    }

    // Show discover button again
    const discoverBtn = document.querySelector(`.eval-card-discover[data-category="${category}"]`);
    if (discoverBtn) {
        discoverBtn.style.display = '';
    }

    // Apply "no trait" limits (this also resets locked areas and row state)
    applyTraitLimits(category);

    playSound('click');
}

// Quiz questions for each category
const quizQuestions = {
    academic: [
        {
            question: "When you have a difficult exam coming up, you typically...",
            options: [
                { text: "Create a study schedule and stick to it religiously", positive: true, type: 0 },
                { text: "Already know the material from paying attention in class", positive: true, type: 1 },
                { text: "Cram the night before and hope for the best", positive: false, type: 0 },
                { text: "Get distracted by other interests and run out of time", positive: false, type: 1 }
            ]
        },
        {
            question: "Your approach to homework is...",
            options: [
                { text: "Complete it thoroughly, often going beyond requirements", positive: true, type: 0 },
                { text: "Finish quickly because it comes naturally to you", positive: true, type: 1 },
                { text: "Do the minimum required, if at all", positive: false, type: 0 },
                { text: "Start multiple assignments but rarely finish any", positive: false, type: 1 }
            ]
        },
        {
            question: "In group study sessions, you're usually...",
            options: [
                { text: "The one organizing notes and explaining concepts", positive: true, type: 0 },
                { text: "Helping others because you already understand", positive: true, type: 1 },
                { text: "There for the snacks, not really studying", positive: false, type: 0 },
                { text: "Jumping between topics without focus", positive: false, type: 1 }
            ]
        }
    ],
    intelligence: [
        {
            question: "When someone tells you about an opportunity that sounds too good to be true...",
            options: [
                { text: "Analyze every detail and find the hidden catch", positive: true, type: 0 },
                { text: "Notice subtle red flags others would miss", positive: true, type: 1 },
                { text: "Take it at face value without much thought", positive: false, type: 0 },
                { text: "Give them the benefit of the doubt", positive: false, type: 1 }
            ]
        },
        {
            question: "When solving a complex problem, you prefer to...",
            options: [
                { text: "Break it into logical steps and solve systematically", positive: true, type: 0 },
                { text: "Trust your intuition about what feels off", positive: true, type: 1 },
                { text: "Let others figure it out while you wait", positive: false, type: 0 },
                { text: "Believe the first reasonable solution offered", positive: false, type: 1 }
            ]
        },
        {
            question: "In conversations, you tend to...",
            options: [
                { text: "Analyze what people really mean, not just their words", positive: true, type: 0 },
                { text: "Pick up on body language and subtle cues", positive: true, type: 1 },
                { text: "Miss sarcasm or hints others catch easily", positive: false, type: 0 },
                { text: "Take people's words at face value", positive: false, type: 1 }
            ]
        }
    ],
    decision: [
        {
            question: "When faced with an important choice, you usually...",
            options: [
                { text: "Plan out multiple scenarios before deciding", positive: true, type: 0 },
                { text: "Make a quick decision and commit fully", positive: true, type: 1 },
                { text: "Go with your gut without thinking it through", positive: false, type: 0 },
                { text: "Wait as long as possible to avoid deciding", positive: false, type: 1 }
            ]
        },
        {
            question: "Under time pressure, you...",
            options: [
                { text: "Fall back on plans you've already prepared", positive: true, type: 0 },
                { text: "Thrive and make confident calls quickly", positive: true, type: 1 },
                { text: "Act rashly and often regret it later", positive: false, type: 0 },
                { text: "Freeze up and struggle to choose", positive: false, type: 1 }
            ]
        },
        {
            question: "When your plan starts failing, you...",
            options: [
                { text: "Adapt smoothly because you anticipated this", positive: true, type: 0 },
                { text: "Pivot immediately to a new approach", positive: true, type: 1 },
                { text: "Double down emotionally on the original plan", positive: false, type: 0 },
                { text: "Become paralyzed waiting for more information", positive: false, type: 1 }
            ]
        }
    ],
    physical: [
        {
            question: "Your typical morning routine involves...",
            options: [
                { text: "A workout or training session", positive: true, type: 0 },
                { text: "Physical activities or martial arts practice", positive: true, type: 1 },
                { text: "Minimal movement, you tire easily", positive: false, type: 0 },
                { text: "Sleeping in and avoiding exertion", positive: false, type: 1 }
            ]
        },
        {
            question: "In a physical confrontation, you would...",
            options: [
                { text: "Rely on your athletic conditioning and stamina", positive: true, type: 0 },
                { text: "Use combat skills or fighting experience", positive: true, type: 1 },
                { text: "Struggle due to lack of strength or endurance", positive: false, type: 0 },
                { text: "Be too slow to react effectively", positive: false, type: 1 }
            ]
        },
        {
            question: "When your class has sports events, you're...",
            options: [
                { text: "One of the top performers across events", positive: true, type: 0 },
                { text: "The go-to person for competitive matches", positive: true, type: 1 },
                { text: "Sitting out due to poor physical condition", positive: false, type: 0 },
                { text: "Participating reluctantly and tiring quickly", positive: false, type: 1 }
            ]
        }
    ],
    cooperativeness: [
        {
            question: "When your class has internal conflict, you...",
            options: [
                { text: "Work to mediate and find common ground", positive: true, type: 0 },
                { text: "Stand firmly with your allies no matter what", positive: true, type: 1 },
                { text: "Handle things yourself, teams slow you down", positive: false, type: 0 },
                { text: "Adapt your position based on who you're with", positive: false, type: 1 }
            ]
        },
        {
            question: "In team assignments, you prefer to...",
            options: [
                { text: "Ensure everyone's voice is heard and valued", positive: true, type: 0 },
                { text: "Support the team leader reliably", positive: true, type: 1 },
                { text: "Do your part alone and minimize interaction", positive: false, type: 0 },
                { text: "Tell different team members what they want to hear", positive: false, type: 1 }
            ]
        },
        {
            question: "If a classmate needed help that could hurt your own standing, you would...",
            options: [
                { text: "Help them and work to find a win-win solution", positive: true, type: 0 },
                { text: "Help without hesitation, loyalty comes first", positive: true, type: 1 },
                { text: "Focus on yourself, you can't risk your position", positive: false, type: 0 },
                { text: "Appear helpful publicly while protecting yourself privately", positive: false, type: 1 }
            ]
        }
    ]
};

function initCreatorApp() {
    if (creatorState.initialized) return;
    creatorState.initialized = true;

    // Step navigation buttons
    document.querySelectorAll('.creator-btn[data-next]').forEach(btn => {
        btn.addEventListener('click', () => {
            playSound('open');
            goToCreatorStep(btn.dataset.next);
        });
        btn.addEventListener('mouseenter', () => playSound('hover'));
    });

    document.querySelectorAll('.creator-btn[data-prev]').forEach(btn => {
        btn.addEventListener('click', () => {
            playSound('back');
            goToCreatorStep(btn.dataset.prev);
        });
        btn.addEventListener('mouseenter', () => playSound('hover'));
    });

    // Year selection
    document.querySelectorAll('.creator-select-btn[data-year]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.creator-select-btn[data-year]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            creatorState.character.year = parseInt(btn.dataset.year);
            playSound('select');
        });
        btn.addEventListener('mouseenter', () => playSound('hover'));
    });

    // Class selection
    document.querySelectorAll('.creator-select-btn[data-class]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.creator-select-btn[data-class]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            creatorState.character.class = btn.dataset.class;
            playSound('select');
        });
        btn.addEventListener('mouseenter', () => playSound('hover'));
    });

    // Name input
    const nameInput = document.getElementById('creator-name');
    if (nameInput) {
        nameInput.addEventListener('input', (e) => {
            creatorState.character.name = e.target.value;
            playSound('type');
        });
        nameInput.addEventListener('focus', () => playSound('select'));
    }

    // Image URL input with live preview
    const imageInput = document.getElementById('creator-image');
    if (imageInput) {
        imageInput.addEventListener('input', (e) => {
            creatorState.character.image = e.target.value;
            updateAvatarPreview(e.target.value);
            playSound('type');
        });
        imageInput.addEventListener('focus', () => playSound('select'));
    }

    // Image file upload
    const uploadBtn = document.querySelector('.creator-upload-btn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => playSound('select'));
    }
    const imageUpload = document.getElementById('creator-image-upload');
    if (imageUpload) {
        imageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const dataUrl = ev.target.result;
                creatorState.character.image = dataUrl;
                updateAvatarPreview(dataUrl);
                if (imageInput) imageInput.value = '';
                imageInput.placeholder = file.name;
                playSound('success');
            };
            reader.readAsDataURL(file);
        });
    }

    // Image framer (zoom + drag-to-pan) for creator avatar preview
    if (!creatorState.character.imageFrame) {
        creatorState.character.imageFrame = { zoom: 1, x: 0, y: 0 };
    }
    bindImageFramer(
        document.getElementById('creator-avatar-preview'),
        document.getElementById('creator-image-zoom'),
        document.getElementById('creator-image-reset'),
        () => creatorState.character.imageFrame
    );

    // Stats sliders (new eval layout)
    const statKeys = ['academic', 'intelligence', 'decision', 'physical', 'cooperativeness'];
    let lastSliderSoundTime = 0;
    const sliderSoundThrottle = 80; // ms between sounds

    statKeys.forEach(stat => {
        const slider = document.getElementById(`creator-stat-${stat}`);
        const display = document.getElementById(`creator-stat-${stat}-display`);
        const bar = document.getElementById(`creator-stat-${stat}-bar`);

        if (slider) {
            // Always keep slider 0-100 so thumb position matches the visual bar
            const limits = getStatLimitsFromTrait(stat);
            slider.min = 0;
            slider.max = 100;
            slider.style.setProperty('--limit-min', limits.min + '%');
            slider.style.setProperty('--limit-max', limits.max + '%');

            // Update function for this stat
            const updateStat = (value) => {
                creatorState.character.stats[stat] = value;
                if (display) display.textContent = value;
                // Fill bar from 0 so left locked area shows dimmed color
                if (bar) {
                    bar.style.left = '0%';
                    bar.style.width = `${value}%`;
                }
                updateCreatorOverallGrade();
            };

            // Initialize with clamped value
            let initialValue = parseInt(slider.value);
            if (initialValue > limits.max) initialValue = limits.max;
            if (initialValue < limits.min) initialValue = limits.min;
            slider.value = initialValue;
            updateStat(initialValue);

            let lastSliderValue = initialValue;
            slider.addEventListener('input', () => {
                // Clamp to trait limits since slider is always 0-100
                const currentLimits = getStatLimitsFromTrait(stat);
                let val = parseInt(slider.value);
                if (val < currentLimits.min) { val = currentLimits.min; slider.value = val; }
                if (val > currentLimits.max) { val = currentLimits.max; slider.value = val; }
                updateStat(val);
                // Only play sound if value actually changed
                if (val !== lastSliderValue) {
                    const now = Date.now();
                    if (now - lastSliderSoundTime > sliderSoundThrottle) {
                        playSound('type');
                        lastSliderSoundTime = now;
                    }
                    lastSliderValue = val;
                }
            });

            slider.addEventListener('mousedown', () => playSound('select'));
        }
    });

    // Trait quiz buttons (all selectors for compatibility)
    document.querySelectorAll('.trait-quiz-btn, .eval-quiz-btn, .eval-discover-btn, .eval-card-discover, .trait-quiz-card').forEach(btn => {
        btn.addEventListener('click', () => {
            openTraitQuiz(btn.dataset.category);
            playSound('open');
        });
        btn.addEventListener('mouseenter', () => playSound('hover'));
    });

    // Quiz modal close
    const quizClose = document.getElementById('trait-quiz-close');
    if (quizClose) {
        quizClose.addEventListener('click', () => {
            closeTraitQuiz();
            playSound('back');
        });
        quizClose.addEventListener('mouseenter', () => playSound('hover'));
    }

    // Bio input
    const bioInput = document.getElementById('creator-bio');
    if (bioInput) {
        bioInput.addEventListener('input', () => {
            creatorState.character.bio = bioInput.value;
            playSound('type');
        });
        bioInput.addEventListener('focus', () => playSound('select'));
    }

    // Personality input
    const personalityInput = document.getElementById('creator-personality');
    if (personalityInput) {
        personalityInput.addEventListener('input', () => {
            creatorState.character.personality = personalityInput.value;
            playSound('type');
        });
        personalityInput.addEventListener('focus', () => playSound('select'));
    }

    // Export PDF button
    const exportBtn = document.getElementById('export-pdf-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            exportCharacterPDF();
            playSound('success');
        });
        exportBtn.addEventListener('mouseenter', () => playSound('hover'));
    }

    // Reset button
    const resetBtn = document.getElementById('export-reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            resetCreator();
            playSound('back');
        });
        resetBtn.addEventListener('mouseenter', () => playSound('hover'));
    }
}

function updateAvatarPreview(url) {
    const preview = document.getElementById('creator-avatar-preview');
    if (!preview) return;

    if (url && url.trim()) {
        preview.innerHTML = `<img src="${url}" alt="Avatar" onerror="this.parentElement.innerHTML='<svg viewBox=\\'0 0 64 64\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1.5\\'><circle cx=\\'32\\' cy=\\'24\\' r=\\'12\\'/><path d=\\'M12 56c0-11 9-20 20-20s20 9 20 20\\'/></svg>'">`;
        // Re-apply current framing to the freshly inserted img
        applyImageFramer(preview, document.getElementById('creator-image-zoom'), creatorState.character.imageFrame);
        setImageFramerEnabled('creator-image-framer-controls', true);
    } else {
        preview.innerHTML = `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="32" cy="24" r="12"/>
            <path d="M12 56c0-11 9-20 20-20s20 9 20 20"/>
        </svg>`;
        setImageFramerEnabled('creator-image-framer-controls', false);
    }
}

function updateSliderFill(slider) {
    const value = slider.value;
    slider.style.setProperty('--value', `${value}%`);
}

function validateCreatorStep(stepId) {
    const char = creatorState.character;

    if (stepId === 'info') {
        // Required: name, class, and image
        if (!char.name || char.name.trim() === '') {
            showCreatorError('Enter a character name to continue');
            document.getElementById('creator-name')?.focus();
            return false;
        }
        if (!char.class) {
            showCreatorError('Select a class to continue');
            return false;
        }
        if (!char.image || char.image.trim() === '') {
            showCreatorError('Add an image to continue');
            document.getElementById('creator-image')?.focus();
            return false;
        }
    }

    if (stepId === 'bio') {
        // Required: biography and personality
        if (!char.bio || char.bio.trim() === '') {
            showCreatorError('Enter a biography to continue');
            document.getElementById('creator-bio')?.focus();
            return false;
        }
        if (!char.personality || char.personality.trim() === '') {
            showCreatorError('Enter a personality to continue');
            document.getElementById('creator-personality')?.focus();
            return false;
        }
    }

    return true;
}

function showErrorToast(message) {
    let errorEl = document.querySelector('.error-toast');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'error-toast';
        document.body.appendChild(errorEl);
    }

    errorEl.textContent = message;
    errorEl.classList.remove('visible');
    errorEl.offsetHeight; // Force reflow for re-trigger
    errorEl.classList.add('visible');
    playSound('error');

    clearTimeout(errorEl._timeout);
    errorEl._timeout = setTimeout(() => {
        errorEl.classList.remove('visible');
    }, 3000);
}

function showSuccessToast(message) {
    let el = document.querySelector('.success-toast');
    if (!el) {
        el = document.createElement('div');
        el.className = 'success-toast';
        document.body.appendChild(el);
    }

    el.textContent = message;
    el.classList.remove('visible');
    el.offsetHeight;
    el.classList.add('visible');
    playSound('success');

    clearTimeout(el._timeout);
    el._timeout = setTimeout(() => {
        el.classList.remove('visible');
    }, 3000);
}

// Alias for creator-specific calls
function showCreatorError(message) {
    showErrorToast(message);
}

function goToCreatorStep(stepId, skipValidation = false) {
    const steps = ['info', 'bio', 'abilities', 'export'];
    const currentIndex = steps.indexOf(creatorState.currentStep);
    const targetIndex = steps.indexOf(stepId);

    // Validate current step before moving forward
    if (!skipValidation && targetIndex > currentIndex) {
        if (!validateCreatorStep(creatorState.currentStep)) {
            return;
        }
    }

    // Update step visibility
    document.querySelectorAll('.creator-step').forEach(step => step.classList.remove('active'));
    const targetStep = document.getElementById(`creator-step-${stepId}`);
    if (targetStep) {
        targetStep.classList.add('active');
        creatorState.currentStep = stepId;
    }

    // Update progress indicator
    document.querySelectorAll('.progress-step').forEach((step, i) => {
        step.classList.remove('active', 'completed');
        if (i === targetIndex) {
            step.classList.add('active');
        } else if (i < targetIndex) {
            step.classList.add('completed');
        }
    });

    // Update progress lines
    document.querySelectorAll('.progress-line').forEach((line, i) => {
        line.classList.toggle('completed', i < targetIndex);
    });

    // Update preview on export step
    if (stepId === 'export') {
        updateCreatorPreview();
    }

    playSound('select');
}

function updateCreatorOverallGrade() {
    const stats = creatorState.character.stats;
    const avg = (stats.academic + stats.intelligence + stats.decision + stats.physical + stats.cooperativeness) / 5;
    const grade = getGradeFromValue(avg);
    const gradeEl = document.getElementById('creator-overall-grade');
    const avgEl = document.getElementById('creator-overall-avg');
    if (gradeEl) gradeEl.textContent = grade;
    if (avgEl) avgEl.textContent = Math.round(avg);
}

function openTraitQuiz(category) {
    creatorState.quizState = {
        category: category,
        questionIndex: 0,
        scores: { positive: 0, negative: 0 },
        positiveType: 0,
        negativeType: 0,
        finished: false
    };

    const modal = document.getElementById('trait-quiz-modal');
    const title = document.getElementById('trait-quiz-title');
    const iconEl = document.getElementById('trait-quiz-icon');

    const categoryData = {
        academic: {
            name: 'Academic Ability',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
            </svg>`,
            bgClass: 'stat-academic-bg'
        },
        intelligence: {
            name: 'Intelligence',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>`,
            bgClass: 'stat-intelligence-bg'
        },
        decision: {
            name: 'Decision Making',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>`,
            bgClass: 'stat-decision-bg'
        },
        physical: {
            name: 'Physical Ability',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>`,
            bgClass: 'stat-physical-bg'
        },
        cooperativeness: {
            name: 'Cooperativeness',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>`,
            bgClass: 'stat-cooperativeness-bg'
        }
    };

    const data = categoryData[category];
    title.textContent = data.name;

    // Update icon with category-specific styling
    if (iconEl) {
        iconEl.innerHTML = data.icon;
        iconEl.className = 'trait-quiz-category-icon ' + data.bgClass;
    }

    modal.classList.add('active');
    showQuizQuestion();
}

function closeTraitQuiz() {
    const modal = document.getElementById('trait-quiz-modal');
    modal.classList.remove('active');
}

function showQuizQuestion() {
    const { category, questionIndex } = creatorState.quizState;
    const questions = quizQuestions[category];
    const question = questions[questionIndex];

    const progressCurrent = document.getElementById('trait-quiz-current');
    const progressTotal = document.getElementById('trait-quiz-total');
    const progressFill = document.getElementById('trait-quiz-progress-fill');
    const questionEl = document.getElementById('trait-quiz-question');
    const optionsEl = document.getElementById('trait-quiz-options');

    // Update progress display
    if (progressCurrent) progressCurrent.textContent = questionIndex + 1;
    if (progressTotal) progressTotal.textContent = questions.length;
    progressFill.style.width = `${((questionIndex + 1) / questions.length) * 100}%`;

    questionEl.textContent = question.question;

    // Shuffle options
    const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);

    optionsEl.innerHTML = shuffledOptions.map((opt, i) => `
        <button class="trait-quiz-option" data-index="${i}" data-positive="${opt.positive}" data-type="${opt.type}">
            ${opt.text}
        </button>
    `).join('');

    optionsEl.querySelectorAll('.trait-quiz-option').forEach(btn => {
        btn.addEventListener('click', () => selectQuizOption(btn));
        btn.addEventListener('mouseenter', () => playSound('hover'));
    });
}

function selectQuizOption(btn) {
    // Prevent clicks after quiz is finished
    if (creatorState.quizState.finished) return;

    playSound('click');

    const isPositive = btn.dataset.positive === 'true';
    const type = parseInt(btn.dataset.type);

    if (isPositive) {
        creatorState.quizState.scores.positive++;
        creatorState.quizState.positiveType += type;
    } else {
        creatorState.quizState.scores.negative++;
        creatorState.quizState.negativeType += type;
    }

    creatorState.quizState.questionIndex++;

    const { category, questionIndex } = creatorState.quizState;
    const questions = quizQuestions[category];

    if (questionIndex >= questions.length) {
        finishQuiz();
    } else {
        showQuizQuestion();
    }
}

function finishQuiz() {
    const { category, scores, positiveType, negativeType } = creatorState.quizState;
    const traits = traitDefinitions[category];

    let resultTrait;
    if (scores.positive > scores.negative) {
        // More positive answers - pick positive trait based on type
        const typeIndex = positiveType >= 1.5 ? 1 : 0;
        resultTrait = traits.positive[typeIndex];
    } else if (scores.negative > scores.positive) {
        // More negative answers - pick negative trait based on type
        const typeIndex = negativeType >= 1.5 ? 1 : 0;
        resultTrait = traits.negative[typeIndex];
    } else {
        // Tie - use types to decide
        if (positiveType > negativeType) {
            resultTrait = traits.positive[1];
        } else {
            resultTrait = traits.negative[1];
        }
    }

    creatorState.character.traits[category] = resultTrait;
    creatorState.quizState.finished = true;

    // Disable all quiz option buttons immediately
    document.querySelectorAll('.trait-quiz-option').forEach(btn => {
        btn.disabled = true;
        btn.style.pointerEvents = 'none';
    });

    // Determine trait polarity
    const isPositive = traits.positive.includes(resultTrait);

    // Update UI with clickable badge (click to remove)
    const resultEl = document.getElementById(`trait-result-${category}`);
    if (resultEl) {
        const icon = isPositive
            ? '<span class="trait-icon positive">▲</span>'
            : '<span class="trait-icon negative">▼</span>';
        resultEl.innerHTML = `
            <span class="trait-badge clickable ${isPositive ? 'positive' : 'negative'}" onclick="clearTrait('${category}')" title="Click to remove">
                ${icon}<span class="trait-name">${resultTrait}</span>
            </span>`;
    }

    // Update completion counter
    updateTraitCounter();

    // Apply trait limits to the stat slider (this also updates card state)
    applyTraitLimits(category);

    // Brief delay before closing
    setTimeout(() => {
        closeTraitQuiz();
    }, 400);
    playSound('success');
}

function updateTraitCounter() {
    const completedCount = Object.values(creatorState.character.traits).filter(t => t).length;
    const counterEl = document.getElementById('traits-completed');
    if (counterEl) {
        counterEl.textContent = completedCount;
    }
}

function updateCreatorPreview() {
    const preview = document.getElementById('creator-preview');
    const char = creatorState.character;

    const yearSuffix = ['', 'st', 'nd', 'rd'][char.year] || 'th';
    const overallGrade = getGradeFromValue(
        (char.stats.academic + char.stats.intelligence + char.stats.decision +
         char.stats.physical + char.stats.cooperativeness) / 5
    );

    const statNames = ['Academic Ability', 'Intelligence', 'Decision Making', 'Physical Ability', 'Cooperativeness'];
    const statKeys = ['academic', 'intelligence', 'decision', 'physical', 'cooperativeness'];

    const statsHTML = statKeys.map((key, i) => {
        const value = char.stats[key];
        const trait = char.traits[key];
        let traitHTML = '';
        if (trait) {
            const isPositive = traitDefinitions[key].positive.includes(trait);
            const icon = isPositive
                ? '<span class="trait-icon positive">▲</span>'
                : '<span class="trait-icon negative">▼</span>';
            traitHTML = `<span class="trait-badge ${isPositive ? 'positive' : 'negative'}">${icon}<span class="trait-name">${trait}</span></span>`;
        }
        return `
            <div class="stat-row">
                <div class="stat-header">
                    <span class="stat-label">${statNames[i]}</span>
                    <span class="stat-value">${value}/100 <span class="stat-grade">${getGradeFromValue(value)}</span></span>
                </div>
                <div class="stat-bar"><div class="stat-bar-fill stat-${key}" style="width: ${value}%"></div></div>
                ${traitHTML}
            </div>
        `;
    }).join('');

    const classLower = char.class ? char.class.toLowerCase() : '';
    const classGlow = classLower ? `class-${classLower}-glow` : '';

    preview.innerHTML = `
        <div class="profile-header">
            <div class="profile-header-info">
                <h2>${char.name || 'Unnamed Character'}</h2>
                <p>${char.year}${yearSuffix} Year - Class ${char.class || '?'}</p>
            </div>
            <div class="profile-id preview-pending-id">
                <span class="id-label">STATUS</span>
                <span class="id-value pending">PENDING</span>
            </div>
        </div>
        <div class="profile-body">
            <div class="profile-image-container ${classGlow}">
                ${char.image
                    ? `<div class="profile-image-frame"><img class="profile-image" src="${char.image}" alt="${char.name || 'Character'}" style="${getImageFrameStyle(char)}"></div>`
                    : `<div class="profile-image-placeholder">
                        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="32" cy="24" r="12"/>
                            <path d="M12 56c0-11 9-20 20-20s20 9 20 20"/>
                        </svg>
                    </div>`}
                <div class="overall-grade-box">
                    <span class="overall-label">OVERALL RATING</span>
                    <span class="overall-value">${overallGrade}</span>
                </div>
            </div>
            <div class="profile-stats">
                <h3 class="stats-title">Evaluation</h3>
                <div class="stat-list">
                    ${statsHTML}
                </div>
                ${(char.bio || char.personality) ? `
                    <div class="preview-bio-section">
                        ${char.bio ? `
                            <div class="preview-bio-item">
                                <h4>Background</h4>
                                <p>${char.bio}</p>
                            </div>
                        ` : ''}
                        ${char.personality ? `
                            <div class="preview-bio-item">
                                <h4>Personality</h4>
                                <p>${char.personality}</p>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function exportEnrolledStudent(student) {
    return exportStudentCard(student, {
        status: 'ACCEPTED',
        statusColor: '#22c55e',
        statusBg: 'rgba(34,197,94,0.08)',
        statusGlow: 'rgba(34,197,94,0.4)',
        footerText: ''
    });
}

async function exportCharacterPDF() {
    return exportStudentCard(creatorState.character, {
        status: 'PENDING',
        statusColor: '#f59e0b',
        statusBg: 'rgba(245,158,11,0.08)',
        statusGlow: 'rgba(245,158,11,0.4)',
        footerText: `To apply, post this image in the <span style="color:#4dc9e6;font-weight:600;">applications</span> forum on the COTE: ULTIMATUM Discord server.`
    });
}

async function exportStudentCard(subject, opts = {}) {
    const char = subject;
    const status = opts.status || 'PENDING';
    const statusColor = opts.statusColor || '#f59e0b';
    const statusBg = opts.statusBg || 'rgba(245,158,11,0.08)';
    const statusGlow = opts.statusGlow || 'rgba(245,158,11,0.4)';
    const footerText = opts.footerText || '';
    // Pre-render the user's photo into a fixed 480x480 canvas (2x the export
    // box for sharpness on the 2x html2canvas scale) with contain semantics.
    // This sidesteps html2canvas's unreliable handling of flex centering and
    // object-fit on plain <img> elements.
    let prerenderedImage = null;
    if (char.image) {
        try {
            prerenderedImage = await prerenderContainImage(char.image, 480, '#0f1a2e', char.imageFrame);
        } catch (e) {
            console.warn('Image pre-render failed:', e);
        }
    }
    const yearSuffix = ['', 'st', 'nd', 'rd'][char.year] || 'th';
    const overallGrade = getGradeFromValue(
        (char.stats.academic + char.stats.intelligence + char.stats.decision +
         char.stats.physical + char.stats.cooperativeness) / 5
    );

    const classColors = {
        'A': '#fecdd3', 'B': '#fda4af', 'C': '#e11d48', 'D': '#881337'
    };
    const classGlows = {
        'A': 'rgba(254, 205, 211, 0.4)', 'B': 'rgba(253, 164, 175, 0.4)',
        'C': 'rgba(225, 29, 72, 0.4)', 'D': 'rgba(136, 19, 55, 0.4)'
    };
    const classColor = classColors[char.class] || '#9a2e48';
    const classGlow = classGlows[char.class] || 'rgba(154, 46, 72, 0.4)';

    const statMeta = [
        { key: 'academic',        label: 'Academic Ability',  color: '#9b59b6', grad: '#8e44ad, #9b59b6', glow: 'rgba(155,89,182,0.4)' },
        { key: 'intelligence',    label: 'Intelligence',      color: '#f1c40f', grad: '#d4a10f, #f1c40f', glow: 'rgba(241,196,15,0.4)' },
        { key: 'decision',        label: 'Decision Making',   color: '#e67e22', grad: '#d35400, #e67e22', glow: 'rgba(230,126,34,0.4)' },
        { key: 'physical',        label: 'Physical Ability',  color: '#2ecc71', grad: '#27ae60, #2ecc71', glow: 'rgba(46,204,113,0.4)' },
        { key: 'cooperativeness', label: 'Cooperativeness',   color: '#3498db', grad: '#2980b9, #3498db', glow: 'rgba(52,152,219,0.4)' }
    ];

    const statsHTML = statMeta.map(meta => {
        const value = char.stats[meta.key];
        const grade = getGradeFromValue(value);
        const trait = char.traits?.[meta.key];
        let traitHTML = '';
        if (trait) {
            const isPositive = traitDefinitions[meta.key].positive.includes(trait);
            const tColor = isPositive ? '#22c55e' : '#ef4444';
            const tBg = isPositive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)';
            const tBorder = isPositive ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)';
            const arrow = isPositive ? '▲' : '▼';
            traitHTML = `<div style="margin-top:4px;"><span style="display:inline-block;padding:3px 8px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:${tColor};background:${tBg};border:1px solid ${tBorder};border-radius:4px;font-family:'Inter',sans-serif;"><span style="margin-right:4px;">${arrow}</span>${trait}</span></div>`;
        }
        return `
            <div style="margin-bottom:16px;">
                <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">
                    <span style="font-size:13px;color:#94a3b8;font-family:'Inter',sans-serif;">${meta.label}</span>
                    <span style="font-family:'Orbitron',monospace;font-size:13px;color:#64748b;">${value}/100 <span style="color:#4dc9e6;margin-left:6px;text-shadow:0 0 10px rgba(77,201,230,0.3);">${grade}</span></span>
                </div>
                <div style="height:12px;background:rgba(255,255,255,0.05);border-radius:4px;overflow:hidden;position:relative;">
                    <div style="width:${value}%;height:100%;background:linear-gradient(90deg,${meta.grad});border-radius:4px;box-shadow:0 0 15px ${meta.glow};"></div>
                    <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:repeating-linear-gradient(90deg,transparent,transparent 9.8%,rgba(255,255,255,0.06) 9.8%,rgba(255,255,255,0.06) 10%);"></div>
                </div>
                ${traitHTML}
            </div>
        `;
    }).join('');

    const bioHTML = `
        ${char.bio ? `
            <div style="margin-top:24px;">
                <h3 style="font-family:'Orbitron',monospace;color:#fff;margin:0 0 14px;font-size:16px;padding-bottom:10px;border-bottom:2px solid #7a2438;">Background</h3>
                <p style="font-size:13px;line-height:1.7;color:#94a3b8;font-family:'Inter',sans-serif;margin:0;">${char.bio}</p>
            </div>
        ` : ''}
        ${char.personality ? `
            <div style="margin-top:24px;">
                <h3 style="font-family:'Orbitron',monospace;color:#fff;margin:0 0 14px;font-size:16px;padding-bottom:10px;border-bottom:2px solid #7a2438;">Personality</h3>
                <p style="font-size:13px;line-height:1.7;color:#94a3b8;font-family:'Inter',sans-serif;margin:0;">${char.personality}</p>
            </div>
        ` : ''}
    `;

    const appDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const printContent = `
        <div class="export-card" style="width:1000px;font-family:'Inter',sans-serif;background:linear-gradient(135deg,#0f1a2e 0%,rgba(16,29,50,0.95) 100%);color:#fff;position:relative;overflow:hidden;">

            <div style="height:4px;background:linear-gradient(90deg,#7a2438,#4dc9e6,#7a2438);"></div>

            <div style="padding:18px 28px;text-align:center;border-bottom:1px solid rgba(77,201,230,0.1);">
                <div style="font-family:'Orbitron',monospace;font-size:16px;font-weight:700;color:#4dc9e6;letter-spacing:3px;text-shadow:0 0 20px rgba(77,201,230,0.3);">ADVANCED NURTURING HIGH SCHOOL</div>
                <div style="font-size:11px;color:#64748b;letter-spacing:4px;text-transform:uppercase;margin-top:4px;">Student Application File</div>
            </div>

            <div style="padding:24px 28px;display:flex;justify-content:space-between;align-items:flex-start;background:linear-gradient(180deg,rgba(0,245,255,0.03) 0%,transparent 100%);position:relative;">
                <div style="position:absolute;top:12px;right:12px;width:40px;height:40px;border-top:2px solid rgba(0,245,255,0.3);border-right:2px solid rgba(0,245,255,0.3);pointer-events:none;"></div>
                <div style="display:flex;flex-direction:column;justify-content:center;">
                    <div style="font-family:'Orbitron',monospace;font-size:28px;font-weight:700;color:#4dc9e6;text-shadow:0 0 20px rgba(77,201,230,0.3);line-height:1;">${char.name || 'Unnamed'}</div>
                    <div style="font-size:14px;line-height:1;color:#94a3b8;margin-top:8px;">${char.year}${yearSuffix} Year - Class ${char.class || '?'}</div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:11px 18px 9px;border:1px solid ${statusColor};border-radius:8px;background:${statusBg};">
                    <div style="font-size:9px;line-height:1;color:#64748b;letter-spacing:0.1em;margin-bottom:5px;">STATUS</div>
                    <div style="font-family:'Orbitron',monospace;font-size:14px;line-height:1;font-weight:700;color:${statusColor};text-shadow:0 0 10px ${statusGlow};">${status}</div>
                </div>
            </div>

            <div style="display:flex;padding:0 28px 24px;gap:28px;">
                <div style="width:260px;flex-shrink:0;display:flex;flex-direction:column;gap:16px;">
                    <div style="width:240px;height:240px;border-radius:12px;border:2px solid ${classColor};overflow:hidden;background:#0f1a2e;box-shadow:0 0 25px ${classGlow};">
                        ${prerenderedImage
                            ? `<img src="${prerenderedImage}" alt="Student Photo" width="240" height="240" style="display:block;width:240px;height:240px;">`
                            : `<div style="width:240px;height:240px;color:#334155;font-size:12px;text-align:center;font-family:'Inter',sans-serif;display:flex;align-items:center;justify-content:center;">No Photo<br>Provided</div>`
                        }
                    </div>
                    <div style="width:240px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:18px 0 14px;background:linear-gradient(135deg,#dc2626,#ef4444);border-radius:12px;box-shadow:0 0 20px rgba(231,76,60,0.3);">
                        <div style="font-size:10px;line-height:1;text-transform:uppercase;letter-spacing:0.15em;color:rgba(255,255,255,0.7);font-family:'Orbitron',monospace;">Overall Rating</div>
                        <div style="font-size:40px;font-weight:900;color:#fff;font-family:'Orbitron',monospace;line-height:1;margin-top:8px;text-shadow:0 2px 10px rgba(0,0,0,0.3);">${overallGrade}</div>
                    </div>
                </div>

                <div style="flex:1;min-width:0;">
                    <h3 style="font-family:'Orbitron',monospace;color:#fff;margin:0 0 18px;font-size:16px;padding-bottom:10px;border-bottom:2px solid #7a2438;">Evaluation</h3>
                    ${statsHTML}
                    ${bioHTML}
                </div>
            </div>

            ${footerText ? `
            <div style="margin:0 28px 20px;padding:13px 20px 11px;background:rgba(77,201,230,0.04);border:1px solid rgba(77,201,230,0.12);border-radius:8px;display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:11px;line-height:1;color:#64748b;font-family:'Inter',sans-serif;">${footerText}</span>
                <span style="font-size:11px;line-height:1;color:#475569;font-family:'Inter',sans-serif;white-space:nowrap;margin-left:16px;">${appDate}</span>
            </div>
            ` : '<div style="height:20px;"></div>'}
        </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = printContent;
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);

    const exportCard = container.querySelector('.export-card');

    html2canvas(exportCard, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f1a2e',
        logging: false
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `ANHS_${(char.name || 'Character').replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        document.body.removeChild(container);
    }).catch(err => {
        console.error('Export failed:', err);
        document.body.removeChild(container);
    });
}

function resetCreator() {
    // Reset state
    creatorState.character = {
        name: '',
        year: 1,
        class: null,
        image: '',
        imageFrame: { zoom: 1, x: 0, y: 0 },
        stats: {
            academic: 50,
            intelligence: 50,
            decision: 50,
            physical: 50,
            cooperativeness: 50
        },
        traits: {},
        bio: '',
        personality: ''
    };

    // Reset form fields
    document.getElementById('creator-name').value = '';
    document.getElementById('creator-image').value = '';
    document.getElementById('creator-image').placeholder = 'Paste URL';
    document.getElementById('creator-image-upload').value = '';
    document.getElementById('creator-bio').value = '';
    document.getElementById('creator-personality').value = '';

    // Reset year buttons
    document.querySelectorAll('.creator-select-btn[data-year]').forEach((btn, i) => {
        btn.classList.toggle('active', i === 0);
    });

    // Reset class buttons
    document.querySelectorAll('.creator-select-btn[data-class]').forEach(btn => {
        btn.classList.remove('active');
    });

    // Reset stat sliders and displays (including limits)
    const statKeys = ['academic', 'intelligence', 'decision', 'physical', 'cooperativeness'];
    statKeys.forEach(stat => {
        const slider = document.getElementById(`creator-stat-${stat}`);
        const display = document.getElementById(`creator-stat-${stat}-display`);
        const bar = document.getElementById(`creator-stat-${stat}-bar`);
        const lockedLeft = document.getElementById(`locked-left-${stat}`);
        const lockedRight = document.getElementById(`locked-right-${stat}`);
        const card = document.querySelector(`.eval-card[data-category="${stat}"]`);
        const discoverBtn = document.querySelector(`.eval-card-discover[data-category="${stat}"]`);

        if (slider) {
            slider.min = 0;
            slider.max = 100; // Always 0-100, clamped by JS
            slider.value = 50;
            slider.style.setProperty('--limit-min', '40%');
            slider.style.setProperty('--limit-max', '60%');
        }
        if (display) display.textContent = '50';
        // Fill bar from 0 to value (50)
        if (bar) {
            bar.style.left = '0%';
            bar.style.width = '50%';
        }
        // Reset locked areas to default (40% on each side)
        if (lockedLeft) lockedLeft.style.width = '40%';
        if (lockedRight) lockedRight.style.width = '40%';
        // Reset card state
        if (card) card.classList.remove('has-trait', 'trait-positive', 'trait-negative');
        // Show discover button
        if (discoverBtn) discoverBtn.style.display = '';
    });
    updateCreatorOverallGrade();

    // Reset trait results
    Object.keys(traitDefinitions).forEach(cat => {
        const resultEl = document.getElementById(`trait-result-${cat}`);
        if (resultEl) {
            resultEl.innerHTML = '';
        }
        // Reset quiz cards (old layout compatibility)
        const card = document.querySelector(`.trait-quiz-card[data-category="${cat}"]`);
        if (card) {
            card.classList.remove('completed');
        }
    });

    // Reset trait counter
    updateTraitCounter();

    // Go to first step
    goToCreatorStep('info');
}
