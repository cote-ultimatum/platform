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

// Audio context for sound effects
let audioContext = null;

// Ambient noise nodes
let ambientNoiseNode = null;
let ambientGainNode = null;

// Key repeat prevention
let keysHeld = {};

// ========================================
// SOUND EFFECTS
// ========================================

function initAudio() {
    // Initialize on first user interaction (fallback if boot sounds didn't work)
    document.addEventListener('click', () => {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        // Resume audio context if suspended (browser autoplay policy)
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
        // Start ambient if not already playing
        if (!ambientNoiseNode) {
            startAmbientNoise();
        }
    }, { once: true });
}

function playSound(type) {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
        case 'click':
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.05);
            gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.05);
            break;

        case 'unlock':
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.15);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
            break;

        case 'open':
            oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(700, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            break;

        case 'back':
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.08);
            gainNode.gain.setValueAtTime(0.06, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.08);
            break;

        case 'select':
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.03);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.03);
            break;

        case 'boot':
            // Two-tone boot sound
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(450, audioContext.currentTime + 0.15);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime + 0.15);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            break;

        case 'type':
            oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.02, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.02);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.02);
            break;

        case 'hover':
            oscillator.frequency.setValueAtTime(1400, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.015, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.015);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.015);
            break;

        case 'error':
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
            break;

        case 'focus':
            oscillator.frequency.setValueAtTime(900, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1100, audioContext.currentTime + 0.06);
            gainNode.gain.setValueAtTime(0.04, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.06);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.06);
            break;

        case 'bootLetter':
            // Digital blip for each letter
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(800 + Math.random() * 400, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.06, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.08);
            break;

        case 'bootProgress':
            // Subtle tick for progress
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(1500, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.02, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.02);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.02);
            break;

        case 'bootComplete':
            // Rising chord for boot complete
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            break;
    }
}

// ========================================
// AMBIENT NOISE
// ========================================

function startAmbientNoise() {
    if (!audioContext || ambientNoiseNode) return;

    // Create noise using an AudioBufferSourceNode
    const bufferSize = audioContext.sampleRate * 2; // 2 seconds of noise
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate pink-ish noise (filtered white noise)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
    }

    // Create source node
    ambientNoiseNode = audioContext.createBufferSource();
    ambientNoiseNode.buffer = buffer;
    ambientNoiseNode.loop = true;

    // Create filter to make it more subtle (low-pass)
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    // Create gain node for volume control
    ambientGainNode = audioContext.createGain();
    ambientGainNode.gain.setValueAtTime(0, audioContext.currentTime);
    ambientGainNode.gain.linearRampToValueAtTime(0.015, audioContext.currentTime + 2); // Fade in

    // Connect: noise -> filter -> gain -> output
    ambientNoiseNode.connect(filter);
    filter.connect(ambientGainNode);
    ambientGainNode.connect(audioContext.destination);

    ambientNoiseNode.start();
}

function stopAmbientNoise() {
    if (ambientGainNode) {
        ambientGainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
        setTimeout(() => {
            if (ambientNoiseNode) {
                ambientNoiseNode.stop();
                ambientNoiseNode = null;
            }
            ambientGainNode = null;
        }, 1000);
    }
}

// ========================================
// BOOT SEQUENCE SOUNDS
// ========================================

function initBootSounds() {
    // Initialize audio context immediately for boot sounds
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Play sounds synchronized with CSS animations
    // Letters appear at 0.1s, 0.2s, 0.3s, 0.4s
    setTimeout(() => playSound('bootLetter'), 100);
    setTimeout(() => playSound('bootLetter'), 200);
    setTimeout(() => playSound('bootLetter'), 300);
    setTimeout(() => playSound('bootLetter'), 400);

    // Subtitle appears at 0.6s
    setTimeout(() => playSound('bootProgress'), 600);

    // Progress bar ticks (loader runs from 0.5s to 2.3s)
    for (let i = 0; i < 8; i++) {
        setTimeout(() => playSound('bootProgress'), 600 + i * 200);
    }

    // Boot complete at ~2.2s (before fade out)
    setTimeout(() => {
        playSound('bootComplete');
        // Start ambient noise after boot
        setTimeout(() => startAmbientNoise(), 500);
    }, 2200);
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initBootSounds();
    initAudio(); // Fallback for browsers that block autoplay
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
    initHoverSounds();
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

    if (glitchType < 0.7) {
        // Glitch overlay flash
        const overlay = document.getElementById('glitch-overlay');
        if (overlay) {
            overlay.classList.add('active');
            setTimeout(() => overlay.classList.remove('active'), 150);
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
            playSound('unlock');
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
            playSound('open');
            const appId = icon.dataset.app;
            openApp(appId);
        });
    });

    // Lock button
    const lockBtn = document.getElementById('lock-btn');
    if (lockBtn) {
        lockBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playSound('back');
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
                playSound('back');
                goBack();
            } else if (action === 'home') {
                playSound('back');
                navigationHistory = []; // Clear history when going home
                showScreen('home-screen', false);
            }
        });

        btn.addEventListener('mouseenter', () => {
            playSound('hover');
        });
    });
}

// ========================================
// HOVER SOUNDS
// ========================================

function initHoverSounds() {
    // Add hover sounds to interactive elements
    const hoverTargets = [
        '.app-icon',
        '.class-card',
        '.student-card',
        '.student-preview',
        '.sort-btn',
        '.lock-btn',
        '.view-all-link',
        '.exam-type-card',
        '.key-hint',
        '.enter-hint'
    ];

    hoverTargets.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.addEventListener('mouseenter', () => {
                playSound('hover');
            });
        });
    });
}

// ========================================
// KEYBOARD NAVIGATION
// ========================================

function initKeyboardNav() {
    // Prevent key repeat
    document.addEventListener('keydown', (e) => {
        // Skip if key is being held
        if (keysHeld[e.key]) return;
        keysHeld[e.key] = true;

        // Enter to unlock
        if (e.key === 'Enter' && currentScreen === 'lock-screen') {
            playSound('unlock');
            navigationHistory = [];
            showScreen('home-screen');
            return;
        }

        // ESC to go back (but not if in search)
        if (e.key === 'Escape') {
            const searchInput = document.querySelector('.search-input');
            if (searchInput && document.activeElement === searchInput) {
                playSound('back');
                searchInput.blur();
                searchInput.value = '';
                filterStudents('');
            } else {
                playSound('back');
                goBack();
            }
            return;
        }

        // Backspace to go back (when not in search)
        if (e.key === 'Backspace') {
            const searchInput = document.querySelector('.search-input');
            if (!searchInput || document.activeElement !== searchInput) {
                e.preventDefault();
                playSound('back');
                goBack();
            }
            return;
        }

        // Ctrl+K or / to focus search (when in OAA app)
        if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && currentScreen === 'oaa-app')) {
            e.preventDefault();
            playSound('focus');
            const searchInput = document.querySelector('.search-input');
            if (searchInput && currentScreen === 'oaa-app' && currentOAAView === 'oaa-dashboard') {
                searchInput.focus();
            }
            return;
        }

        // Number keys for apps (from home screen)
        if (currentScreen === 'home-screen') {
            if (e.key === '1') {
                playSound('open');
                openApp('oaa');
            } else if (e.key === '2') {
                playSound('open');
                openApp('events');
            }
        }
    });

    // Release key tracking
    document.addEventListener('keyup', (e) => {
        keysHeld[e.key] = false;
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
    // Dashboard sort buttons
    const dashboardButtons = document.querySelectorAll('#oaa-dashboard .sort-btn');
    dashboardButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            playSound('select');
            // Update active state on both sets
            updateAllSortButtons(btn.dataset.sort);
            currentSort = btn.dataset.sort;
            renderClassCards();
        });
    });

    // Class view sort buttons
    const classButtons = document.querySelectorAll('#class-sort-buttons .sort-btn');
    classButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            playSound('select');
            // Update active state on both sets
            updateAllSortButtons(btn.dataset.sort);
            currentSort = btn.dataset.sort;
            // Re-render current class view
            if (currentClass) {
                showClassView(currentClass.year, currentClass.className, false);
            }
        });
    });
}

function updateAllSortButtons(sortValue) {
    // Update all sort buttons across both views
    document.querySelectorAll('.sort-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.sort === sortValue);
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
        playSound('type');
        const query = e.target.value.toLowerCase().trim();
        filterStudents(query);
    });

    searchInput.addEventListener('focus', () => {
        playSound('focus');
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
            playSound('click');
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
        playSound('click');
        showClassView(year, className);
    });

    // Hover sound for card
    card.addEventListener('mouseenter', () => {
        playSound('hover');
    });

    // Hover sound for student previews
    card.querySelectorAll('.student-preview').forEach(preview => {
        preview.addEventListener('mouseenter', (e) => {
            e.stopPropagation();
            playSound('hover');
        });
    });

    // Hover sound for view all link
    const viewAllLink = card.querySelector('.view-all-link');
    if (viewAllLink) {
        viewAllLink.addEventListener('mouseenter', (e) => {
            e.stopPropagation();
            playSound('hover');
        });
    }

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
    const sortedStudents = getSortedStudents(students, currentSort);

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

    if (sortedStudents.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 3rem;">No students enrolled in this class</p>';
    } else {
        sortedStudents.forEach(student => {
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
        playSound('click');
        showStudentProfile(student);
    });
    card.addEventListener('mouseenter', () => {
        playSound('hover');
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

