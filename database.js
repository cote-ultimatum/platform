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

    const pointsRef = firebase.database().ref('classPoints');

    pointsRef.on('value', (snapshot) => {
        const newPoints = snapshot.val();

        if (newPoints) {
            // Store previous values for delta calculation
            if (dbState.classPoints) {
                dbState.previousPoints = JSON.parse(JSON.stringify(dbState.classPoints));
            }

            // Update current points
            dbState.classPoints = newPoints;

            // Calculate deltas
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
// DISCORD OAUTH AUTHENTICATION
// ========================================

// Check if user is admin (stored in Firebase)
async function checkAdminStatus(discordUserId) {
    if (!dbState.initialized) return false;

    try {
        const snapshot = await firebase.database().ref(`admins/${discordUserId}`).once('value');
        return snapshot.val() === true;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Sign in with Discord OAuth token (handled via Firebase Auth custom token)
async function signInWithDiscord(customToken) {
    if (!dbState.initialized) {
        console.error('Database not initialized');
        return false;
    }

    try {
        const userCredential = await firebase.auth().signInWithCustomToken(customToken);
        const user = userCredential.user;

        // Check if user is admin
        dbState.adminAuthenticated = await checkAdminStatus(user.uid);

        console.log(dbState.adminAuthenticated ? 'Signed in as admin' : 'Signed in (not admin)');
        return dbState.adminAuthenticated;
    } catch (error) {
        console.error('Discord sign-in error:', error);
        return false;
    }
}

// Sign out
async function signOut() {
    if (!dbState.initialized) return;

    try {
        await firebase.auth().signOut();
        dbState.adminAuthenticated = false;
        console.log('Signed out');
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

// ========================================
// SIMPLE ADMIN AUTHENTICATION
// ========================================

// Verify admin credentials against Firebase
async function verifyAdmin(username, password) {
    if (!dbState.initialized) {
        console.error('Database not initialized');
        return { success: false };
    }

    try {
        const snapshot = await firebase.database().ref(`admins/${username}`).once('value');
        const adminData = snapshot.val();

        if (adminData && adminData.password === password) {
            dbState.adminAuthenticated = true;
            return {
                success: true,
                displayName: adminData.displayName || username
            };
        }

        return { success: false };
    } catch (error) {
        console.error('Error verifying admin:', error);
        return { success: false };
    }
}

// Set class points with changelog entry
async function setClassPointsWithLog(pointsData, userName, changes) {
    if (!dbState.initialized) {
        console.error('Database not initialized');
        return false;
    }

    try {
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

        // If no Firebase data, return local data (migration scenario)
        return typeof studentData !== 'undefined' ? studentData : [];
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
        // Generate student ID if not provided
        if (!student.id) {
            const yearNum = student.year || 1;
            const classLetter = student.class || 'D';
            const random = Math.floor(Math.random() * 9000) + 1000;
            student.id = `S${yearNum}${classLetter}${random}`;
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
async function updateStudent(firebaseKey, updates) {
    if (!dbState.initialized) {
        console.error('Database not initialized');
        return false;
    }

    if (!dbState.adminAuthenticated) {
        console.error('Admin authentication required');
        return false;
    }

    try {
        await firebase.database().ref(`students/${firebaseKey}`).update(updates);
        console.log('Updated student:', firebaseKey);
        return true;
    } catch (error) {
        console.error('Error updating student:', error);
        return false;
    }
}

// Delete a student
async function deleteStudent(firebaseKey) {
    if (!dbState.initialized) {
        console.error('Database not initialized');
        return false;
    }

    if (!dbState.adminAuthenticated) {
        console.error('Admin authentication required');
        return false;
    }

    try {
        await firebase.database().ref(`students/${firebaseKey}`).remove();
        console.log('Deleted student:', firebaseKey);
        return true;
    } catch (error) {
        console.error('Error deleting student:', error);
        return false;
    }
}

// Subscribe to student updates (real-time)
function subscribeToStudents(callback) {
    if (!dbState.initialized) {
        console.warn('Database not initialized');
        return () => {};
    }

    const studentsRef = firebase.database().ref('students');

    const listener = studentsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const students = Object.keys(data).map(key => ({
                ...data[key],
                _firebaseKey: key
            }));
            callback(students);
        } else {
            callback([]);
        }
    });

    // Return unsubscribe function
    return () => studentsRef.off('value', listener);
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
    signInWithDiscord: signInWithDiscord,
    signOut: signOut,
    isConnected: isDatabaseConnected,
    isInitialized: isDatabaseInitialized,
    isAdmin: isAdminAuthenticated,
    addListener: addDatabaseListener,
    removeListener: removeDatabaseListener,
    // Admin functions
    verifyAdmin: verifyAdmin,
    setClassPointsWithLog: setClassPointsWithLog,
    getChangelog: getChangelog,
    // Student functions
    getStudents: getStudents,
    addStudent: addStudent,
    updateStudent: updateStudent,
    deleteStudent: deleteStudent,
    subscribeToStudents: subscribeToStudents,
    migrateStudentsToFirebase: migrateStudentsToFirebase
};
