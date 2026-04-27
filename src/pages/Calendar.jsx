import { useState, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { today } from '../utils/calculations';
import { TITLES } from '../utils/planGenerator';

// ── Helpers ──────────────────────────────────────────────────

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

/**
 * Returns all calendar cells for a given month (including leading/trailing days)
 * so that the week always starts on Monday.
 */
function getCalendarCells(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // Mon=0..Sun=6
  const startOffset = (firstDay.getDay() + 6) % 7;
  const cells = [];
  // Fill leading days from prev month
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    cells.push({ date: isoDate(d), inMonth: false });
  }
  // Fill current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    cells.push({ date: isoDate(date), inMonth: true });
  }
  // Fill trailing days to complete grid (always fill to complete rows)
  while (cells.length % 7 !== 0) {
    const d = new Date(year, month + 1, cells.length - lastDay.getDate() - startOffset + 1);
    cells.push({ date: isoDate(d), inMonth: false });
  }
  return cells;
}

function formatDayFull(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

function formatMonthFull(year, month) {
  return new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  });
}

function isPastDate(dateStr) {
  return dateStr < today();
}

// ── CheckBox ─────────────────────────────────────────────────
function CheckBox({ checked, color = 'lime' }) {
  return (
    <div className={`check-box${checked ? (color === 'blue' ? ' checked-blue' : ' checked') : ''}`}>
      {checked && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
  );
}

// ── Day Detail Modal ─────────────────────────────────────────
function DayDetailModal({ day, onClose, onEdit, onDelete }) {
  const { toggleExerciseComplete, toggleDayComplete } = useApp();

  const typeColor = day.type === 'gym' ? 'accent' : day.type === 'run' ? 'blue' : 'muted';
  const typeLabel = day.type === 'gym' ? '🏋️ Gym' : day.type === 'run' ? '🏃 Run' : '😴 Rest';

  const allDone = day.type === 'gym'
    ? day.exercises.length > 0 && day.completedExercises.length === day.exercises.length
    : false;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="day-detail-date">{formatDayFull(day.date)}</div>
            <div className="day-detail-title">{day.title}</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <span className={`badge badge-${typeColor}`}>{typeLabel}</span>
            <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Gym Exercises Checklist */}
        {day.type === 'gym' && (
          <div>
            {day.exercises.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px 0' }}>
                <p>No exercises defined</p>
                <small>Click Edit to add exercises</small>
              </div>
            ) : (
              <div className="exercise-checklist">
                {day.exercises.map(ex => {
                  const done = day.completedExercises.includes(ex.id);
                  return (
                    <div
                      key={ex.id}
                      className={`ex-check-item${done ? ' done' : ''}`}
                      onClick={() => toggleExerciseComplete(day.id, ex.id)}
                    >
                      <CheckBox checked={done} color="lime" />
                      <div className="ex-info">
                        <div className="ex-name">{ex.name}</div>
                        <div className="ex-meta">
                          {ex.sets} sets × {ex.reps} reps
                          {ex.weight > 0 && ` @ ${ex.weight}kg`}
                          {ex.muscle && ` · ${ex.muscle}`}
                        </div>
                      </div>
                      {done && <span style={{ fontSize: 10, color: 'var(--accent)' }}>✓</span>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Progress summary */}
            {day.exercises.length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="progress-bar" style={{ flex: 1 }}>
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.round((day.completedExercises.length / day.exercises.length) * 100)}%` }}
                  />
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {day.completedExercises.length}/{day.exercises.length} done
                </span>
              </div>
            )}
          </div>
        )}

        {/* Run info */}
        {day.type === 'run' && (
          <div style={{
            background: 'var(--blue-glow)',
            border: '1px solid rgba(var(--blue-rgb),0.2)',
            borderRadius: 'var(--radius)',
            padding: '12px',
            display: 'flex', gap: 16,
          }}>
            <div>
              <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 3 }}>Target</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--blue)' }}>{day.targetDistance || '—'}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' }}> km</span></div>
            </div>
            {day.targetDuration && (
              <div>
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 3 }}>Est. Time</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{day.targetDuration}</div>
              </div>
            )}
          </div>
        )}

        {/* Rest Day */}
        {day.type === 'rest' && (
          <div style={{
            textAlign: 'center', padding: '20px 0',
            color: 'var(--text-muted)', fontSize: 32,
          }}>
            😴<div style={{ fontSize: 12, marginTop: 8 }}>Recovery day — rest well</div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
          <button
            className={`btn ${day.completed ? 'btn-secondary' : 'btn-primary'} btn-sm`}
            style={{ flex: 1 }}
            onClick={() => { toggleDayComplete(day.id); onClose(); }}
          >
            {day.completed ? '↩ Mark Incomplete' : '✓ Mark Complete'}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onEdit}>
            ✏ Edit
          </button>
          <button className="btn btn-danger btn-sm" onClick={onDelete}>
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Day Edit Modal ────────────────────────────────────────────
function DayEditModal({ day, onSave, onClose }) {
  const [form, setForm] = useState({
    type: day?.type || 'gym',
    title: day?.title || '',
    targetDistance: day?.targetDistance || '',
    targetDuration: day?.targetDuration || '',
    exercises: day?.exercises || [],
  });
  const [newEx, setNewEx] = useState({ name: '', sets: 3, reps: 10, weight: 0 });

  const addEx = () => {
    if (!newEx.name.trim()) return;
    setForm(f => ({
      ...f,
      exercises: [...f.exercises, { ...newEx, id: crypto.randomUUID(), sets: +newEx.sets, reps: +newEx.reps, weight: +newEx.weight }],
    }));
    setNewEx({ name: '', sets: 3, reps: 10, weight: 0 });
  };

  const removeEx = (id) => setForm(f => ({ ...f, exercises: f.exercises.filter(e => e.id !== id) }));

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave({
      ...day,
      type: form.type,
      title: form.title,
      targetDistance: form.type === 'run' ? +form.targetDistance : undefined,
      targetDuration: form.type === 'run' ? form.targetDuration : undefined,
      exercises: form.type === 'gym' ? form.exercises : [],
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{day ? 'Edit Day' : 'Add Day'}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-row form-row-3">
            {['gym', 'run', 'rest'].map(t => (
              <button
                key={t}
                type="button"
                className={`btn btn-sm ${form.type === t ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setForm(f => ({ ...f, type: t }))}
                style={{ justifyContent: 'center' }}
              >
                {t === 'gym' ? '🏋️' : t === 'run' ? '🏃' : '😴'} {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              className="form-input"
              value={form.title}
              placeholder={form.type === 'gym' ? 'Push Day' : form.type === 'run' ? '5km Run' : 'Rest Day'}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>

          {form.type === 'run' && (
            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Distance (km)</label>
                <input type="number" className="form-input" value={form.targetDistance}
                  onChange={e => setForm(f => ({ ...f, targetDistance: e.target.value }))} min="0" step="0.5" />
              </div>
              <div className="form-group">
                <label className="form-label">Est. Duration</label>
                <input type="text" className="form-input" value={form.targetDuration}
                  placeholder="25:00" onChange={e => setForm(f => ({ ...f, targetDuration: e.target.value }))} />
              </div>
            </div>
          )}

          {form.type === 'gym' && (
            <div>
              <label className="form-label" style={{ marginBottom: 6, display: 'block' }}>Exercises</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                {form.exercises.map(ex => (
                  <div key={ex.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 10px', background: 'var(--surface-2)',
                    border: '1px solid var(--border)', borderRadius: 8,
                  }}>
                    <span style={{ flex: 1, fontSize: 11 }}>{ex.name}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{ex.sets}×{ex.reps}</span>
                    <button className="btn btn-ghost btn-icon text-danger" style={{ padding: 3 }} onClick={() => removeEx(ex.id)}>✕</button>
                  </div>
                ))}
              </div>
              {/* Add exercise inline */}
              <div style={{ display: 'flex', gap: 5 }}>
                <input className="form-input" placeholder="Exercise name" value={newEx.name}
                  onChange={e => setNewEx(n => ({ ...n, name: e.target.value }))}
                  style={{ flex: 2 }}
                  onKeyDown={e => e.key === 'Enter' && addEx()}
                />
                <input type="number" className="form-input" value={newEx.sets} min="1"
                  onChange={e => setNewEx(n => ({ ...n, sets: e.target.value }))} style={{ width: 52 }} placeholder="Sets" />
                <input type="number" className="form-input" value={newEx.reps} min="1"
                  onChange={e => setNewEx(n => ({ ...n, reps: e.target.value }))} style={{ width: 52 }} placeholder="Reps" />
                <button className="btn btn-primary btn-sm" onClick={addEx}>+</button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Calendar Page ─────────────────────────────────────────────
export default function Calendar() {
  const {
    schedule,
    addScheduleDay,
    updateScheduleDay,
    deleteScheduleDay,
    clearSchedule,
  } = useApp();

  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selectedDayId, setSelectedDayId] = useState(null);
  const [editingDay, setEditingDay] = useState(null);
  const [addDate, setAddDate] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const todayStr = today();

  // Map schedule by date for fast lookup
  const scheduleMap = useMemo(() => {
    const m = {};
    for (const d of schedule) m[d.date] = d;
    return m;
  }, [schedule]);

  const calendarCells = useMemo(
    () => getCalendarCells(viewDate.year, viewDate.month),
    [viewDate]
  );

  const prevMonth = () => setViewDate(v => {
    if (v.month === 0) return { year: v.year - 1, month: 11 };
    return { year: v.year, month: v.month - 1 };
  });
  const nextMonth = () => setViewDate(v => {
    if (v.month === 11) return { year: v.year + 1, month: 0 };
    return { year: v.year, month: v.month + 1 };
  });

  const handleCellClick = useCallback((dateStr, inMonth) => {
    if (!inMonth) return;
    const day = scheduleMap[dateStr];
    if (day) {
      setSelectedDayId(day.id);
    } else {
      // Offer to add new entry
      setAddDate(dateStr);
    }
  }, [scheduleMap]);

  // Always derive the live day from scheduleMap so the modal reflects latest state
  const selectedDay = useMemo(() => {
    if (!selectedDayId) return null;
    return schedule.find(d => d.id === selectedDayId) || null;
  }, [selectedDayId, schedule]);

  const handleEdit = () => {
    setEditingDay(selectedDay);
    setSelectedDayId(null);
  };

  const handleDelete = () => {
    if (selectedDay) deleteScheduleDay(selectedDay.id);
    setSelectedDayId(null);
  };

  const handleSaveEdit = (updated) => {
    if (typeof editingDay === 'string') {
      // New entry for addDate
      addScheduleDay(updated);
    } else {
      updateScheduleDay(updated.id, updated);
    }
    setEditingDay(null);
  };

  const handleAddDay = (type) => {
    const title = type === 'gym' ? 'Gym Session' : type === 'run' ? 'Run' : 'Rest Day';
    setEditingDay('new');
    setAddDate(prev => prev);
    // Open edit modal prefilled
    setEditingDay({
      id: null,
      date: addDate,
      type,
      title,
      exercises: [],
      completedExercises: [],
      completed: false,
    });
    setAddDate(null);
  };

  // Summary stats for the month
  const monthStats = useMemo(() => {
    const monthDays = calendarCells.filter(c => c.inMonth).map(c => scheduleMap[c.date]).filter(Boolean);
    const total = monthDays.length;
    const completed = monthDays.filter(d => d.completed).length;
    const gymDays = monthDays.filter(d => d.type === 'gym').length;
    const runDays = monthDays.filter(d => d.type === 'run').length;
    return { total, completed, gymDays, runDays };
  }, [calendarCells, scheduleMap]);

  const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em' }}>Calendar</h2>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Your training schedule</p>
        </div>

        {/* Clear Plan button */}
        {schedule.length > 0 && (
          confirmClear ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Clear all {schedule.length} days?</span>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => { clearSchedule(); setConfirmClear(false); setSelectedDayId(null); }}
              >
                Yes, clear
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setConfirmClear(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--danger)', borderColor: 'rgba(var(--danger-rgb),0.25)' }}
              onClick={() => setConfirmClear(true)}
            >
              🗑 Clear Plan
            </button>
          )
        )}

        {schedule.length === 0 && (
          <span className="badge badge-warning">No plan generated</span>
        )}
      </div>

      {/* Month Stats */}
      {monthStats.total > 0 && (
        <div className="section">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {[
              { label: 'Planned', value: monthStats.total, color: 'var(--text)' },
              { label: 'Done', value: monthStats.completed, color: 'var(--accent)' },
              { label: 'Gym', value: monthStats.gymDays, color: 'var(--accent)' },
              { label: 'Runs', value: monthStats.runDays, color: 'var(--blue)' },
            ].map(s => (
              <div key={s.label} className="card card-xs" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Month Navigation */}
      <div className="calendar-nav">
        <button className="calendar-nav-btn" onClick={prevMonth}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <span className="calendar-month-label">{formatMonthFull(viewDate.year, viewDate.month)}</span>
        <button className="calendar-nav-btn" onClick={nextMonth}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid" style={{ marginBottom: 4 }}>
        {DAY_HEADERS.map(d => (
          <div key={d} className="calendar-day-header">{d}</div>
        ))}
        {calendarCells.map(({ date, inMonth }) => {
          const day = scheduleMap[date];
          const isToday = date === todayStr;
          const isPast = isPastDate(date) && date !== todayStr;

          let cellClass = 'cal-cell';
          if (!inMonth) cellClass += ' other-month';
          if (isToday) cellClass += ' is-today';
          if (day) {
            if (day.type === 'gym') cellClass += ' has-gym';
            else if (day.type === 'run') cellClass += ' has-run';
            else cellClass += ' has-rest';
            if (day.completed) cellClass += ' completed';
            else if (isPast && !day.completed && day.type !== 'rest') cellClass += ' missed';
          }

          const shortLabel = day
            ? day.type === 'rest'
              ? 'Rest'
              : day.type === 'run'
              ? `${day.targetDistance || '?'}km`
              : (day.title || 'Workout').replace(' Day', '').replace(' Body', '').slice(0, 8)
            : null;

          return (
            <div
              key={date}
              className={cellClass}
              onClick={() => handleCellClick(date, inMonth)}
            >
              <span className="cal-date">{parseInt(date.slice(8))}</span>
              {shortLabel && (
                <>
                  <span className="cal-label">{shortLabel}</span>
                  {day?.completed && (
                    <span className="cal-status" style={{ color: 'var(--accent)' }}>✓</span>
                  )}
                  {isPast && !day?.completed && day?.type !== 'rest' && (
                    <span className="cal-status" style={{ color: 'var(--text-dim)' }}>×</span>
                  )}
                </>
              )}
              {!day && inMonth && !isToday && (
                <span style={{ fontSize: 7, color: 'var(--text-dim)', marginTop: 'auto' }}>+ add</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
        {[
          { color: 'var(--accent)', label: 'Gym' },
          { color: 'var(--blue)', label: 'Run' },
          { color: 'var(--text-dim)', label: 'Rest' },
          { color: 'var(--accent)', label: '✓ Done' },
          { color: 'var(--text-dim)', label: '× Missed' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, display: 'inline-block' }} />
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Add prompt when clicking empty cell */}
      {addDate && !editingDay && (
        <div className="modal-overlay" onClick={() => setAddDate(null)}>
          <div className="modal" style={{ maxWidth: 320 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Add to {formatDayFull(addDate)}</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setAddDate(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['gym', 'run', 'rest'].map(t => (
                <button
                  key={t}
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: 'center', flexDirection: 'column', gap: 4, paddingTop: 12, paddingBottom: 12 }}
                  onClick={() => handleAddDay(t)}
                >
                  <span style={{ fontSize: 18 }}>{t === 'gym' ? '🏋️' : t === 'run' ? '🏃' : '😴'}</span>
                  <span style={{ fontSize: 10, textTransform: 'capitalize' }}>{t}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Day Detail Modal */}
      {selectedDay && !editingDay && (
        <DayDetailModal
          day={selectedDay}
          onClose={() => setSelectedDayId(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Edit/Add Modal */}
      {editingDay && (
        <DayEditModal
          day={editingDay}
          onSave={handleSaveEdit}
          onClose={() => setEditingDay(null)}
        />
      )}
    </div>
  );
}
