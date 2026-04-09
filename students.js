// ========================================
// STUDENT DATA
// ========================================
// To add a new student, copy an existing entry and modify it.
//
// Fields:
//   name: Student's full name
//   year: 1, 2, or 3
//   class: "A", "B", "C", or "D"
//   id: Unique ID code (format: S01T004714 - S=Student, 01=Year, T=separator, 6-digit number)
//   image: URL to character image (Discord/Imgur link)
//   stats: Object with 5 stats (0-100 scale)
//     - academic: Academic Ability
//     - intelligence: Intelligence
//     - decision: Decision Making
//     - physical: Physical Ability
//     - cooperativeness: Cooperativeness
//   traits: (Optional) Object with trait names for each stat
//     - academic: "Studious" / "Lazy" / etc.
//     - intelligence: "Genius" / "Slow Learner" / etc.
//     - decision: "Decisive" / "Indecisive" / etc.
//     - physical: "Athletic" / "Frail" / etc.
//     - cooperativeness: "Team Player" / "Lone Wolf" / etc.
// ========================================

// Class points and students are loaded from Firebase.
// These empty defaults ensure the fallback never shows fake data.
const classPoints = {
    1: { A: 0, B: 0, C: 0, D: 0 },
    2: { A: 0, B: 0, C: 0, D: 0 },
    3: { A: 0, B: 0, C: 0, D: 0 }
};

const studentData = [];
