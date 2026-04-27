import { useState, useMemo } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useApp } from '../context/AppContext';
import { getPRs, muscleDistribution, fmtDate, today } from '../utils/calculations';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const CHART_OPT = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { bodyFont: { size: 10 } } },
  scales: {
    x: { ticks: { color: '#555', font: { size: 8 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
    y: { ticks: { color: '#555', font: { size: 8 } }, grid: { color: 'rgba(255,255,255,0.04)' }, beginAtZero: true },
  },
};

const MUSCLE_COLORS = {
  Chest: '#a3e635', Back: '#3b82f6', Shoulders: '#f59e0b',
  Legs: '#ec4899', Arms: '#8b5cf6', Core: '#22c55e', Other: '#737373',
};

export default function ProgressAnalytics() {
  const { gymLogs, runLogs, schedule } = useApp();
  const [selectedExercise, setSelectedExercise] = useState('');

  const exerciseList = useMemo(() => [...new Set(gymLogs.map(l => l.exercise))].sort(), [gymLogs]);

  // Strength progression
  const progressionData = useMemo(() => {
    if (!selectedExercise) return null;
    const logs = gymLogs
      .filter(l => l.exercise === selectedExercise)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    const grouped = {};
    for (const log of logs) {
      const vol = log.sets * log.reps * log.weight;
      if (!grouped[log.date] || vol > grouped[log.date]) grouped[log.date] = vol;
    }
    const dates = Object.keys(grouped).sort();
    return {
      labels: dates.map(fmtDate),
      datasets: [{
        label: 'Volume (kg)', data: dates.map(d => grouped[d]),
        borderColor: '#a3e635', backgroundColor: 'rgba(163,230,53,0.08)',
        fill: true, tension: 0.4, pointBackgroundColor: '#a3e635', pointRadius: 4,
      }],
    };
  }, [gymLogs, selectedExercise]);

  const topPRs = useMemo(() => getPRs(gymLogs).slice(0, 8), [gymLogs]);
  const muscleDist = useMemo(() => muscleDistribution(gymLogs), [gymLogs]);

  // Weekly running (last 8 weeks)
  const weeklyRunData = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const end = new Date(); end.setDate(end.getDate() - i * 7);
      const start = new Date(end); start.setDate(start.getDate() - 6);
      const label = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dist = runLogs.filter(l => {
        const d = new Date(l.date + 'T12:00:00');
        return d >= start && d <= end;
      }).reduce((s, l) => s + l.distance, 0);
      return { label, dist };
    }).reverse();
  }, [runLogs]);

  // ── Schedule Completion Rate ──────────────────────────────
  const completionStats = useMemo(() => {
    if (!schedule.length) return null;
    const todayStr = today();
    const pastDays = schedule.filter(d => d.date <= todayStr && d.type !== 'rest');
    const completed = pastDays.filter(d => d.completed).length;
    const total = pastDays.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Streak: consecutive completed days (from today backwards)
    const sorted = [...schedule].filter(d => d.type !== 'rest').sort((a, b) => b.date.localeCompare(a.date));
    let streak = 0;
    for (const d of sorted) {
      if (d.date > todayStr) continue;
      if (d.completed) streak++;
      else break;
    }

    // Gym vs run breakdown
    const gymDays = pastDays.filter(d => d.type === 'gym');
    const runDays = pastDays.filter(d => d.type === 'run');
    const gymDone = gymDays.filter(d => d.completed).length;
    const runDone = runDays.filter(d => d.completed).length;

    return { total, completed, rate, streak, gymDays: gymDays.length, runDays: runDays.length, gymDone, runDone };
  }, [schedule]);

  return (
    <div>
      <div className="page-header">
        <h2>Progress Analytics</h2>
        <p>Track your strength, endurance, and consistency</p>
      </div>

      {/* ── Schedule Completion ──────────────────────────────── */}
      {completionStats && (
        <div className="section">
          <div className="card card-glow-lime">
            <div className="card-header">
              <span className="card-title">Plan Completion</span>
              <span className="badge badge-accent">{completionStats.rate}%</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
              {[
                { label: 'Planned', value: completionStats.total, color: 'var(--text)' },
                { label: 'Completed', value: completionStats.completed, color: 'var(--accent)' },
                { label: 'Streak', value: `${completionStats.streak}`, sub: 'days', color: 'var(--accent)' },
                { label: 'Rate', value: `${completionStats.rate}%`, color: completionStats.rate >= 80 ? 'var(--accent)' : completionStats.rate >= 50 ? 'var(--warning)' : 'var(--danger)' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: s.value.toString().length > 4 ? 16 : 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className="progress-bar" style={{ height: 6, marginBottom: 10 }}>
              <div
                className="progress-fill"
                style={{
                  width: `${completionStats.rate}%`,
                  background: completionStats.rate >= 80
                    ? 'linear-gradient(90deg, var(--accent), #84cc16)'
                    : completionStats.rate >= 50
                    ? 'linear-gradient(90deg, var(--warning), #fcd34d)'
                    : 'var(--danger)',
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[
                { label: '🏋️ Gym', done: completionStats.gymDone, total: completionStats.gymDays, color: 'var(--accent)' },
                { label: '🏃 Run', done: completionStats.runDone, total: completionStats.runDays, color: 'var(--blue)' },
              ].map(t => (
                <div key={t.label} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '7px 10px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 10, fontWeight: 600 }}>{t.label}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t.done}/{t.total}</span>
                  </div>
                  <div className="progress-bar" style={{ height: 3 }}>
                    <div className="progress-fill" style={{
                      width: t.total > 0 ? `${Math.round((t.done / t.total) * 100)}%` : '0%',
                      background: t.color,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Strength Progression ──────────────────────────────── */}
      <div className="section">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Strength Progression</span>
          </div>
          <select className="form-input" value={selectedExercise}
            onChange={e => setSelectedExercise(e.target.value)} style={{ marginBottom: 12 }}>
            <option value="">Select exercise…</option>
            {exerciseList.map(ex => <option key={ex} value={ex}>{ex}</option>)}
          </select>

          {!selectedExercise && (
            <div className="empty-state" style={{ padding: '16px 0' }}>
              <p>Select an exercise to chart progress</p>
            </div>
          )}
          {selectedExercise && progressionData && progressionData.labels.length >= 2 && (
            <div className="chart-wrap" style={{ height: 130 }}>
              <Line data={progressionData} options={CHART_OPT} />
            </div>
          )}
          {selectedExercise && progressionData && progressionData.labels.length < 2 && (
            <div className="empty-state" style={{ padding: '14px 0' }}>
              <p>Need at least 2 sessions to show progression</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Top PRs ───────────────────────────────────────────── */}
      <div className="section">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Top PRs by Volume</span>
            <span className="badge badge-accent">🏆</span>
          </div>
          {topPRs.length === 0 ? (
            <div className="empty-state" style={{ padding: '16px 0' }}><p>No data yet</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {topPRs.map((pr, i) => (
                <div key={pr.exercise} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '7px 0',
                  borderBottom: i < topPRs.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    background: i === 0 ? 'var(--accent-glow)' : 'rgba(255,255,255,0.06)',
                    color: i === 0 ? 'var(--accent)' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 800,
                  }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600 }}>{pr.exercise}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{pr.muscle} · {fmtDate(pr.date)}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)' }}>
                    {pr.volume.toLocaleString()}<span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 400 }}> kg</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Muscle Distribution ───────────────────────────────── */}
      <div className="section">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Muscle Group Distribution</span>
            <span className="text-muted text-xs">% of total sets</span>
          </div>
          {muscleDist.length === 0 ? (
            <div className="empty-state" style={{ padding: '16px 0' }}><p>No gym data yet</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {muscleDist.map(({ muscle, sets, pct }) => (
                <div key={muscle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 500 }}>{muscle}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{sets} sets · {pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill"
                      style={{ width: `${pct}%`, background: MUSCLE_COLORS[muscle] || '#737373' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Weekly Running ────────────────────────────────────── */}
      <div className="section">
        <div className="card card-sm card-glow-blue">
          <div className="card-header">
            <span className="card-title">Weekly Running Distance</span>
            <span className="text-muted text-xs">Last 8 weeks</span>
          </div>
          {weeklyRunData.every(w => w.dist === 0) ? (
            <div className="empty-state" style={{ padding: '16px 0' }}><p>No runs logged yet</p></div>
          ) : (
            <div className="chart-wrap" style={{ height: 110 }}>
              <Bar data={{
                labels: weeklyRunData.map(w => w.label),
                datasets: [{
                  data: weeklyRunData.map(w => w.dist),
                  backgroundColor: 'rgba(59,130,246,0.65)',
                  borderRadius: 4, borderSkipped: false,
                }],
              }} options={CHART_OPT} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
