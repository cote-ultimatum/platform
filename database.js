// ========================================
// COTE: ULTIMATUM - Firebase Database Module
// ========================================
// This module handles real-time data synchronization with Firebase.
//
// SETUP INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project (or use existing)
// 3. Add a Web App to get your config
// 4. Enable Realtime Database (set to "test mode" initially)
// 5. Replace FIREBASE_CONFIG below with your config
// 6. Set up database rules for security
// ========================================

// Firebase configuration
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCeGeRoqv4nPykFqZZlgYTZ_14jcI9LpUk",
    authDomain: "cote-ultimatum.firebaseapp.com",
    databaseURL: "https://cote-ultimatum-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "cote-ultimatum",
    storageBucket: "cote-ultimatum.firebasestorage.app",
    messagingSenderId: "339717253338",
    appId: "1:339717253338:web:90f81f89f9712c37fd1de3"
};

// Database state
const dbState = {
    initialized: false,
    connected: false,
    classPoints: null,
    previousPoints: null,  // For calculating deltas
    listeners: [],
    adminAuthenticated: false
};

// ========================================
// INITIALIZATION
// ========================================

async function initDatabase() {
    // Check if Firebase SDK is loaded
    if (typeof firebase === 'undefined') {
        console.warn('Firebase SDK not loaded. Using local data.');
        dbState.initialized = false;
        return false;
    }

    // Check if config is set
    if (FIREBASE_CONFIG.apiKey === "YOUR_API_KEY") {
        console.warn('Firebase not configured. Using local data.');
        dbState.initialized = false;
        return false;
    }

    try {
        // Initialize Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(FIREBASE_CONFIG);
        }

        dbState.initialized = true;
        console.log('Firebase initialized successfully');

        // Set up connection monitoring
        const connectedRef = firebase.database().ref('.info/connected');
        connectedRef.on('value', (snap) => {
            dbState.connected = snap.val() === true;
            console.log(dbState.connected ? 'Connected to Firebase' : 'Disconnected from Firebase');
            notifyListeners('connection', dbState.connected);
        });

        // Finish any sign-in that came back via redirect before the UI asks.
        await consumeRedirectResult();

        // Load initial data and subscribe to updates
        await subscribeToClassPoints();

        return true;
    } catch (error) {
        console.error('Firebase initialization error:', error);
        dbState.initialized = false;
        return false;
    }
}

// ========================================
// CLASS POINTS - REAL-TIME SYNC
// ========================================

async function subscribeToClassPoints() {
    if (!dbState.initialized) return;

    // Subscribe to previous values from Firebase (persisted across reloads)
    firebase.database().ref('previousClassPoints').on('value', (snapshot) => {
        dbState.previousPoints = snapshot.val();
        // Recompute deltas if we already have current points
        if (dbState.classPoints) {
            const deltas = calculatePointDeltas(dbState.previousPoints, dbState.classPoints);
            notifyListeners('classPoints', { points: dbState.classPoints, deltas: deltas });
        }
    });

    const pointsRef = firebase.database().ref('classPoints');

    pointsRef.on('value', (snapshot) => {
        const newPoints = snapshot.val();

        if (newPoints) {
            dbState.classPoints = newPoints;

            // Calculate deltas using Firebase-stored previousPoints
            const deltas = calculatePointDeltas(dbState.previousPoints, newPoints);

            // Notify listeners
            notifyListeners('classPoints', { points: newPoints, deltas: deltas });
        }
    }, (error) => {
        console.error('Error reading class points:', error);
    });
}

function calculatePointDeltas(previous, current) {
    const deltas = {};

    if (!previous || !current) return deltas;

    for (const year in current) {
        deltas[year] = {};
        for (const className in current[year]) {
            const prev = previous[year]?.[className] || 0;
            const curr = current[year][className] || 0;
            deltas[year][className] = curr - prev;
        }
    }

    return deltas;
}

// Get current class points (sync)
function getClassPoints() {
    return dbState.classPoints;
}

// Get delta for a specific class
function getPointDelta(year, className) {
    if (!dbState.previousPoints || !dbState.classPoints) return 0;
    const prev = dbState.previousPoints[year]?.[className] || 0;
    const curr = dbState.classPoints[year]?.[className] || 0;
    return curr - prev;
}

// ========================================
// ADMIN FUNCTIONS
// ========================================

// Update class points (requires admin authentication)
async function updateClassPoints(year, className, newPoints) {
    if (!dbState.initialized) {
        console.error('Database not initialized');
        return false;
    }

    if (!dbState.adminAuthenticated) {
        console.error('Admin authentication required');
        return false;
    }

    try {
        await firebase.database().ref(`classPoints/${year}/${className}`).set(newPoints);
        console.log(`Updated Class ${className} Year ${year} to ${newPoints} CP`);
        return true;
    } catch (error) {
        console.error('Error updating class points:', error);
        return false;
    }
}

// Set all class points at once
async function setAllClassPoints(pointsData) {
    if (!dbState.initialized) {
        console.error('Database not initialized');
        return false;
    }

    if (!dbState.adminAuthenticated) {
        console.error('Admin authentication required');
        return false;
    }

    try {
        await firebase.database().ref('classPoints').set(pointsData);
        console.log('Updated all class points');
        return true;
    } catch (error) {
        console.error('Error updating class points:', error);
        return false;
    }
}

// ========================================
// GOOGLE AUTHENTICATION
// ========================================

// Look up a user's admin record by Firebase UID. Returns the admin entry
// ({ displayName, email, ... }) if they're an admin, or null otherwise.
async function checkAdminStatus(uid) {
    if (!dbState.initialized || !uid) return null;
    try {
        const snapshot = await firebase.database().ref(`admins/${uid}`).once('value');
        return snapshot.exists() ? (snapshot.val() || {}) : null;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return null;
    }
}

// Set after a returning redirect if sign-in failed or the user isn't an admin.
// Consumed once by the admin UI to show a toast after the post-redirect reload.
let pendingSignInError = null;

// Handle the result of a returning signInWithRedirect call. Runs once during
// initDatabase. If the signed-in user isn't an admin, sign them back out and
// stash an error for the UI to surface. Uses redirect (not popup) because
// popup flows hang in Chrome incognito due to storage-partitioned iframes.
async function consumeRedirectResult() {
    if (!dbState.initialized) return;
    try {
        const result = await firebase.auth().getRedirectResult();
        if (!result || !result.user) return;
        const adminRecord = await checkAdminStatus(result.user.uid);
        if (!adminRecord) {
            await firebase.auth().signOut();
            pendingSignInError = {
                reason: 'not-admin',
                displayName: result.user.displayName || result.user.email
            };
        }
    } catch (error) {
        console.error('Redirect sign-in error:', error);
        pendingSignInError = { reason: 'error', error: error?.message ?? String(error) };
    }
}

function consumePendingSignInError() {
    const err = pendingSignInError;
    pendingSignInError = null;
    return err;
}

// Sign in with Google via full-page redirect. Returns:
//   { success: false, reason: 'pending-redirect' }  — redirect started; page will navigate
//   { success: false, reason: 'not-initialized' }   — Firebase not ready
//   { success: false, reason: 'error', error }      — redirect failed to start
// After Google redirects back, consumeRedirectResult() in initDatabase handles
// the returning state and onAuthChange fires for successful sign-ins.
async function signInWithGoogle() {
    if (!dbState.initialized) {
        return { success: false, reason: 'not-initialized' };
    }
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await firebase.auth().signInWithRedirect(provider);
        return { success: false, reason: 'pending-redirect' };
    } catch (error) {
        console.error('Google sign-in error:', error);
        return { success: false, reason: 'error', error: error?.message ?? String(error) };
    }
}

// Observe auth state. Callback receives:
//   { signedIn: false }                                  — not signed in
//   { signedIn: true, isAdmin: true,  displayName, ... } — signed in as admin
//   { signedIn: true, isAdmin: false, displayName, ... } — signed in but not authorized
// Returns the unsubscribe function from Firebase Auth.
function onAuthChange(callback) {
    if (!dbState.initialized) return () => {};
    return firebase.auth().onAuthStateChanged(async (user) => {
        if (!user) {
            dbState.adminAuthenticated = false;
            callback({ signedIn: false });
            return;
        }
        const adminRecord = await checkAdminStatus(user.uid);
        const isAdmin = !!adminRecord;
        dbState.adminAuthenticated = isAdmin;
        callback({
            signedIn: true,
            isAdmin,
            uid: user.uid,
            email: user.email,
            displayName: (adminRecord && adminRecord.displayName) || user.displayName || user.email
        });
    });
}

// Sign out
async function signOut() {
    if (!dbState.initialized) return;
    try {
        await firebase.auth().signOut();
        dbState.adminAuthenticated = false;
    } catch (error) {
        console.error('Sign out error:', error);
    }
}

// ========================================
// LISTENER SYSTEM
// ========================================

function addDatabaseListener(callback) {
    dbState.listeners.push(callback);
}

function removeDatabaseListener(callback) {
    dbState.listeners = dbState.listeners.filter(l => l !== callback);
}

function notifyListeners(event, data) {
    dbState.listeners.forEach(callback => {
        try {
            callback(event, data);
        } catch (error) {
            console.error('Listener error:', error);
        }
    });
}

// ========================================
// UTILITY
// ========================================

function isDatabaseConnected() {
    return dbState.connected;
}

function isDatabaseInitialized() {
    return dbState.initialized;
}

function isAdminAuthenticated() {
    return dbState.adminAuthenticated;
}

// Set class points with changelog entry
async function setClassPointsWithLog(pointsData, userName, changes) {
    if (!dbState.initialized) {
        console.error('Database not initialized');
        return false;
    }

    try {
        // Snapshot the current points as "previous" before overwriting
        if (dbState.classPoints) {
            await firebase.database().ref('previousClassPoints').set(dbState.classPoints);
        }

        // Update class points
        await firebase.database().ref('classPoints').set(pointsData);

        // Add changelog entry
        const logEntry = {
            user: userName,
            changes: changes,
            timestamp: Date.now()
        };

        await firebase.database().ref('changelog').push(logEntry);

        console.log('Updated class points with log');
        return true;
    } catch (error) {
        console.error('Error updating class points with log:', error);
        return false;
    }
}

// Add a generic changelog entry (used for non-points admin actions like add/edit/delete/retire)
async function addChangelogEntry(userName, changes) {
    if (!dbState.initialized) return false;
    try {
        const logEntry = {
            user: userName,
            changes: Array.isArray(changes) ? changes : [changes],
            timestamp: Date.now()
        };
        await firebase.database().ref('changelog').push(logEntry);
        return true;
    } catch (error) {
        console.error('Error adding changelog entry:', error);
        return false;
    }
}

// Get recent changelog entries
async function getChangelog(limit = 10) {
    if (!dbState.initialized) {
        return [];
    }

    try {
        const snapshot = await firebase.database()
            .ref('changelog')
            .orderByChild('timestamp')
            .limitToLast(limit)
            .once('value');

        const logs = [];
        snapshot.forEach(child => {
            logs.push(child.val());
        });

        // Return in reverse chronological order
        return logs.reverse();
    } catch (error) {
        console.error('Error getting changelog:', error);
        return [];
    }
}

// ========================================
// STUDENT MANAGEMENT
// ========================================

// Get all students from Firebase
async function getStudents() {
    if (!dbState.initialized) {
        console.warn('Database not initialized, using local studentData');
        return typeof studentData !== 'undefined' ? studentData : [];
    }

    try {
        const snapshot = await firebase.database().ref('students').once('value');
        const data = snapshot.val();

        if (data) {
            // Convert object to array
            return Object.keys(data).map(key => ({
                ...data[key],
                _firebaseKey: key
            }));
        }

        // Firebase reachable but empty — return empty array so deletions persist.
        // (Do NOT fall back to local studentData here, or deleted students get re-seeded.)
        return [];
    } catch (error) {
        console.error('Error getting students:', error);
        return typeof studentData !== 'undefined' ? studentData : [];
    }
}

// Add a new student
async function addStudent(student) {
    if (!dbState.initialized) {
        console.error('Database not initialized');
        return { success: false };
    }

    if (!dbState.adminAuthenticated) {
        console.error('Admin authentication required');
        return { success: false };
    }

    try {
        // Generate student ID if not provided. Canonical COTE format:
        // S{YY}T{6 digits} — e.g. S01T004801.
        if (!student.id) {
            const yy = String(student.year || 1).padStart(2, '0');
            const random = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
            student.id = `S${yy}T${random}`;
        }

        const newRef = await firebase.database().ref('students').push(student);
        console.log('Added student:', student.name);

        return {
            success: true,
            key: newRef.key,
            student: { ...student, _firebaseKey: newRef.key }
        };
    } catch (error) {
        console.error('Error adding student:', error);
        return { success: false };
    }
}

// Update an existing student
async function updateStudent(_firebaseKey, updates) {
    if (!dbState.initialized) {
        console.error('Database not initialized');
        return false;
    }

    if (!dbState.adminAuthenticated) {
        console.error('Admin authentication required');
        return false;
    }

    try {
        await firebase.database().ref(`students/${_firebaseKey}`).update(updates);
        console.log('Updated student:', _firebaseKey);
        return true;
    } catch (error) {
        console.error('Error updating student:', error);
        return false;
    }
}

// Delete a student
async function deleteStudent(_firebaseKey) {
    if (!dbState.initialized) {
        console.error('Database not initialized');
        return false;
    }

    if (!dbState.adminAuthenticated) {
        console.error('Admin authentication required');
        return false;
    }

    try {
        await firebase.database().ref(`students/${_firebaseKey}`).remove();
        console.log('Deleted student:', _firebaseKey);
        return true;
    } catch (error) {
        console.error('Error deleting student:', error);
        return false;
    }
}

// Migrate local students to Firebase (one-time operation)
async function migrateStudentsToFirebase() {
    if (!dbState.initialized || !dbState.adminAuthenticated) {
        console.error('Cannot migrate: not initialized or not admin');
        return false;
    }

    if (typeof studentData === 'undefined' || !studentData.length) {
        console.log('No local students to migrate');
        return true;
    }

    try {
        // Check if students already exist in Firebase
        const existing = await firebase.database().ref('students').once('value');
        if (existing.val()) {
            console.log('Students already exist in Firebase, skipping migration');
            return true;
        }

        // Add each student
        const batch = {};
        studentData.forEach((student, index) => {
            batch[`student_${index}`] = student;
        });

        await firebase.database().ref('students').set(batch);
        console.log(`Migrated ${studentData.length} students to Firebase`);
        return true;
    } catch (error) {
        console.error('Error migrating students:', error);
        return false;
    }
}

// ========================================
// EXPORT FOR GLOBAL ACCESS
// ========================================

window.COTEDB = {
    init: initDatabase,
    getClassPoints: getClassPoints,
    getPointDelta: getPointDelta,
    updateClassPoints: updateClassPoints,
    setAllClassPoints: setAllClassPoints,
    isConnected: isDatabaseConnected,
    isInitialized: isDatabaseInitialized,
    isAdmin: isAdminAuthenticated,
    addListener: addDatabaseListener,
    removeListener: removeDatabaseListener,
    // Auth
    signInWithGoogle: signInWithGoogle,
    signOut: signOut,
    onAuthChange: onAuthChange,
    checkAdminStatus: checkAdminStatus,
    consumePendingSignInError: consumePendingSignInError,
    // Admin data functions
    setClassPointsWithLog: setClassPointsWithLog,
    addChangelogEntry: addChangelogEntry,
    getChangelog: getChangelog,
    // Student functions
    getStudents: getStudents,
    addStudent: addStudent,
    updateStudent: updateStudent,
    deleteStudent: deleteStudent,
    migrateStudentsToFirebase: migrateStudentsToFirebase
};
