// ── Seed Exercise Library ──────────────────────────────────────
export const DEFAULT_EXERCISES = [
  // Chest
  { id: 'e1',  name: 'Bench Press',         muscle: 'Chest',     type: 'Compound',  equipment: 'Barbell' },
  { id: 'e2',  name: 'Incline Bench Press', muscle: 'Chest',     type: 'Compound',  equipment: 'Barbell' },
  { id: 'e3',  name: 'Dumbbell Fly',        muscle: 'Chest',     type: 'Isolation', equipment: 'Dumbbell' },
  { id: 'e4',  name: 'Cable Crossover',     muscle: 'Chest',     type: 'Isolation', equipment: 'Cable' },
  { id: 'e5',  name: 'Push-Up',             muscle: 'Chest',     type: 'Compound',  equipment: 'Bodyweight' },
  // Back
  { id: 'e6',  name: 'Deadlift',            muscle: 'Back',      type: 'Compound',  equipment: 'Barbell' },
  { id: 'e7',  name: 'Pull-Up',             muscle: 'Back',      type: 'Compound',  equipment: 'Bodyweight' },
  { id: 'e8',  name: 'Barbell Row',         muscle: 'Back',      type: 'Compound',  equipment: 'Barbell' },
  { id: 'e9',  name: 'Lat Pulldown',        muscle: 'Back',      type: 'Compound',  equipment: 'Cable' },
  { id: 'e10', name: 'Seated Cable Row',    muscle: 'Back',      type: 'Compound',  equipment: 'Cable' },
  { id: 'e11', name: 'Dumbbell Row',        muscle: 'Back',      type: 'Compound',  equipment: 'Dumbbell' },
  // Shoulders
  { id: 'e12', name: 'Overhead Press',      muscle: 'Shoulders', type: 'Compound',  equipment: 'Barbell' },
  { id: 'e13', name: 'Dumbbell Press',      muscle: 'Shoulders', type: 'Compound',  equipment: 'Dumbbell' },
  { id: 'e14', name: 'Lateral Raise',       muscle: 'Shoulders', type: 'Isolation', equipment: 'Dumbbell' },
  { id: 'e15', name: 'Face Pull',           muscle: 'Shoulders', type: 'Isolation', equipment: 'Cable' },
  { id: 'e16', name: 'Front Raise',         muscle: 'Shoulders', type: 'Isolation', equipment: 'Dumbbell' },
  // Legs
  { id: 'e17', name: 'Squat',              muscle: 'Legs',       type: 'Compound',  equipment: 'Barbell' },
  { id: 'e18', name: 'Romanian Deadlift',  muscle: 'Legs',       type: 'Compound',  equipment: 'Barbell' },
  { id: 'e19', name: 'Leg Press',          muscle: 'Legs',       type: 'Compound',  equipment: 'Machine' },
  { id: 'e20', name: 'Leg Curl',           muscle: 'Legs',       type: 'Isolation', equipment: 'Machine' },
  { id: 'e21', name: 'Leg Extension',      muscle: 'Legs',       type: 'Isolation', equipment: 'Machine' },
  { id: 'e22', name: 'Lunges',             muscle: 'Legs',       type: 'Compound',  equipment: 'Bodyweight' },
  { id: 'e23', name: 'Calf Raise',         muscle: 'Legs',       type: 'Isolation', equipment: 'Machine' },
  // Arms
  { id: 'e24', name: 'Barbell Curl',       muscle: 'Arms',       type: 'Isolation', equipment: 'Barbell' },
  { id: 'e25', name: 'Dumbbell Curl',      muscle: 'Arms',       type: 'Isolation', equipment: 'Dumbbell' },
  { id: 'e26', name: 'Hammer Curl',        muscle: 'Arms',       type: 'Isolation', equipment: 'Dumbbell' },
  { id: 'e27', name: 'Tricep Pushdown',    muscle: 'Arms',       type: 'Isolation', equipment: 'Cable' },
  { id: 'e28', name: 'Skull Crusher',      muscle: 'Arms',       type: 'Isolation', equipment: 'Barbell' },
  { id: 'e29', name: 'Dip',               muscle: 'Arms',       type: 'Compound',  equipment: 'Bodyweight' },
  // Core
  { id: 'e30', name: 'Plank',             muscle: 'Core',        type: 'Isolation', equipment: 'Bodyweight' },
  { id: 'e31', name: 'Cable Crunch',      muscle: 'Core',        type: 'Isolation', equipment: 'Cable' },
  { id: 'e32', name: 'Hanging Leg Raise', muscle: 'Core',        type: 'Isolation', equipment: 'Bodyweight' },
  { id: 'e33', name: 'Ab Rollout',        muscle: 'Core',        type: 'Isolation', equipment: 'Bodyweight' },
];

export const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core'];
export const EXERCISE_TYPES = ['All', 'Compound', 'Isolation'];
export const EQUIPMENT_LIST = ['All', 'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight'];
