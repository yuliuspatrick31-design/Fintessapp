import { useState } from 'react';
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

function AppShell() {
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
      default:          return <Dashboard setPage={setPage} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} />
      <main className="main-content">
        {renderPage()}
      </main>
      <BottomNav page={page} setPage={setPage} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
