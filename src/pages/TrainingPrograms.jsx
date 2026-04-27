import { useState } from 'react';
import { PROGRAMS } from '../data/programs';
import { useApp } from '../context/AppContext';
import { generatePlan } from '../utils/planGenerator';
import { today } from '../utils/calculations';

const LEVEL_BADGE = {
  'Beginner': 'badge-accent',
  'Beginner–Intermediate': 'badge-blue',
  'Intermediate': 'badge-blue',
  'Intermediate–Advanced': 'badge-warning',
  'Advanced': 'badge-danger',
};

const GOAL_ICON = {
  'Hypertrophy': '💪',
  'Strength': '🏋️',
  'Strength & Size': '⚡',
  'General Fitness': '🏃',
};

// ── Auto-Generate Plan Modal ──────────────────────────────────
function GenerateModal({ onClose }) {
  const { setSchedulePlan, schedule } = useApp();

  const [programId, setProgramId] = useState('ppl');
  const [startDate, setStartDate] = useState(today());
  const [includeRuns, setIncludeRuns] = useState(true);
  const [runsPerWeek, setRunsPerWeek] = useState(2);
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);
  const [generated, setGenerated] = useState(false);

  const hasExisting = schedule.length > 0;

  const handleGenerate = () => {
    if (hasExisting && !confirmOverwrite) {
      setConfirmOverwrite(true);
      return;
    }
    const plan = generatePlan(programId, startDate, includeRuns, runsPerWeek);
    setSchedulePlan(plan);
    setGenerated(true);
  };

  const program = PROGRAMS.find(p => p.id === programId);

  if (generated) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" style={{ maxWidth: 400, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Plan Generated!</div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            28-day <strong style={{ color: 'var(--accent)' }}>{program?.name}</strong> plan starting {startDate}.
            {includeRuns && ` Includes ${runsPerWeek} run${runsPerWeek > 1 ? 's' : ''}/week.`}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 20 }}>
            Head to the <strong style={{ color: 'var(--text)' }}>Calendar</strong> tab to see your plan.
          </p>
          <button className="btn btn-primary w-full" onClick={onClose}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">⚡ Auto-Generate 4-Week Plan</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        {/* Program picker */}
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">Program</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {PROGRAMS.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProgramId(p.id)}
                style={{
                  padding: '9px 6px', borderRadius: 10, cursor: 'pointer',
                  border: `1px solid ${programId === p.id ? p.color : 'var(--border-2)'}`,
                  background: programId === p.id ? `${p.color}14` : 'var(--surface)',
                  transition: 'all 0.15s', textAlign: 'center',
                }}
              >
                <div style={{
                  fontSize: 11, fontWeight: 800,
                  color: programId === p.id ? p.color : 'var(--text-muted)',
                }}>{p.abbr}</div>
                <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 2 }}>{p.frequency}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected program preview */}
        {program && (
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
            borderLeft: `3px solid ${program.color}`,
            borderRadius: 9, padding: '9px 12px', marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{program.name}</span>
              <span className={`badge ${LEVEL_BADGE[program.level] || 'badge-muted'}`}>{program.level}</span>
            </div>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {GOAL_ICON[program.goal]} {program.goal} · {program.frequency}
            </p>
          </div>
        )}

        {/* Start Date */}
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-input"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>

        {/* Running options */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '10px 12px', marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: includeRuns ? 10 : 0 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600 }}>Include Running Days</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Add runs to rest days</div>
            </div>
            <button
              type="button"
              onClick={() => setIncludeRuns(r => !r)}
              style={{
                width: 42, height: 24, borderRadius: 12,
                background: includeRuns ? 'var(--accent)' : 'var(--surface-3)',
                border: '1px solid var(--border-2)',
                position: 'relative', cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <span style={{
                position: 'absolute', top: 3,
                left: includeRuns ? 21 : 3, width: 16, height: 16,
                borderRadius: '50%', background: includeRuns ? '#000' : 'var(--text-muted)',
                transition: 'left 0.2s',
              }} />
            </button>
          </div>

          {includeRuns && (
            <div className="form-group">
              <label className="form-label">Runs per week</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1, 2, 3].map(n => (
                  <button
                    key={n}
                    type="button"
                    className={`chip${runsPerWeek === n ? ' active-blue' : ''}`}
                    onClick={() => setRunsPerWeek(n)}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    {n}×/week
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Overwrite warning */}
        {confirmOverwrite && (
          <div style={{
            background: 'var(--danger-dim)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 9, padding: '10px 12px', marginBottom: 12,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--danger)', marginBottom: 4 }}>
              ⚠️ This will replace your existing plan
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Your current schedule ({schedule.length} days) will be deleted and replaced.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleGenerate}>
            {confirmOverwrite ? '⚡ Replace Plan' : '⚡ Generate 28-Day Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Program Card ──────────────────────────────────────────────
function ProgramCard({ program }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="accordion" style={{ marginBottom: 8 }}>
      <div className={`accordion-header${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: `${program.color}18`,
            border: `1px solid ${program.color}30`,
            color: program.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 900, flexShrink: 0,
          }}>
            {program.abbr.slice(0, 4)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>{program.name}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              {GOAL_ICON[program.goal]} {program.goal} · {program.frequency}
            </div>
          </div>
        </div>
        <svg className={`accordion-chevron${open ? ' open' : ''}`} width="14" height="14"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {open && (
        <div className="accordion-body">
          <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>
            {program.description}
          </p>

          <div className="chip-row" style={{ marginBottom: 12 }}>
            <span className={`badge ${LEVEL_BADGE[program.level] || 'badge-muted'}`}>{program.level}</span>
            <span className="badge badge-muted">📅 {program.frequency}</span>
            <span className="badge badge-muted">{GOAL_ICON[program.goal]} {program.goal}</span>
          </div>

          {/* Weekly Schedule */}
          <div style={{ marginBottom: 12 }}>
            <div className="section-title" style={{ marginBottom: 6 }}>Weekly Pattern</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
              {program.schedule.map(({ day, focus }) => (
                <div key={day} style={{
                  textAlign: 'center', padding: '5px 2px', borderRadius: 7,
                  background: focus === 'Rest' ? 'rgba(255,255,255,0.03)' : `${program.color}10`,
                  border: `1px solid ${focus === 'Rest' ? 'var(--border)' : program.color + '25'}`,
                }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 2 }}>{day}</div>
                  <div style={{ fontSize: 8, fontWeight: 600, color: focus === 'Rest' ? 'var(--text-dim)' : program.color, lineHeight: 1.2 }}>
                    {focus}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div className="section-title" style={{ marginBottom: 6 }}>Key Exercises</div>
            <div className="chip-row">
              {program.exercises.map(ex => (
                <span key={ex} className="chip" style={{ cursor: 'default' }}>{ex}</span>
              ))}
            </div>
          </div>

          <div style={{
            background: 'var(--surface)', borderRadius: 8, padding: '10px 12px',
            borderLeft: `3px solid ${program.color}`,
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
              Training Theory
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>{program.theory}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function TrainingPrograms() {
  const { schedule } = useApp();
  const [showGenerator, setShowGenerator] = useState(false);
  const [goalFilter, setGoalFilter] = useState('All');
  const goals = ['All', 'Hypertrophy', 'Strength', 'Strength & Size', 'General Fitness'];

  const filtered = goalFilter === 'All'
    ? PROGRAMS
    : PROGRAMS.filter(p => p.goal === goalFilter);

  const hasSchedule = schedule.length > 0;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em' }}>Training Programs</h2>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Science-backed plans for every level</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowGenerator(true)}>
          ⚡ Auto Plan
        </button>
      </div>

      {/* Schedule status banner */}
      {hasSchedule ? (
        <div className="card card-glow-lime" style={{ marginBottom: 14, padding: '10px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>✓ Plan Active</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                {schedule.length} days scheduled · {schedule.filter(d => d.completed).length} completed
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowGenerator(true)}>
              Regenerate
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          background: 'linear-gradient(135deg, rgba(163,230,53,0.08), rgba(163,230,53,0.03))',
          border: '1px solid rgba(163,230,53,0.2)', borderRadius: 'var(--radius-lg)',
          padding: '16px', marginBottom: 14, textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>⚡</div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Build Your Training Plan</div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
            Select a program and auto-generate a 4-week schedule with exercises for every session.
          </p>
          <button className="btn btn-primary" onClick={() => setShowGenerator(true)}>
            ⚡ Generate My Plan
          </button>
        </div>
      )}

      {/* Filter */}
      <div className="section">
        <div className="chip-row">
          {goals.map(g => (
            <button key={g} className={`chip${goalFilter === g ? ' active' : ''}`} onClick={() => setGoalFilter(g)}>
              {GOAL_ICON[g] || ''} {g}
            </button>
          ))}
        </div>
      </div>

      {/* Program Cards */}
      <div className="section">
        {filtered.map(p => <ProgramCard key={p.id} program={p} />)}
      </div>

      {/* Tip Card */}
      <div className="card card-sm" style={{ borderColor: 'rgba(163,230,53,0.15)', background: 'rgba(163,230,53,0.03)' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <span style={{ fontSize: 16 }}>💡</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 3 }}>Which program is right for me?</div>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text)' }}>Beginners:</strong> Full Body 3×/week or GZCLP<br />
              <strong style={{ color: 'var(--text)' }}>Intermediate:</strong> PPL or Upper/Lower<br />
              <strong style={{ color: 'var(--text)' }}>Strength focus:</strong> 5/3/1 or GZCLP<br />
              <strong style={{ color: 'var(--text)' }}>Advanced:</strong> Arnold Split
            </p>
          </div>
        </div>
      </div>

      {showGenerator && (
        <GenerateModal onClose={() => setShowGenerator(false)} />
      )}
    </div>
  );
}
