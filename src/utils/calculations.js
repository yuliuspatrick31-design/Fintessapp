// ── Utility calculations ──────────────────────────────────────

/** Parse "mm:ss" or "hh:mm:ss" → total seconds */
export function parseDuration(str = '') {
  const parts = str.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

/** Seconds → "mm:ss" */
export function formatDuration(secs) {
  if (!secs || secs < 0) return '—';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Calculate pace (min/km) from distance (km) and duration (seconds) → "mm:ss /km" */
export function calcPace(distKm, durationSecs) {
  if (!distKm || !durationSecs || distKm === 0) return null;
  const paceSecs = durationSecs / distKm;
  return formatDuration(paceSecs);
}

/** Rough calorie estimate for gym: sets × reps × weight × 0.045 */
export function estimateGymCalories(gymLogs) {
  return Math.round(gymLogs.reduce((sum, log) => sum + log.sets * log.reps * log.weight * 0.045, 0));
}

/** Rough calorie estimate for running: distance × 70 (avg 70 kcal/km) */
export function estimateRunCalories(runLogs) {
  return Math.round(runLogs.reduce((sum, log) => sum + log.distance * 70, 0));
}

/** Total gym volume: sum(sets × reps × weight) */
export function totalVolume(gymLogs) {
  return Math.round(gymLogs.reduce((sum, log) => sum + log.sets * log.reps * log.weight, 0));
}

/** Get logs from the last N days */
export function logsInLastDays(logs, days) {
  const cutoff = Date.now() - days * 86400000;
  return logs.filter(l => new Date(l.date).getTime() >= cutoff);
}

/** Get ISO date string for today */
export function today() {
  return new Date().toISOString().slice(0, 10);
}

/** Format date → human-readable "Apr 25" */
export function fmtDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Time ago string */
export function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr + 'T00:00:00').getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

/** Get last 7 ISO date strings (incl. today) */
export function last7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}

/** Get last N week labels e.g. ["Apr 7", "Apr 14", ...] */
export function lastNWeeks(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i) * 7);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
}

/** Best pace from run logs (smallest pace seconds) */
export function bestPace(runLogs) {
  const valid = runLogs.filter(l => l.distance > 0 && l.durationSecs > 0);
  if (!valid.length) return null;
  const best = valid.reduce((b, l) => {
    const pace = l.durationSecs / l.distance;
    return pace < b.pace ? { pace, log: l } : b;
  }, { pace: Infinity, log: null });
  return formatDuration(best.pace);
}

/** Average pace across all runs */
export function avgPace(runLogs) {
  const valid = runLogs.filter(l => l.distance > 0 && l.durationSecs > 0);
  if (!valid.length) return null;
  const totalPaceSecs = valid.reduce((s, l) => s + l.durationSecs / l.distance, 0);
  return formatDuration(totalPaceSecs / valid.length);
}

/** Longest single run */
export function longestRun(runLogs) {
  if (!runLogs.length) return 0;
  return Math.max(...runLogs.map(l => l.distance));
}

/** Group gym logs by exercise and return best volume session per exercise */
export function getPRs(gymLogs) {
  const map = {};
  for (const log of gymLogs) {
    const vol = log.sets * log.reps * log.weight;
    if (!map[log.exercise] || vol > map[log.exercise].volume) {
      map[log.exercise] = { exercise: log.exercise, volume: vol, date: log.date, muscle: log.muscle };
    }
  }
  return Object.values(map).sort((a, b) => b.volume - a.volume);
}

/** Muscle group distribution from gym logs (last N days, or all) */
export function muscleDistribution(gymLogs) {
  const counts = {};
  for (const log of gymLogs) {
    const m = log.muscle || 'Other';
    counts[m] = (counts[m] || 0) + log.sets;
  }
  const total = Object.values(counts).reduce((s, v) => s + v, 0);
  return Object.entries(counts)
    .map(([muscle, sets]) => ({ muscle, sets, pct: total ? Math.round((sets / total) * 100) : 0 }))
    .sort((a, b) => b.sets - a.sets);
}

// ── Smart Insights Engine ─────────────────────────────────────

/**
 * Generates analytics insights + smart suggestions based on gym/run logs.
 * Returns: { insights: string[], suggestions: string[] }
 */
export function generateInsights(gymLogs, runLogs) {
  const insights = [];
  const suggestions = [];
  const now = Date.now();

  const weekAgo = now - 7 * 86400000;
  const gymWeek = gymLogs.filter(l => new Date(l.date).getTime() >= weekAgo);
  const runWeek = runLogs.filter(l => new Date(l.date).getTime() >= weekAgo);

  // ── Muscle group distribution this week ──────────────────
  const muscleCounts = {};
  for (const log of gymWeek) {
    const m = log.muscle || 'Other';
    muscleCounts[m] = (muscleCounts[m] || 0) + log.sets;
  }
  const totalSets = Object.values(muscleCounts).reduce((s, v) => s + v, 0);
  for (const [muscle, count] of Object.entries(muscleCounts)) {
    const pct = totalSets ? Math.round((count / totalSets) * 100) : 0;
    if (pct >= 25) {
      insights.push(`You trained ${muscle} ${pct}% of your sets this week`);
    }
  }

  // ── Weekly run distance ──────────────────────────────────
  const weekDist = runWeek.reduce((s, l) => s + l.distance, 0);
  if (weekDist >= 20) insights.push(`Strong running week — ${weekDist.toFixed(1)} km covered 💪`);
  else if (weekDist > 0) insights.push(`You ran ${weekDist.toFixed(1)} km this week`);

  // ── Consistency ──────────────────────────────────────────
  const activeDaysGym = new Set(gymWeek.map(l => l.date)).size;
  if (activeDaysGym >= 5) insights.push(`Gym consistency excellent — ${activeDaysGym} active days this week`);
  else if (activeDaysGym >= 3) insights.push(`${activeDaysGym} gym sessions completed this week`);

  // ── Volume surge ─────────────────────────────────────────
  const prevWeekStart = now - 14 * 86400000;
  const gymPrevWeek = gymLogs.filter(l => {
    const t = new Date(l.date).getTime();
    return t >= prevWeekStart && t < weekAgo;
  });
  const volThis = gymWeek.reduce((s, l) => s + l.sets * l.reps * l.weight, 0);
  const volPrev = gymPrevWeek.reduce((s, l) => s + l.sets * l.reps * l.weight, 0);
  if (volPrev > 0 && volThis > volPrev * 1.15) {
    const gain = Math.round(((volThis - volPrev) / volPrev) * 100);
    insights.push(`Volume up ${gain}% vs last week — great progressive overload!`);
  }

  // ── Muscle group neglect suggestions ────────────────────
  const allMuscles = ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core'];
  for (const muscle of allMuscles) {
    const muscleLogs = gymLogs.filter(l => l.muscle === muscle);
    const lastLog = muscleLogs.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    const totalSets = muscleLogs.reduce((sum, l) => sum + l.sets, 0);

    if (!lastLog) {
      suggestions.push({ 
        text: `You haven't logged a ${muscle} workout yet — get started!`, 
        type: 'warning', 
        muscle, 
        isMuscle: true,
        daysSince: 9999,
        totalSets
      });
    } else {
      const daysSince = Math.floor((now - new Date(lastLog.date).getTime()) / 86400000);
      if (daysSince >= 7) {
        suggestions.push({ text: `You haven't trained ${muscle} in ${daysSince} days`, type: 'red', muscle, isMuscle: true, daysSince, totalSets });
      } else if (daysSince >= 4) {
        suggestions.push({ text: `${muscle} is due for a session (${daysSince} days ago)`, type: 'warning', muscle, isMuscle: true, daysSince, totalSets });
      }
    }
  }

  // ── Running gap ──────────────────────────────────────────
  if (runLogs.length > 0) {
    const lastRun = runLogs.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    const daysSince = Math.floor((now - new Date(lastRun.date).getTime()) / 86400000);
    if (daysSince >= 7) {
      suggestions.push({ text: `No runs logged in ${daysSince} days — lace up!`, type: 'red' });
    } else if (daysSince >= 4) {
      suggestions.push({ text: `Last run was ${daysSince} days ago`, type: 'warning' });
    }
  } else {
    suggestions.push({ text: 'No runs logged yet — track your first run!', type: 'blue' });
  }

  // ── Positive reinforcement ───────────────────────────────
  const todayStr = today();
  const trainedToday = gymLogs.some(l => l.date === todayStr) || runLogs.some(l => l.date === todayStr);
  if (trainedToday) {
    insights.push("You've already trained today — great work! 🔥");
  }

  return { insights: insights.slice(0, 5), suggestions: suggestions.slice(0, 6) };
}
