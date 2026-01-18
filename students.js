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

// Class Points - update these as the RP progresses
const classPoints = {
    1: { A: 1000, B: 1000, C: 1000, D: 1000 },  // 1st Year
    2: { A: 1000, B: 1000, C: 1000, D: 1000 },  // 2nd Year
    3: { A: 1000, B: 1000, C: 1000, D: 1000 }   // 3rd Year
};

const studentData = [
    // ============ 1ST YEAR - CLASS A ============
    {
        name: "Sylvia Von Euleid",
        year: 1,
        class: "A",
        id: "S01T004801",
        image: "",
        stats: {
            academic: 92,
            intelligence: 88,
            decision: 75,
            physical: 45,
            cooperativeness: 60
        }
    },
    {
        name: "Rintaro Oikawa",
        year: 1,
        class: "A",
        id: "S01T004802",
        image: "",
        stats: {
            academic: 78,
            intelligence: 82,
            decision: 90,
            physical: 70,
            cooperativeness: 55
        }
    },
    {
        name: "Takagi Natsuki",
        year: 1,
        class: "A",
        id: "S01T004803",
        image: "",
        stats: {
            academic: 85,
            intelligence: 70,
            decision: 65,
            physical: 88,
            cooperativeness: 80
        }
    },
    {
        name: "Franz Rein",
        year: 1,
        class: "A",
        id: "S01T004804",
        image: "",
        stats: {
            academic: 70,
            intelligence: 95,
            decision: 80,
            physical: 55,
            cooperativeness: 40
        }
    },

    // ============ 1ST YEAR - CLASS B ============
    {
        name: "Ritsuka Juna",
        year: 1,
        class: "B",
        id: "S01T004821",
        image: "",
        stats: {
            academic: 65,
            intelligence: 72,
            decision: 85,
            physical: 90,
            cooperativeness: 75
        }
    },
    {
        name: "Hiroshi Takada",
        year: 1,
        class: "B",
        id: "S01T004822",
        image: "",
        stats: {
            academic: 88,
            intelligence: 65,
            decision: 60,
            physical: 50,
            cooperativeness: 92
        }
    },
    {
        name: "Coralie Legrace",
        year: 1,
        class: "B",
        id: "S01T004823",
        image: "",
        stats: {
            academic: 75,
            intelligence: 80,
            decision: 70,
            physical: 65,
            cooperativeness: 85
        }
    },

    // ============ 1ST YEAR - CLASS C ============
    {
        name: "Toshi Akamatsu",
        year: 1,
        class: "C",
        id: "S01T004841",
        image: "",
        stats: {
            academic: 55,
            intelligence: 60,
            decision: 92,
            physical: 85,
            cooperativeness: 45
        }
    },
    {
        name: "Mikagami Reito",
        year: 1,
        class: "C",
        id: "S01T004842",
        image: "",
        stats: {
            academic: 80,
            intelligence: 75,
            decision: 55,
            physical: 40,
            cooperativeness: 70
        }
    },
    {
        name: "River Rossi",
        year: 1,
        class: "C",
        id: "S01T004843",
        image: "",
        stats: {
            academic: 45,
            intelligence: 90,
            decision: 78,
            physical: 95,
            cooperativeness: 55
        }
    },

    // ============ 1ST YEAR - CLASS D ============
    {
        name: "Ayanagi Kazuki",
        year: 1,
        class: "D",
        id: "S01T004861",
        image: "",
        stats: {
            academic: 60,
            intelligence: 85,
            decision: 45,
            physical: 75,
            cooperativeness: 90
        }
    },
    {
        name: "Kami Nyoka",
        year: 1,
        class: "D",
        id: "S01T004862",
        image: "",
        stats: {
            academic: 95,
            intelligence: 55,
            decision: 70,
            physical: 60,
            cooperativeness: 50
        }
    },
    {
        name: "Matsushita Mitsuha",
        year: 1,
        class: "D",
        id: "S01T004863",
        image: "",
        stats: {
            academic: 72,
            intelligence: 68,
            decision: 88,
            physical: 82,
            cooperativeness: 78
        }
    }
];
