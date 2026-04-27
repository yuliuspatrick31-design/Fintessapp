import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Layout/Sidebar';
import BottomNav from './components/Layout/BottomNav';
import Dashboard from './pages/Dashboard';
import GymTracker from './pages/GymTracker';
import RunningTracker from './pages/RunningTracker';
import ProgressAnalytics from './pages/ProgressAnalytics';
import ExerciseLibrary from './pages/ExerciseLibrary';
import TrainingPrograms from './pages/TrainingPrograms';
import Calendar from './pages/Calendar';
import Login from './pages/Login';
import Settings from './pages/Settings';

function AppShell({ user, onLogout }) {
  const [page, setPage] = useState('dashboard');

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard setPage={setPage} />;
      case 'gym':       return <GymTracker />;
      case 'run':       return <RunningTracker />;
      case 'progress':  return <ProgressAnalytics />;
      case 'library':   return <ExerciseLibrary />;
      case 'programs':  return <TrainingPrograms />;
      case 'calendar':  return <Calendar />;
      case 'settings':  return <Settings user={user} onLogout={onLogout} />;
      default:          return <Dashboard setPage={setPage} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} user={user} onLogout={onLogout} />
      <main className="main-content">
        {renderPage()}
      </main>
      <BottomNav page={page} setPage={setPage} />
    </div>
  );
}

export default function App() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 36, height: 36, border: '3px solid var(--border-2)',
            borderTopColor: 'var(--accent)', borderRadius: '50%',
            animation: 'spin 0.7s linear infinite', margin: '0 auto 12px',
          }} />
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <AppProvider userId={user.id}>
      <AppShell user={user} onLogout={handleLogout} />
    </AppProvider>
  );
}
