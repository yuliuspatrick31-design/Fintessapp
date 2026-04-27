import { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function Login({ onLogin }) {
  const [mode, setMode]         = useState('login'); // 'login' | 'signup'
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [devClicks, setDevClicks] = useState(0);

  // ── Dev bypass (triple-click the logo activates it) ──────────
  const DEV_USER = {
    id: 'dev-bypass',
    email: 'dev@fittracker.local',
    user_metadata: { name: 'Dev Tester' },
    created_at: new Date().toISOString(),
    isDev: true,
  };

  const handleDevClick = () => {
    const next = devClicks + 1;
    setDevClicks(next);
    if (next >= 3) {
      setDevClicks(0);
      onLogin(DEV_USER);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.');
      }

      if (mode === 'signup') {
        if (!name.trim()) { setError('Please enter your name.'); setLoading(false); return; }

        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: name.trim() } },
        });
        if (err) throw err;
        if (data.user) onLogin(data.user);
        else setError('Check your email to confirm your account.');
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        onLogin(data.user);
      }
    } catch (err) {
      console.error('Auth error:', err);
      let msg = err.message || 'Something went wrong. Please try again.';
      if (msg.includes('Load failed') || msg.includes('Failed to fetch')) {
        msg = 'Connection failed. Please check if your Supabase environment variables are correctly set in Vercel.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Animated background orbs */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-orb login-orb-3" />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M6 4v16M18 4v16M1 12h4M19 12h4M6 12h12" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h1 className="login-brand">FitTracker</h1>
            <p className="login-tagline">Your performance, visualised.</p>
          </div>
        </div>

        {/* Tab toggle */}
        <div className="login-tabs">
          <button
            id="tab-login"
            className={`login-tab${mode === 'login' ? ' active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Sign In
          </button>
          <button
            id="tab-signup"
            className={`login-tab${mode === 'signup' ? ' active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); }}
          >
            Create Account
          </button>
        </div>

        {/* Headline */}
        <div className="login-headline">
          <h2>{mode === 'login' ? 'Welcome back 👋' : 'Start your journey 🚀'}</h2>
          <p>{mode === 'login' ? 'Sign in to continue tracking your progress.' : 'Create a free account in seconds.'}</p>
        </div>

        {/* Form */}
        <form id="login-form" className="login-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="login-field">
              <label htmlFor="field-name">Full Name</label>
              <div className="login-input-wrap">
                <svg className="login-input-icon" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
                <input
                  id="field-name"
                  type="text"
                  placeholder="Alex Johnson"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div className="login-field">
            <label htmlFor="field-email">Email</label>
            <div className="login-input-wrap">
              <svg className="login-input-icon" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
              </svg>
              <input
                id="field-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="login-field">
            <div className="login-field-row">
              <label htmlFor="field-password">Password</label>
            </div>
            <div className="login-input-wrap">
              <svg className="login-input-icon" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                id="field-password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                id="toggle-password"
                className="login-show-pass"
                onClick={() => setShowPass(v => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? (
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error" role="alert">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <button
            id="btn-submit"
            type="submit"
            className={`login-btn-primary${loading ? ' loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <span className="login-spinner" />
            ) : (
              <>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <p className="login-legal">
          By continuing, you agree to our{' '}
          <span className="login-link">Terms</span> and{' '}
          <span className="login-link">Privacy Policy</span>.
          {mode === 'login' && (
            <><br />Don't have an account?{' '}
              <span className="login-link" onClick={() => { setMode('signup'); setError(''); }} style={{ cursor: 'pointer' }}>
                Create one
              </span>
            </>
          )}
        </p>

        {/* ── Dev bypass (triple-click the dot) ── */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
          <button
            id="btn-dev-bypass"
            type="button"
            onClick={handleDevClick}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '4px 8px', borderRadius: 6,
              display: 'flex', alignItems: 'center', gap: 6,
              opacity: devClicks > 0 ? 1 : 0.25,
              transition: 'all 0.2s',
            }}
            title={`Dev mode (${3 - devClicks} clicks)`}
          >
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: devClicks === 0 ? 'var(--text-dim)'
                        : devClicks === 1 ? 'var(--warning)'
                        : devClicks === 2 ? 'var(--accent)'
                        : 'var(--success)',
              display: 'block',
              boxShadow: devClicks > 0 ? '0 0 8px currentColor' : 'none',
              transition: 'all 0.2s',
            }} />
            <span style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700 }}>
              {devClicks === 0 ? 'v1.0.0' : devClicks === 1 ? 'dev ·' : '▶ Enter Dev Mode'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
