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
            academic: 50,
            intelligence: 50,
            decision: 50,
            physical: 50,
            cooperativeness: 50
        }
    },
    {
        name: "Rintaro Oikawa",
        year: 1,
        class: "A",
        id: "S01T004802",
        image: "",
        stats: {
            academic: 50,
            intelligence: 50,
            decision: 50,
            physical: 50,
            cooperativeness: 50
        }
    },
    {
        name: "Takagi Natsuki",
        year: 1,
        class: "A",
        id: "S01T004803",
        image: "",
        stats: {
            academic: 50,
            intelligence: 50,
            decision: 50,
            physical: 50,
            cooperativeness: 50
        }
    },
    {
        name: "Franz Rein",
        year: 1,
        class: "A",
        id: "S01T004804",
        image: "",
        stats: {
            academic: 50,
            intelligence: 50,
            decision: 50,
            physical: 50,
            cooperativeness: 50
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
            academic: 50,
            intelligence: 50,
            decision: 50,
            physical: 50,
            cooperativeness: 50
        }
    },
    {
        name: "Hiroshi Takada",
        year: 1,
        class: "B",
        id: "S01T004822",
        image: "",
        stats: {
            academic: 50,
            intelligence: 50,
            decision: 50,
            physical: 50,
            cooperativeness: 50
        }
    },
    {
        name: "Coralie Legrace",
        year: 1,
        class: "B",
        id: "S01T004823",
        image: "",
        stats: {
            academic: 50,
            intelligence: 50,
            decision: 50,
            physical: 50,
            cooperativeness: 50
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
            academic: 50,
            intelligence: 50,
            decision: 50,
            physical: 50,
            cooperativeness: 50
        }
    },
    {
        name: "Mikagami Reito",
        year: 1,
        class: "C",
        id: "S01T004842",
        image: "",
        stats: {
            academic: 50,
            intelligence: 50,
            decision: 50,
            physical: 50,
            cooperativeness: 50
        }
    },
    {
        name: "River Rossi",
        year: 1,
        class: "C",
        id: "S01T004843",
        image: "",
        stats: {
            academic: 50,
            intelligence: 50,
            decision: 50,
            physical: 50,
            cooperativeness: 50
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
            academic: 50,
            intelligence: 50,
            decision: 50,
            physical: 50,
            cooperativeness: 50
        }
    },
    {
        name: "Kami Nyoka",
        year: 1,
        class: "D",
        id: "S01T004862",
        image: "",
        stats: {
            academic: 50,
            intelligence: 50,
            decision: 50,
            physical: 50,
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
            academic: 50,
            intelligence: 50,
            decision: 50,
            physical: 50,
            cooperativeness: 50
        }
    }
];
