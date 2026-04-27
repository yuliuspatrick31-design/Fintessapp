import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MUSCLE_GROUPS, EXERCISE_TYPES, EQUIPMENT_LIST } from '../data/exercises';
import { totalVolume, today, fmtDate } from '../utils/calculations';

function ExercisePicker({ exercises, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterEquip, setFilterEquip] = useState('All');

  const filtered = useMemo(() => {
    return exercises.filter(e => {
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
      const matchMuscle = filterMuscle === 'All' || e.muscle === filterMuscle;
      const matchType = filterType === 'All' || e.type === filterType;
      const matchEquip = filterEquip === 'All' || e.equipment === filterEquip;
      return matchSearch && matchMuscle && matchType && matchEquip;
    });
  }, [exercises, search, filterMuscle, filterType, filterEquip]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Pick Exercise</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <input
          className="form-input"
          placeholder="Search exercises…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
          style={{ marginBottom: 10 }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
          <div className="chip-row">
            {MUSCLE_GROUPS.map(m => (
              <button key={m} className={`chip${filterMuscle === m ? ' active' : ''}`} onClick={() => setFilterMuscle(m)}>{m}</button>
            ))}
          </div>
          <div className="chip-row">
            {EXERCISE_TYPES.map(t => (
              <button key={t} className={`chip${filterType === t ? ' active' : ''}`} onClick={() => setFilterType(t)}>{t}</button>
            ))}
          </div>
          <div className="chip-row">
            {EQUIPMENT_LIST.map(eq => (
              <button key={eq} className={`chip${filterEquip === eq ? ' active' : ''}`} onClick={() => setFilterEquip(eq)}>{eq}</button>
            ))}
          </div>
        </div>

        <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.length === 0 && (
            <div className="empty-state"><p>No exercises found</p></div>
          )}
          {filtered.map(ex => (
            <button
              key={ex.id}
              onClick={() => { onSelect(ex); onClose(); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 10px', borderRadius: 8,
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                cursor: 'pointer', transition: 'all 0.12s',
                textAlign: 'left',
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{ex.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{ex.muscle} · {ex.equipment}</div>
              </div>
              <span className={`badge badge-${ex.type === 'Compound' ? 'accent' : 'muted'}`}>{ex.type}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GymTracker() {
  const { gymLogs, addGymLog, deleteGymLog, exercises } = useApp();

  const [showPicker, setShowPicker] = useState(false);
  const [filterMuscle, setFilterMuscle] = useState(() => {
    return localStorage.getItem('fittrack_preselect_muscle') || 'All';
  });

  useEffect(() => {
    localStorage.removeItem('fittrack_preselect_muscle');
  }, []);

  const [form, setForm] = useState({
    date: today(),
    exercise: '',
    muscle: '',
    type: '',
    sets: 3,
    reps: 10,
    weight: 60,
  });

  const handleSelectExercise = (ex) => {
    setForm(f => ({ ...f, exercise: ex.name, muscle: ex.muscle, type: ex.type }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.exercise) return;
    addGymLog({ ...form, sets: +form.sets, reps: +form.reps, weight: +form.weight });
    setForm(f => ({ ...f, exercise: '', muscle: '', type: '', sets: 3, reps: 10, weight: 60 }));
  };

  // PR detection: best volume (sets × reps × weight) per exercise
  const prMap = useMemo(() => {
    const map = {};
    for (const log of gymLogs) {
      const vol = log.sets * log.reps * log.weight;
      if (!map[log.exercise] || vol > map[log.exercise]) {
        map[log.exercise] = vol;
      }
    }
    return map;
  }, [gymLogs]);

  const currentSessionVolume = form.exercise
    ? (+form.sets) * (+form.reps) * (+form.weight)
    : 0;
  const isPR = form.exercise && prMap[form.exercise]
    ? currentSessionVolume > prMap[form.exercise]
    : false;

  const filteredLogs = useMemo(() => {
    return gymLogs.filter(l => filterMuscle === 'All' || l.muscle === filterMuscle);
  }, [gymLogs, filterMuscle]);

  return (
    <div>
      <div className="page-header">
        <h2>Gym Tracker</h2>
        <p>Log sets, track volume, and hit PRs</p>
      </div>

      {/* ── Log Form ─────────────────────────────────────────── */}
      <div className="section">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Log Set</span>
            {isPR && <span className="badge badge-accent">🏆 New PR</span>}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setShowPicker(true)}
              >
                {form.exercise || 'Pick Exercise…'}
              </button>
              {form.muscle && <span className="badge badge-muted">{form.muscle}</span>}
            </div>

            <div className="form-row form-row-2" style={{ marginBottom: 10 }}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  className="form-input"
                  value={form.weight}
                  min="0" step="0.5"
                  onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-row form-row-2" style={{ marginBottom: 12 }}>
              <div className="form-group">
                <label className="form-label">Sets</label>
                <input
                  type="number"
                  className="form-input"
                  value={form.sets}
                  min="1" max="20"
                  onChange={e => setForm(f => ({ ...f, sets: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Reps</label>
                <input
                  type="number"
                  className="form-input"
                  value={form.reps}
                  min="1" max="100"
                  onChange={e => setForm(f => ({ ...f, reps: e.target.value }))}
                />
              </div>
            </div>

            {form.exercise && (
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 10 }}>
                Volume: <strong style={{ color: 'var(--text)' }}>{currentSessionVolume.toLocaleString()} kg</strong>
                {prMap[form.exercise] && (
                  <span> · PR: <strong style={{ color: 'var(--accent)' }}>{prMap[form.exercise].toLocaleString()} kg</strong></span>
                )}
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={!form.exercise}>
              + Log Set
            </button>
          </form>
        </div>
      </div>

      {/* ── Log Filters ──────────────────────────────────────── */}
      <div className="section">
        <div className="section-title">Session Logs</div>
        <div className="chip-row" style={{ marginBottom: 8 }}>
          {MUSCLE_GROUPS.map(m => (
            <button
              key={m}
              className={`chip${filterMuscle === m ? ' active' : ''}`}
              onClick={() => setFilterMuscle(m)}
            >
              {m}
            </button>
          ))}
        </div>

        {filteredLogs.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 4v16M18 4v16M1 12h4M19 12h4M6 12h12" /></svg>
              <p>No gym logs {filterMuscle !== 'All' ? `for ${filterMuscle}` : 'yet'}</p>
              <small>Log your first set above</small>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Exercise</th>
                    <th>Date</th>
                    <th>S×R</th>
                    <th>Weight</th>
                    <th>Vol</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map(log => {
                    const vol = log.sets * log.reps * log.weight;
                    const isBestPR = prMap[log.exercise] === vol;
                    return (
                      <tr key={log.id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 11 }}>{log.exercise}</div>
                          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{log.muscle}</div>
                        </td>
                        <td style={{ fontSize: 10, color: 'var(--text-muted)' }}>{fmtDate(log.date)}</td>
                        <td style={{ fontSize: 11 }}>{log.sets}×{log.reps}</td>
                        <td style={{ fontSize: 11 }}>{log.weight}<span style={{ fontSize: 9, color: 'var(--text-muted)' }}>kg</span></td>
                        <td>
                          <span style={{ fontSize: 11 }}>{vol.toLocaleString()}</span>
                          {isBestPR && <span className="badge badge-accent" style={{ marginLeft: 4 }}>PR</span>}
                        </td>
                        <td>
                          <button
                            className="btn btn-ghost btn-icon text-danger"
                            onClick={() => deleteGymLog(log.id)}
                            title="Delete"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showPicker && (
        <ExercisePicker
          exercises={exercises}
          onSelect={handleSelectExercise}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
