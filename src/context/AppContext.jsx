import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DEFAULT_EXERCISES } from '../data/exercises';

const AppContext = createContext(null);

// ── localStorage helpers for dev-bypass mode ───────────────
const ls = {
  get: (key, def) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; } },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
};

export function AppProvider({ children, userId }) {
  const isDev = userId === 'dev-bypass';

  const [gymLogs,   setGymLogs]   = useState([]);
  const [runLogs,   setRunLogs]   = useState([]);
  const [exercises, setExercises] = useState([]);
  const [schedule,  setSchedule]  = useState([]);
  const [dbReady,   setDbReady]   = useState(false);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('fittrack_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fittrack_theme', theme);
  }, [theme]);

  // ── Bootstrap: fetch all user data on mount ───────────────────
  useEffect(() => {
    if (!userId) return;
    fetchAll();
  }, [userId]);

  async function fetchAll() {
    setDbReady(false);

    if (isDev) {
      // ── Dev mode: use localStorage ──
      setGymLogs(ls.get('dev_gymLogs', []));
      setRunLogs(ls.get('dev_runLogs', []));
      const ex = ls.get('dev_exercises', []);
      setExercises(ex.length ? ex : DEFAULT_EXERCISES);
      if (!ex.length) ls.set('dev_exercises', DEFAULT_EXERCISES);
      setSchedule(ls.get('dev_schedule', []));
      setDbReady(true);
      return;
    }

    const [gymRes, runRes, exRes, schedRes] = await Promise.all([
      supabase.from('fit_gym_logs').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('fit_run_logs').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('fit_exercises').select('*').eq('user_id', userId).order('created_at'),
      supabase.from('fit_schedule').select('*').eq('user_id', userId).order('date'),
    ]);

    setGymLogs(gymRes.data || []);
    setRunLogs(runRes.data || []);

    // Seed default exercises if the user has none yet
    let exData = exRes.data || [];
    if (exData.length === 0) {
      const toInsert = DEFAULT_EXERCISES.map(e => ({ ...e, user_id: userId }));
      const { data: seeded } = await supabase.from('fit_exercises').insert(toInsert).select();
      exData = seeded || DEFAULT_EXERCISES;
    }
    setExercises(exData);

    setSchedule((schedRes.data || []).map(rowToSchedule));
    setDbReady(true);
  }

  // ── Row mappers ───────────────────────────────────────────────
  const rowToSchedule = (row) => ({
    ...row,
    title:               row.title || row.program_name || (row.type === 'run' ? 'Run' : row.type === 'rest' ? 'Rest Day' : 'Gym Session'),
    exercises:           row.exercises           || [],
    completedExercises:  row.completed_exercises  || [],
  });

  const scheduleToRow = (day) => ({
    id:                   day.id,
    user_id:              userId,
    date:                 day.date,
    type:                 day.type,
    exercises:            day.exercises           || [],
    completed:            day.completed           || false,
    completed_exercises:  day.completedExercises  || [],
    notes:                day.notes               || null,
    program_name:         day.title               || day.programName || null,
  });

  // ── Gym Logs ───────────────────────────────────────────
  const addGymLog = async (log) => {
    if (isDev) {
      const entry = { ...log, id: crypto.randomUUID() };
      const next = [entry, ...gymLogs];
      setGymLogs(next); ls.set('dev_gymLogs', next); return;
    }
    const entry = { ...log, user_id: userId };
    const { data, error } = await supabase.from('fit_gym_logs').insert(entry).select().single();
    if (!error && data) setGymLogs(prev => [data, ...prev]);
  };

  const deleteGymLog = async (id) => {
    if (isDev) {
      const next = gymLogs.filter(l => l.id !== id);
      setGymLogs(next); ls.set('dev_gymLogs', next); return;
    }
    await supabase.from('fit_gym_logs').delete().eq('id', id);
    setGymLogs(prev => prev.filter(l => l.id !== id));
  };

  // ── Run Logs ───────────────────────────────────────────
  const addRunLog = async (log) => {
    if (isDev) {
      const entry = { ...log, id: crypto.randomUUID() };
      const next = [entry, ...runLogs];
      setRunLogs(next); ls.set('dev_runLogs', next); return;
    }
    const entry = { ...log, user_id: userId };
    const { data, error } = await supabase.from('fit_run_logs').insert(entry).select().single();
    if (!error && data) setRunLogs(prev => [data, ...prev]);
  };

  const deleteRunLog = async (id) => {
    if (isDev) {
      const next = runLogs.filter(l => l.id !== id);
      setRunLogs(next); ls.set('dev_runLogs', next); return;
    }
    await supabase.from('fit_run_logs').delete().eq('id', id);
    setRunLogs(prev => prev.filter(l => l.id !== id));
  };

  // ── Exercise Library ────────────────────────────────────
  const addExercise = async (ex) => {
    if (isDev) {
      const entry = { ...ex, id: ex.id || crypto.randomUUID() };
      const next = [...exercises, entry];
      setExercises(next); ls.set('dev_exercises', next); return entry;
    }
    const entry = { ...ex, id: ex.id || crypto.randomUUID(), user_id: userId };
    const { data, error } = await supabase.from('fit_exercises').insert(entry).select().single();
    if (!error && data) {
      setExercises(prev => [...prev, data]);
      return data;
    }
    return entry;
  };

  const updateExercise = async (id, updates) => {
    if (isDev) {
      const next = exercises.map(e => e.id === id ? { ...e, ...updates } : e);
      setExercises(next); ls.set('dev_exercises', next); return;
    }
    await supabase.from('fit_exercises').update(updates).eq('id', id);
    setExercises(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteExercise = async (id) => {
    if (isDev) {
      const next = exercises.filter(e => e.id !== id);
      setExercises(next); ls.set('dev_exercises', next); return;
    }
    await supabase.from('fit_exercises').delete().eq('id', id);
    setExercises(prev => prev.filter(e => e.id !== id));
  };

  // ── Schedule ───────────────────────────────────────────
  const setSchedulePlan = async (days) => {
    if (isDev) { setSchedule(days); ls.set('dev_schedule', days); return; }
    const rows = days.map(scheduleToRow);
    const { data, error } = await supabase.from('fit_schedule').upsert(rows, { onConflict: 'id' }).select();
    if (!error && data) setSchedule(data.map(rowToSchedule));
    else setSchedule(days);
  };

  const addScheduleDay = async (day) => {
    const entry = { ...day, id: day.id || crypto.randomUUID(), completedExercises: day.completedExercises || [] };
    if (isDev) {
      const next = [...schedule.filter(d => d.date !== entry.date), entry]
        .sort((a, b) => a.date.localeCompare(b.date));
      setSchedule(next); ls.set('dev_schedule', next); return;
    }
    const row = scheduleToRow(entry);
    const { data, error } = await supabase.from('fit_schedule').upsert(row, { onConflict: 'id' }).select().single();
    const saved = !error && data ? rowToSchedule(data) : entry;
    setSchedule(prev => {
      const filtered = prev.filter(d => d.date !== saved.date);
      return [...filtered, saved].sort((a, b) => a.date.localeCompare(b.date));
    });
  };

  const updateScheduleDay = async (id, updates) => {
    const current = schedule.find(d => d.id === id);
    if (!current) return;
    const merged = { ...current, ...updates };
    if (isDev) {
      const next = schedule.map(d => d.id === id ? merged : d);
      setSchedule(next); ls.set('dev_schedule', next); return;
    }
    const row = scheduleToRow(merged);
    await supabase.from('fit_schedule').update(row).eq('id', id);
    setSchedule(prev => prev.map(d => d.id === id ? merged : d));
  };

  const deleteScheduleDay = async (id) => {
    if (isDev) {
      const next = schedule.filter(d => d.id !== id);
      setSchedule(next); ls.set('dev_schedule', next); return;
    }
    await supabase.from('fit_schedule').delete().eq('id', id);
    setSchedule(prev => prev.filter(d => d.id !== id));
  };

  const clearSchedule = async () => {
    if (isDev) { setSchedule([]); ls.set('dev_schedule', []); return; }
    await supabase.from('fit_schedule').delete().eq('user_id', userId);
    setSchedule([]);
  };

  const toggleExerciseComplete = async (dayId, exerciseId) => {
    const day = schedule.find(d => d.id === dayId);
    if (!day) return;
    const already = day.completedExercises.includes(exerciseId);
    const completedExercises = already
      ? day.completedExercises.filter(id => id !== exerciseId)
      : [...day.completedExercises, exerciseId];
    const allDone = day.exercises.length > 0 && completedExercises.length === day.exercises.length;
    const updated = { ...day, completedExercises, completed: allDone || day.completed };
    if (isDev) {
      const next = schedule.map(d => d.id === dayId ? updated : d);
      setSchedule(next); ls.set('dev_schedule', next); return;
    }
    await supabase.from('fit_schedule').update(scheduleToRow(updated)).eq('id', dayId);
    setSchedule(prev => prev.map(d => d.id === dayId ? updated : d));
  };

  const toggleDayComplete = async (dayId) => {
    const day = schedule.find(d => d.id === dayId);
    if (!day) return;
    const completed = !day.completed;
    const completedExercises = completed ? day.exercises.map(e => e.id) : [];
    const updated = { ...day, completed, completedExercises };
    await supabase.from('fit_schedule').update(scheduleToRow(updated)).eq('id', dayId);
    setSchedule(prev => prev.map(d => d.id === dayId ? updated : d));
  };

  return (
    <AppContext.Provider value={{
      gymLogs, runLogs, exercises, schedule, dbReady, theme, setTheme,
      addGymLog, deleteGymLog,
      addRunLog, deleteRunLog,
      addExercise, updateExercise, deleteExercise,
      setSchedulePlan, addScheduleDay, updateScheduleDay,
      deleteScheduleDay, clearSchedule,
      toggleExerciseComplete, toggleDayComplete,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
