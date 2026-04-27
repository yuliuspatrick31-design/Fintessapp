import { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_EXERCISES } from '../data/exercises';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [gymLogs, setGymLogs] = useLocalStorage('ft_gymLogs', []);
  const [runLogs, setRunLogs] = useLocalStorage('ft_runLogs', []);
  const [exercises, setExercises] = useLocalStorage('ft_exercises', DEFAULT_EXERCISES);
  const [schedule, setSchedule] = useLocalStorage('ft_schedule', []);

  // ── Gym Logs ──────────────────────────────────────────────
  const addGymLog = (log) => {
    const entry = { ...log, id: crypto.randomUUID() };
    setGymLogs(prev => [entry, ...prev]);
  };
  const deleteGymLog = (id) => setGymLogs(prev => prev.filter(l => l.id !== id));

  // ── Run Logs ──────────────────────────────────────────────
  const addRunLog = (log) => {
    const entry = { ...log, id: crypto.randomUUID() };
    setRunLogs(prev => [entry, ...prev]);
  };
  const deleteRunLog = (id) => setRunLogs(prev => prev.filter(l => l.id !== id));

  // ── Exercise Library ──────────────────────────────────────
  const addExercise = (ex) => {
    const entry = { ...ex, id: crypto.randomUUID() };
    setExercises(prev => [...prev, entry]);
    return entry;
  };
  const updateExercise = (id, updates) =>
    setExercises(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  const deleteExercise = (id) =>
    setExercises(prev => prev.filter(e => e.id !== id));

  // ── Schedule ──────────────────────────────────────────────
  const setSchedulePlan = (days) => setSchedule(days);

  const updateScheduleDay = (id, updates) =>
    setSchedule(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));

  const deleteScheduleDay = (id) =>
    setSchedule(prev => prev.filter(d => d.id !== id));

  const clearSchedule = () => setSchedule([]);

  const addScheduleDay = (day) => {
    const entry = { ...day, id: crypto.randomUUID() };
    setSchedule(prev => {
      // Insert in date order, replacing if same date
      const filtered = prev.filter(d => d.date !== entry.date);
      return [...filtered, entry].sort((a, b) => a.date.localeCompare(b.date));
    });
  };

  /** Toggle a single exercise completed within a schedule day */
  const toggleExerciseComplete = (dayId, exerciseId) => {
    setSchedule(prev => prev.map(d => {
      if (d.id !== dayId) return d;
      const already = d.completedExercises.includes(exerciseId);
      const completedExercises = already
        ? d.completedExercises.filter(id => id !== exerciseId)
        : [...d.completedExercises, exerciseId];
      // Auto-complete day when all gym exercises are ticked
      const allDone = d.exercises.length > 0 &&
        completedExercises.length === d.exercises.length;
      return { ...d, completedExercises, completed: allDone || d.completed };
    }));
  };

  /** Toggle whole day completed */
  const toggleDayComplete = (dayId) => {
    setSchedule(prev => prev.map(d => {
      if (d.id !== dayId) return d;
      const completed = !d.completed;
      // If marking complete, tick all exercises too
      const completedExercises = completed
        ? d.exercises.map(e => e.id)
        : [];
      return { ...d, completed, completedExercises };
    }));
  };

  return (
    <AppContext.Provider value={{
      gymLogs,
      runLogs,
      exercises,
      schedule,
      addGymLog,
      deleteGymLog,
      addRunLog,
      deleteRunLog,
      addExercise,
      updateExercise,
      deleteExercise,
      setSchedulePlan,
      updateScheduleDay,
      deleteScheduleDay,
      addScheduleDay,
      clearSchedule,
      toggleExerciseComplete,
      toggleDayComplete,
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
