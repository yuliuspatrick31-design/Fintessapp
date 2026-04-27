// ── Plan Generator ────────────────────────────────────────────
// Generates a 4-week training schedule from a program template

const TITLES = {
  push: 'Push Day',
  pull: 'Pull Day',
  legs: 'Leg Day',
  upper: 'Upper Body',
  lower: 'Lower Body',
  fullbody: 'Full Body',
  'chest-back': 'Chest & Back',
  'shoulders-arms': 'Shoulders & Arms',
  squat: 'Squat Day',
  bench: 'Bench Day',
  deadlift: 'Deadlift Day',
  ohp: 'OHP Day',
  'squat-bench': 'Squat + Bench',
  'deadlift-ohp': 'Deadlift + OHP',
  rest: 'Rest Day',
  run: 'Running',
};

const EXERCISES = {
  push: [
    { name: 'Bench Press',        muscle: 'Chest',     sets: 4, reps: 8  },
    { name: 'Overhead Press',     muscle: 'Shoulders', sets: 3, reps: 10 },
    { name: 'Incline Bench Press',muscle: 'Chest',     sets: 3, reps: 10 },
    { name: 'Lateral Raise',      muscle: 'Shoulders', sets: 4, reps: 15 },
    { name: 'Tricep Pushdown',    muscle: 'Arms',      sets: 3, reps: 12 },
    { name: 'Cable Crossover',    muscle: 'Chest',     sets: 3, reps: 15 },
  ],
  pull: [
    { name: 'Deadlift',        muscle: 'Back',  sets: 3, reps: 5  },
    { name: 'Pull-Up',         muscle: 'Back',  sets: 4, reps: 8  },
    { name: 'Barbell Row',     muscle: 'Back',  sets: 3, reps: 10 },
    { name: 'Lat Pulldown',    muscle: 'Back',  sets: 3, reps: 12 },
    { name: 'Face Pull',       muscle: 'Shoulders', sets: 3, reps: 15 },
    { name: 'Dumbbell Curl',   muscle: 'Arms',  sets: 3, reps: 12 },
    { name: 'Hammer Curl',     muscle: 'Arms',  sets: 3, reps: 12 },
  ],
  legs: [
    { name: 'Squat',             muscle: 'Legs', sets: 4, reps: 8  },
    { name: 'Romanian Deadlift', muscle: 'Legs', sets: 3, reps: 10 },
    { name: 'Leg Press',         muscle: 'Legs', sets: 3, reps: 12 },
    { name: 'Leg Curl',          muscle: 'Legs', sets: 3, reps: 15 },
    { name: 'Leg Extension',     muscle: 'Legs', sets: 3, reps: 15 },
    { name: 'Calf Raise',        muscle: 'Legs', sets: 4, reps: 20 },
  ],
  upper: [
    { name: 'Bench Press',    muscle: 'Chest',     sets: 4, reps: 8  },
    { name: 'Barbell Row',    muscle: 'Back',      sets: 4, reps: 8  },
    { name: 'Overhead Press', muscle: 'Shoulders', sets: 3, reps: 10 },
    { name: 'Lat Pulldown',   muscle: 'Back',      sets: 3, reps: 12 },
    { name: 'Lateral Raise',  muscle: 'Shoulders', sets: 3, reps: 15 },
    { name: 'Dumbbell Curl',  muscle: 'Arms',      sets: 3, reps: 12 },
    { name: 'Tricep Pushdown',muscle: 'Arms',      sets: 3, reps: 12 },
  ],
  lower: [
    { name: 'Squat',             muscle: 'Legs', sets: 4, reps: 8  },
    { name: 'Romanian Deadlift', muscle: 'Legs', sets: 3, reps: 10 },
    { name: 'Leg Press',         muscle: 'Legs', sets: 3, reps: 12 },
    { name: 'Leg Curl',          muscle: 'Legs', sets: 3, reps: 15 },
    { name: 'Lunges',            muscle: 'Legs', sets: 3, reps: 12 },
    { name: 'Calf Raise',        muscle: 'Legs', sets: 3, reps: 20 },
  ],
  fullbody: [
    { name: 'Squat',             muscle: 'Legs',  sets: 3, reps: 8 },
    { name: 'Bench Press',       muscle: 'Chest', sets: 3, reps: 8 },
    { name: 'Deadlift',          muscle: 'Back',  sets: 3, reps: 5 },
    { name: 'Overhead Press',    muscle: 'Shoulders', sets: 3, reps: 10 },
    { name: 'Pull-Up',           muscle: 'Back',  sets: 3, reps: 8 },
    { name: 'Romanian Deadlift', muscle: 'Legs',  sets: 2, reps: 10 },
  ],
  'chest-back': [
    { name: 'Bench Press',       muscle: 'Chest', sets: 4, reps: 8  },
    { name: 'Barbell Row',       muscle: 'Back',  sets: 4, reps: 8  },
    { name: 'Pull-Up',           muscle: 'Back',  sets: 3, reps: 10 },
    { name: 'Incline Bench Press',muscle: 'Chest', sets: 3, reps: 10 },
    { name: 'Lat Pulldown',      muscle: 'Back',  sets: 3, reps: 12 },
    { name: 'Cable Crossover',   muscle: 'Chest', sets: 3, reps: 15 },
    { name: 'Seated Cable Row',  muscle: 'Back',  sets: 3, reps: 12 },
  ],
  'shoulders-arms': [
    { name: 'Overhead Press',  muscle: 'Shoulders', sets: 4, reps: 8  },
    { name: 'Lateral Raise',   muscle: 'Shoulders', sets: 4, reps: 12 },
    { name: 'Face Pull',       muscle: 'Shoulders', sets: 3, reps: 15 },
    { name: 'Front Raise',     muscle: 'Shoulders', sets: 3, reps: 12 },
    { name: 'Barbell Curl',    muscle: 'Arms', sets: 4, reps: 10 },
    { name: 'Skull Crusher',   muscle: 'Arms', sets: 3, reps: 12 },
    { name: 'Hammer Curl',     muscle: 'Arms', sets: 3, reps: 12 },
    { name: 'Tricep Pushdown', muscle: 'Arms', sets: 3, reps: 12 },
  ],
  squat: [
    { name: 'Squat',             muscle: 'Legs', sets: 5, reps: 5  },
    { name: 'Romanian Deadlift', muscle: 'Legs', sets: 3, reps: 10 },
    { name: 'Leg Press',         muscle: 'Legs', sets: 3, reps: 12 },
    { name: 'Leg Curl',          muscle: 'Legs', sets: 3, reps: 12 },
    { name: 'Calf Raise',        muscle: 'Legs', sets: 3, reps: 20 },
  ],
  bench: [
    { name: 'Bench Press',       muscle: 'Chest',     sets: 5, reps: 5  },
    { name: 'Incline Bench Press',muscle: 'Chest',    sets: 3, reps: 10 },
    { name: 'Dumbbell Fly',      muscle: 'Chest',     sets: 3, reps: 12 },
    { name: 'Lateral Raise',     muscle: 'Shoulders', sets: 3, reps: 15 },
    { name: 'Tricep Pushdown',   muscle: 'Arms',      sets: 3, reps: 12 },
  ],
  deadlift: [
    { name: 'Deadlift',       muscle: 'Back',      sets: 5, reps: 5  },
    { name: 'Barbell Row',    muscle: 'Back',      sets: 3, reps: 10 },
    { name: 'Lat Pulldown',   muscle: 'Back',      sets: 3, reps: 12 },
    { name: 'Face Pull',      muscle: 'Shoulders', sets: 3, reps: 15 },
    { name: 'Dumbbell Curl',  muscle: 'Arms',      sets: 3, reps: 12 },
  ],
  ohp: [
    { name: 'Overhead Press', muscle: 'Shoulders', sets: 5, reps: 5  },
    { name: 'Dumbbell Press', muscle: 'Shoulders', sets: 3, reps: 10 },
    { name: 'Lateral Raise',  muscle: 'Shoulders', sets: 4, reps: 12 },
    { name: 'Face Pull',      muscle: 'Shoulders', sets: 3, reps: 15 },
    { name: 'Tricep Pushdown',muscle: 'Arms',      sets: 3, reps: 12 },
  ],
  'squat-bench': [
    { name: 'Squat',          muscle: 'Legs',  sets: 5, reps: 3  },
    { name: 'Bench Press',    muscle: 'Chest', sets: 4, reps: 10 },
    { name: 'Lat Pulldown',   muscle: 'Back',  sets: 3, reps: 10 },
    { name: 'Leg Press',      muscle: 'Legs',  sets: 3, reps: 12 },
    { name: 'Dumbbell Curl',  muscle: 'Arms',  sets: 3, reps: 15 },
  ],
  'deadlift-ohp': [
    { name: 'Deadlift',       muscle: 'Back',      sets: 5, reps: 3  },
    { name: 'Overhead Press', muscle: 'Shoulders', sets: 4, reps: 10 },
    { name: 'Barbell Row',    muscle: 'Back',      sets: 3, reps: 10 },
    { name: 'Leg Curl',       muscle: 'Legs',      sets: 3, reps: 12 },
    { name: 'Lateral Raise',  muscle: 'Shoulders', sets: 3, reps: 15 },
  ],
};

// Weekly patterns (Mon=0 → Sun=6), value = workout key or 'rest'
const PATTERNS = {
  ppl:        ['push', 'pull', 'legs', 'push', 'pull', 'legs', 'rest'],
  ul:         ['upper', 'lower', 'rest', 'upper', 'lower', 'rest', 'rest'],
  '531':      ['squat', 'bench', 'rest', 'deadlift', 'ohp', 'rest', 'rest'],
  arnold:     ['chest-back', 'shoulders-arms', 'legs', 'chest-back', 'shoulders-arms', 'legs', 'rest'],
  'full-body':['fullbody', 'rest', 'fullbody', 'rest', 'fullbody', 'rest', 'rest'],
  gzclp:      ['squat-bench', 'rest', 'deadlift-ohp', 'rest', 'squat-bench', 'deadlift-ohp', 'rest'],
};

// Running distances by week (progressive)
const RUN_DISTANCES = [3, 4, 5, 5];

/**
 * Generate a 4-week training schedule
 * @param {string} programId - program key (ppl, ul, 531, arnold, full-body, gzclp)
 * @param {string} startDateStr - ISO start date "YYYY-MM-DD"
 * @param {boolean} includeRuns - whether to replace some rest days with runs
 * @param {number} runsPerWeek - how many runs per week (1-3)
 * @returns {Array} schedule array
 */
export function generatePlan(programId, startDateStr, includeRuns = true, runsPerWeek = 2) {
  const pattern = PATTERNS[programId];
  if (!pattern) throw new Error(`Unknown program: ${programId}`);

  const schedule = [];
  const startDate = new Date(startDateStr + 'T12:00:00');

  for (let day = 0; day < 28; day++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + day);
    const dateStr = date.toISOString().slice(0, 10);

    const weekNum = Math.floor(day / 7); // 0-3
    // getDay() returns 0=Sun, so we convert Mon=0..Sun=6
    const weekday = (date.getDay() + 6) % 7; // Mon=0 ... Sun=6
    const workoutKey = pattern[weekday];

    let scheduleDay;

    if (workoutKey === 'rest') {
      // Optionally turn some rest days into running
      const runsThisWeek = includeRuns
        ? schedule.filter(d => {
            const dWeek = Math.floor(
              (new Date(d.date + 'T12:00:00') - startDate) / (7 * 86400000)
            );
            return dWeek === weekNum && d.type === 'run';
          }).length
        : 0;

      if (includeRuns && runsThisWeek < runsPerWeek && weekday !== 6) {
        // Replace rest with run
        const distance = RUN_DISTANCES[weekNum] || 5;
        scheduleDay = {
          id: crypto.randomUUID(),
          date: dateStr,
          type: 'run',
          title: `${distance}km Run`,
          exercises: [],
          targetDistance: distance,
          targetDuration: `${Math.round(distance * 5.5)}:00`, // ~5:30 /km
          completed: false,
          completedExercises: [],
        };
      } else {
        scheduleDay = {
          id: crypto.randomUUID(),
          date: dateStr,
          type: 'rest',
          title: 'Rest Day',
          exercises: [],
          completed: false,
          completedExercises: [],
        };
      }
    } else {
      // Gym day — assign exercises with unique IDs
      const exerciseTemplate = EXERCISES[workoutKey] || [];
      const exercises = exerciseTemplate.map(e => ({
        ...e,
        id: crypto.randomUUID(),
        weight: 0,
      }));

      scheduleDay = {
        id: crypto.randomUUID(),
        date: dateStr,
        type: 'gym',
        title: TITLES[workoutKey] || workoutKey,
        exercises,
        completed: false,
        completedExercises: [],
      };
    }

    schedule.push(scheduleDay);
  }

  return schedule;
}

export { TITLES };
