/**
 * Smart Progression Logic
 * Rules:
 * - 3 successes in a row -> +2.5kg
 * - 2 failures in a row (within last 3) -> -2.5kg
 * - otherwise -> maintain
 */

export function calculateNextLoad(exerciseName, logs = []) {
  // 1. Filter logs for this exercise and sort by date descending
  const relevantLogs = logs
    .filter(log => log.exercise.toLowerCase() === exerciseName.toLowerCase())
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (relevantLogs.length === 0) {
    return { weight: 0, sets: 3, reps: 10, reason: 'No history found' };
  }

  // 2. Get last 3 sessions
  const last3 = relevantLogs.slice(0, 3);
  const latest = last3[0];
  
  const successes = last3.filter(l => l.is_success).length;
  const failures = last3.filter(l => !l.is_success).length;

  let nextWeight = latest.weight || 0;
  let reason = 'Maintaining current weight';

  // Apply rules
  if (successes >= 3) {
    nextWeight += 2.5;
    reason = '3 successes in a row! Increasing weight +2.5kg';
  } else if (failures >= 2) {
    nextWeight = Math.max(0, nextWeight - 2.5);
    reason = '2 failures detected. Reducing weight -2.5kg for recovery';
  } else if (successes < 3 && last3.length === 3) {
    reason = 'Mixed results. Maintaining weight to build consistency';
  } else if (last3.length < 3) {
    reason = `Collecting data (${last3.length}/3 sessions). Maintaining weight.`;
  }

  return {
    weight: nextWeight,
    sets: latest.sets || 3,
    reps: latest.reps || 10,
    reason
  };
}

export function calculateVolume(sets, reps, weight) {
  return (sets || 0) * (reps || 0) * (weight || 0);
}
