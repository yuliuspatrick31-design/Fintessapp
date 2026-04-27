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
  const startDay = new Date(startDateStr + 'T12:00:00');

  // We generate 4 weeks
  for (let week = 0; week < 4; week++) {
    const weekDays = [];
    
    // First, generate the basic 7 days for this week based on the program pattern
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDay);
      date.setDate(startDay.getDate() + (week * 7) + d);
      const dateStr = date.toISOString().slice(0, 10);
      const workoutKey = pattern[d];
      const isGym = workoutKey !== 'rest';
      
      weekDays.push({
        id: crypto.randomUUID(),
        date: dateStr,
        type: isGym ? 'gym' : 'rest',
        title: TITLES[workoutKey] || workoutKey,
        exercises: !isGym ? [] : (EXERCISES[workoutKey] || []).map(ex => ({
          ...ex,
          id: crypto.randomUUID(),
          weight: 0
        })),
        completed: false,
        completedExercises: [],
      });
    }

    // Then, if runs are requested, replace rest days with runs
    if (includeRuns && runsPerWeek > 0) {
      let runsAdded = 0;
      // Find all rest days this week
      const restDayIndices = weekDays
        .map((day, idx) => day.type === 'rest' ? idx : -1)
        .filter(idx => idx !== -1);

      // Replace up to runsPerWeek rest days with runs
      for (const idx of restDayIndices) {
        if (runsAdded >= runsPerWeek) break;
        
        const distance = RUN_DISTANCES[week] || 5;
        weekDays[idx] = {
          ...weekDays[idx],
          type: 'run',
          title: `${distance}km Run`,
          targetDistance: distance,
          targetDuration: `${Math.round(distance * 5.5)}:00`,
        };
        runsAdded++;
      }
    }

    schedule.push(...weekDays);
  }

  return schedule;
}

export { TITLES };
