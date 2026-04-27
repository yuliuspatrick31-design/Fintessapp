import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { MUSCLE_GROUPS, EXERCISE_TYPES, EQUIPMENT_LIST } from '../data/exercises';

function ExerciseModal({ exercise, onSave, onClose }) {
  const [form, setForm] = useState(
    exercise || { name: '', muscle: 'Chest', type: 'Compound', equipment: 'Barbell' }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{exercise ? 'Edit Exercise' : 'Add Exercise'}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Exercise Name</label>
            <input
              className="form-input"
              placeholder="e.g. Incline Dumbbell Curl"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              autoFocus
              required
            />
          </div>

          <div className="form-row form-row-2">
            <div className="form-group">
              <label className="form-label">Muscle Group</label>
              <select
                className="form-input"
                value={form.muscle}
                onChange={e => setForm(f => ({ ...f, muscle: e.target.value }))}
              >
                {MUSCLE_GROUPS.filter(m => m !== 'All').map(m => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                className="form-input"
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              >
                {EXERCISE_TYPES.filter(t => t !== 'All').map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Equipment</label>
            <select
              className="form-input"
              value={form.equipment}
              onChange={e => setForm(f => ({ ...f, equipment: e.target.value }))}
            >
              {EQUIPMENT_LIST.filter(eq => eq !== 'All').map(eq => (
                <option key={eq}>{eq}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
              {exercise ? 'Save Changes' : 'Add Exercise'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ExerciseLibrary() {
  const { exercises, addExercise, updateExercise, deleteExercise } = useApp();

  const [search, setSearch] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterEquip, setFilterEquip] = useState('All');
  const [modal, setModal] = useState(null); // null | 'add' | exercise object to edit
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = useMemo(() => {
    return exercises.filter(e => {
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
      const matchMuscle = filterMuscle === 'All' || e.muscle === filterMuscle;
      const matchType = filterType === 'All' || e.type === filterType;
      const matchEquip = filterEquip === 'All' || e.equipment === filterEquip;
      return matchSearch && matchMuscle && matchType && matchEquip;
    });
  }, [exercises, search, filterMuscle, filterType, filterEquip]);

  const handleSave = (form) => {
    if (modal === 'add') {
      addExercise(form);
    } else {
      updateExercise(modal.id, form);
    }
  };

  const EQUIP_ICON = {
    Barbell: '🏋️', Dumbbell: '💪', Cable: '🔗', Machine: '⚙️', Bodyweight: '🤸',
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2>Exercise Library</h2>
          <p>{exercises.length} exercises · {filtered.length} shown</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setModal('add')}>
          + Add
        </button>
      </div>

      {/* ── Search & Filters ─────────────────────────────────── */}
      <div className="section">
        <input
          className="form-input"
          placeholder="Search exercises…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 8 }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
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
      </div>

      {/* ── Exercise Grid ────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <p>No exercises found</p>
            <small>Try different filters or add a new exercise</small>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 6 }}>
          {filtered.map(ex => (
            <div
              key={ex.id}
              className="card card-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--surface-3)', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}>
                {EQUIP_ICON[ex.equipment] || '💪'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700 }} className="truncate">{ex.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
                  {ex.muscle} · {ex.equipment}
                </div>
              </div>
              <span className={`badge badge-${ex.type === 'Compound' ? 'accent' : 'muted'}`}>
                {ex.type}
              </span>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <button
                  className="btn btn-ghost btn-icon"
                  onClick={() => setModal(ex)}
                  title="Edit"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button
                  className="btn btn-ghost btn-icon text-danger"
                  onClick={() => setDeleteConfirm(ex)}
                  title="Delete"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────────── */}
      {modal && (
        <ExerciseModal
          exercise={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Delete Exercise?</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              Are you sure you want to delete <strong style={{ color: 'var(--text)' }}>{deleteConfirm.name}</strong>? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={() => { deleteExercise(deleteConfirm.id); setDeleteConfirm(null); }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
