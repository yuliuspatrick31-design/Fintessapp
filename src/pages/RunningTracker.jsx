import { useState, useMemo } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useApp } from '../context/AppContext';
import {
  parseDuration, calcPace, avgPace, bestPace, longestRun, today, fmtDate,
} from '../utils/calculations';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

export default function RunningTracker() {
  const { runLogs, addRunLog, deleteRunLog } = useApp();

  const [form, setForm] = useState({
    date: today(),
    distance: '',
    duration: '',
    notes: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.distance || !form.duration) return;
    const durationSecs = parseDuration(form.duration);
    addRunLog({
      date: form.date,
      distance: parseFloat(form.distance),
      duration: form.duration,
      durationSecs,
      notes: form.notes,
    });
    setForm(f => ({ ...f, distance: '', duration: '', notes: '' }));
  };

  const pace = useMemo(() => {
    if (!form.distance || !form.duration) return null;
    return calcPace(parseFloat(form.distance), parseDuration(form.duration));
  }, [form.distance, form.duration]);

  // Stats
  const stats = useMemo(() => ({
    totalKm: runLogs.reduce((s, l) => s + l.distance, 0).toFixed(1),
    avgPaceStr: avgPace(runLogs),
    longestKm: longestRun(runLogs).toFixed(1),
    bestPaceStr: bestPace(runLogs),
  }), [runLogs]);

  // Distance trend (last 10 runs)
  const last10 = useMemo(() => [...runLogs]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-10), [runLogs]);

  const chartData = {
    labels: last10.map(l => fmtDate(l.date)),
    datasets: [{
      label: 'km',
      data: last10.map(l => l.distance),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#3b82f6',
      pointRadius: 4,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { bodyFont: { size: 11 } } },
    scales: {
      x: { ticks: { color: '#737373', font: { size: 9 } }, grid: { color: '#1a1a1a' } },
      y: {
        ticks: { color: '#737373', font: { size: 9 } },
        grid: { color: '#1a1a1a' },
        beginAtZero: true,
      },
    },
  };

  const sortedLogs = useMemo(() =>
    [...runLogs].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [runLogs]
  );

  return (
    <div>
      <div className="page-header">
        <h2>Running Tracker</h2>
        <p>Log runs, track pace and distance</p>
      </div>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <div className="section">
        <div className="stat-grid">
          <div className="stat-block" style={{ borderColor: 'rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.04)' }}>
            <div className="label">Total Distance</div>
            <div className="value" style={{ color: 'var(--blue)' }}>{stats.totalKm}<span className="unit">km</span></div>
          </div>
          <div className="stat-block">
            <div className="label">Avg Pace</div>
            <div className="value">{stats.avgPaceStr || '—'}<span className="unit">/km</span></div>
          </div>
          <div className="stat-block">
            <div className="label">Longest Run</div>
            <div className="value">{stats.longestKm}<span className="unit">km</span></div>
          </div>
          <div className="stat-block">
            <div className="label">Best Pace</div>
            <div className="value">{stats.bestPaceStr || '—'}<span className="unit">/km</span></div>
          </div>
        </div>
      </div>

      {/* ── Log Form ─────────────────────────────────────────── */}
      <div className="section">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Log Run</span>
            {pace && (
              <span className="badge badge-blue">⚡ {pace} /km</span>
            )}
          </div>

          <form onSubmit={handleSubmit}>
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
                <label className="form-label">Distance (km)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="5.0"
                  value={form.distance}
                  min="0" step="0.1"
                  onChange={e => setForm(f => ({ ...f, distance: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 10 }}>
              <label className="form-label">Duration (mm:ss or hh:mm:ss)</label>
              <input
                type="text"
                className="form-input"
                placeholder="25:30"
                value={form.duration}
                onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Notes (optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Morning run, felt great…"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={!form.distance || !form.duration}
              style={{ background: 'var(--blue)', color: '#fff' }}
            >
              + Log Run
            </button>
          </form>
        </div>
      </div>

      {/* ── Distance Trend Chart ──────────────────────────────── */}
      {last10.length >= 2 && (
        <div className="section">
          <div className="card card-sm">
            <div className="card-header">
              <span className="card-title">Distance Trend</span>
              <span className="text-muted text-xs">Last {last10.length} runs</span>
            </div>
            <div className="chart-wrap" style={{ height: 120 }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}

      {/* ── Run Log Table ─────────────────────────────────────── */}
      <div className="section">
        <div className="section-title">Run History</div>
        {sortedLogs.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="13" cy="4" r="1"/><path d="M7 21l3-6 2 2 3-3 2 4M20.5 8l-2 2.5-3-1-1 3-4-1"/></svg>
              <p>No runs logged yet</p>
              <small>Log your first run above</small>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Distance</th>
                    <th>Duration</th>
                    <th>Pace</th>
                    <th>Notes</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLogs.map(log => (
                    <tr key={log.id}>
                      <td style={{ fontSize: 10, color: 'var(--text-muted)' }}>{fmtDate(log.date)}</td>
                      <td style={{ fontWeight: 700, fontSize: 12, color: 'var(--blue)' }}>
                        {log.distance} <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 400 }}>km</span>
                      </td>
                      <td style={{ fontSize: 11 }}>{log.duration}</td>
                      <td style={{ fontSize: 11 }}>
                        {log.distance && log.durationSecs
                          ? calcPace(log.distance, log.durationSecs) + ' /km'
                          : '—'}
                      </td>
                      <td style={{ fontSize: 10, color: 'var(--text-muted)', maxWidth: 100 }} className="truncate">
                        {log.notes || '—'}
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-icon text-danger"
                          onClick={() => deleteRunLog(log.id)}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
