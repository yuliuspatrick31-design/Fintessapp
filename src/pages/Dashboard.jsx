import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useApp } from '../context/AppContext';
import {
  totalVolume, estimateGymCalories, estimateRunCalories,
  last7Days, logsInLastDays, timeAgo, generateInsights, today,
} from '../utils/calculations';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const CHART_OPT = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { bodyFont: { size: 10 }, titleFont: { size: 10 } } },
  scales: {
    x: { ticks: { color: '#555', font: { size: 8 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
    y: { ticks: { color: '#555', font: { size: 8 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
  },
};

function StreakDots({ gymLogs, runLogs }) {
  const days = last7Days();
  const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const todayStr = today();
  return (
    <div className="streak-grid">
      {days.map((d) => {
        const hasActivity = gymLogs.some(l => l.date === d) || runLogs.some(l => l.date === d);
        const isToday = d === todayStr;
        const dayOfWeek = new Date(d + 'T12:00:00').getDay();
        return (
          <div key={d} className={`streak-dot${hasActivity ? ' active' : ''}${isToday ? ' today' : ''}`}>
            <span className="day-label">{DAY_LABELS[dayOfWeek]}</span>
            <span className="dot-fill" />
          </div>
        );
      })}
    </div>
  );
}

function TodayWorkout({ workout, setPage }) {
  if (!workout) {
    return (
      <div className="today-workout-card rest-card" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 3 }}>
              Today's Plan
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>No workout scheduled</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage('programs')}>
            Make a Plan
          </button>
        </div>
      </div>
    );
  }

  const cardClass = workout.type === 'gym' ? 'gym-card' : workout.type === 'run' ? 'run-card' : 'rest-card';
  const color = workout.type === 'gym' ? 'var(--accent)' : workout.type === 'run' ? 'var(--blue)' : 'var(--text-muted)';
  const icon = workout.type === 'gym' ? '🏋️' : workout.type === 'run' ? '🏃' : '😴';

  const completionPct = workout.type === 'gym' && workout.exercises.length > 0
    ? Math.round((workout.completedExercises.length / workout.exercises.length) * 100)
    : null;

  return (
    <div className={`today-workout-card ${cardClass}`} style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.07em', color, opacity: 0.7, marginBottom: 3 }}>
            Today's Workout
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span style={{ fontSize: 15, fontWeight: 800 }}>{workout.title}</span>
            {workout.completed && (
              <span className="badge badge-accent">✓ Done</span>
            )}
          </div>

          {workout.type === 'gym' && workout.exercises.length > 0 && (
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 5 }}>
                {workout.exercises.length} exercises · {workout.completedExercises.length} completed
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {workout.exercises.slice(0, 5).map(ex => (
                  <span
                    key={ex.id}
                    style={{
                      fontSize: 9, padding: '2px 7px', borderRadius: 20,
                      background: workout.completedExercises.includes(ex.id)
                        ? 'var(--accent-glow)' : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${workout.completedExercises.includes(ex.id) ? 'rgba(163,230,53,0.3)' : 'var(--border)'}`,
                      color: workout.completedExercises.includes(ex.id) ? 'var(--accent)' : 'var(--text-muted)',
                    }}
                  >
                    {workout.completedExercises.includes(ex.id) ? '✓ ' : ''}{ex.name}
                  </span>
                ))}
                {workout.exercises.length > 5 && (
                  <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>+{workout.exercises.length - 5} more</span>
                )}
              </div>
            </div>
          )}

          {workout.type === 'run' && (
            <div style={{ fontSize: 12, color }}>
              🎯 {workout.targetDistance} km target
              {workout.targetDuration && ` · ~${workout.targetDuration}`}
            </div>
          )}
        </div>
        <button
          className="btn btn-sm"
          style={{
            background: color, color: workout.type === 'run' ? '#fff' : '#000',
            flexShrink: 0,
            boxShadow: `0 0 12px ${workout.type === 'gym' ? 'rgba(163,230,53,0.25)' : 'rgba(59,130,246,0.25)'}`,
          }}
          onClick={() => setPage('calendar')}
        >
          View →
        </button>
      </div>

      {completionPct !== null && (
        <div style={{ marginTop: 10 }}>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${completionPct}%`,
                background: 'linear-gradient(90deg, var(--accent), #84cc16)',
              }}
            />
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 3, textAlign: 'right' }}>
            {completionPct}% complete
          </div>
        </div>
      )}
    </div>
  );
}

function InsightCard({ icon, text, type = 'green' }) {
  return (
    <div className="insight-card">
      <div className={`icon ${type}`}>{icon}</div>
      <div className="content"><p>{text}</p></div>
    </div>
  );
}

export default function Dashboard({ setPage }) {
  const { gymLogs, runLogs, schedule } = useApp();

  const weekGym = useMemo(() => logsInLastDays(gymLogs, 7), [gymLogs]);
  const weekRun = useMemo(() => logsInLastDays(runLogs, 7), [runLogs]);

  const stats = useMemo(() => ({
    totalSets: gymLogs.reduce((s, l) => s + l.sets, 0),
    totalKm: runLogs.reduce((s, l) => s + l.distance, 0).toFixed(1),
    volume: totalVolume(gymLogs).toLocaleString(),
    calories: (estimateGymCalories(gymLogs) + estimateRunCalories(runLogs)).toLocaleString(),
  }), [gymLogs, runLogs]);

  const days7 = last7Days();
  const dayLabels = days7.map(d =>
    new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'narrow' })
  );
  const gymVolumeData = days7.map(d =>
    gymLogs.filter(l => l.date === d).reduce((s, l) => s + l.sets * l.reps * l.weight, 0)
  );
  const runDistData = days7.map(d =>
    runLogs.filter(l => l.date === d).reduce((s, l) => s + l.distance, 0)
  );

  const feed = useMemo(() => {
    const gymEntries = gymLogs.map(l => ({
      type: 'gym', title: l.exercise,
      sub: `${l.sets}×${l.reps} @ ${l.weight}kg · ${l.muscle}`,
      date: l.date, id: l.id,
    }));
    const runEntries = runLogs.map(l => ({
      type: 'run', title: `Run — ${l.distance} km`,
      sub: l.duration || 'No duration', date: l.date, id: l.id,
    }));
    return [...gymEntries, ...runEntries]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);
  }, [gymLogs, runLogs]);

  const { insights, suggestions } = useMemo(
    () => generateInsights(gymLogs, runLogs), [gymLogs, runLogs]
  );

  const activeDays = useMemo(() => {
    const dates = new Set([...gymLogs.map(l => l.date), ...runLogs.map(l => l.date)]);
    return days7.filter(d => dates.has(d)).length;
  }, [gymLogs, runLogs, days7]);

  // Today's scheduled workout
  const todayStr = today();
  const todayWorkout = useMemo(
    () => schedule.find(d => d.date === todayStr) || null,
    [schedule, todayStr]
  );

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2>Dashboard <span className="text-accent">↗</span></h2>
          <p>Your training command center</p>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Today's Workout */}
      <TodayWorkout workout={todayWorkout} setPage={setPage} />

      {/* Stats */}
      <div className="section">
        <div className="stat-grid">
          <div className="stat-block accent">
            <div className="label">Total Sets</div>
            <div className="value">{stats.totalSets.toLocaleString()}<span className="unit"> sets</span></div>
            <div className="sub">{weekGym.reduce((s, l) => s + l.sets, 0)} this week</div>
          </div>
          <div className="stat-block blue">
            <div className="label">Distance Run</div>
            <div className="value">{stats.totalKm}<span className="unit"> km</span></div>
            <div className="sub">{weekRun.reduce((s, l) => s + l.distance, 0).toFixed(1)} km this week</div>
          </div>
          <div className="stat-block">
            <div className="label">Gym Volume</div>
            <div className="value">{stats.volume}<span className="unit"> kg</span></div>
            <div className="sub">Total lifted</div>
          </div>
          <div className="stat-block">
            <div className="label">Est. Calories</div>
            <div className="value">{stats.calories}<span className="unit"> kcal</span></div>
            <div className="sub">Lifetime total</div>
          </div>
        </div>
      </div>

      {/* Streak + Charts in 2-col on desktop */}
      <div style={{ display: 'grid', gap: 10 }}>
        <div className="card card-sm">
          <div className="card-header">
            <span className="card-title">Weekly Streak</span>
            <span className="badge badge-accent">{activeDays}/7 days</span>
          </div>
          <StreakDots gymLogs={gymLogs} runLogs={runLogs} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div className="card card-sm card-glow-lime">
            <div className="card-title" style={{ marginBottom: 8 }}>Gym Volume</div>
            <div className="chart-wrap" style={{ height: 80 }}>
              <Bar
                data={{
                  labels: dayLabels,
                  datasets: [{ data: gymVolumeData, backgroundColor: 'rgba(163,230,53,0.65)', borderRadius: 3, borderSkipped: false }],
                }}
                options={CHART_OPT}
              />
            </div>
          </div>
          <div className="card card-sm card-glow-blue">
            <div className="card-title" style={{ marginBottom: 8 }}>Run Distance</div>
            <div className="chart-wrap" style={{ height: 80 }}>
              <Bar
                data={{
                  labels: dayLabels,
                  datasets: [{ data: runDistData, backgroundColor: 'rgba(59,130,246,0.65)', borderRadius: 3, borderSkipped: false }],
                }}
                options={CHART_OPT}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      {(insights.length > 0 || suggestions.length > 0) && (
        <div className="section" style={{ marginTop: 14 }}>
          <div className="section-title"><span>⚡</span> Insights & Suggestions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {insights.map((text, i) => (
              <InsightCard key={`ins-${i}`} icon="📊" text={text} type="green" />
            ))}
            {suggestions.map((s, i) => (
              <InsightCard key={`sug-${i}`}
                icon={s.type === 'red' ? '⚠️' : s.type === 'warning' ? '🕐' : '💡'}
                text={s.text}
                type={s.type === 'red' ? 'red' : s.type === 'warning' ? 'warning' : 'blue'}
              />
            ))}
          </div>
        </div>
      )}

      {/* Activity Feed */}
      <div className="section">
        <div className="card" style={{ padding: '12px 14px' }}>
          <div className="card-header">
            <span className="card-title">Recent Activity</span>
            <button className="btn-ghost text-xs" onClick={() => setPage('gym')}>View all →</button>
          </div>
          {feed.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px 0' }}>
              <p>No activity logged yet</p>
              <small>Start by logging a gym session or run</small>
            </div>
          ) : (
            feed.map(item => (
              <div key={item.id} className="feed-item">
                <div className={`feed-icon ${item.type}`}>
                  {item.type === 'gym' ? '🏋️' : '🏃'}
                </div>
                <div className="feed-content">
                  <div className="title">{item.title}</div>
                  <div className="sub">{item.sub}</div>
                </div>
                <div className="feed-time">{timeAgo(item.date)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
