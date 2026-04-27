import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

export default function Settings({ user, onLogout }) {
  const { theme, setTheme } = useApp();
  const isDev       = user?.id === 'dev-bypass';
  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Athlete';
  const initials    = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const [loggingOut,  setLoggingOut]  = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [devCleared,  setDevCleared]  = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    if (!isDev) await supabase.auth.signOut();
    onLogout();
  };

  const clearDevData = () => {
    ['dev_gymLogs','dev_runLogs','dev_exercises','dev_schedule'].forEach(k => localStorage.removeItem(k));
    setDevCleared(true);
    setTimeout(() => setDevCleared(false), 2000);
  };


  // ── Stat: account creation date ──
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="settings-root">
      <div className="page-header">
        <h2>Settings</h2>
        <p>Manage your account and preferences</p>
      </div>

      {/* ── Dev Mode Banner ───────────────────────────────────── */}
      {isDev && (
        <div className="section">
          <div className="dev-banner">
            <div className="dev-banner-left">
              <span className="dev-badge">DEV</span>
              <div>
                <div className="dev-banner-title">Development Mode Active</div>
                <div className="dev-banner-sub">No Supabase — data stored in localStorage only</div>
              </div>
            </div>
            <button
              id="btn-clear-dev-data"
              className="dev-clear-btn"
              onClick={clearDevData}
            >
              {devCleared ? '✓ Cleared' : 'Clear Data'}
            </button>
          </div>
        </div>
      )}

      {/* ── Profile Card ─────────────────────────────────────── */}
      <div className="section">
        <div className="settings-profile-card">
          <div className="settings-avatar">{initials}</div>
          <div className="settings-profile-info">
            <div className="settings-profile-name">{displayName}</div>
            <div className="settings-profile-email">{user?.email}</div>
            <div className="settings-profile-since">Member since {memberSince}</div>
          </div>
        </div>
      </div>

      {/* ── Account Section ───────────────────────────────────── */}
      <div className="section">
        <div className="section-title">Account</div>
        <div className="settings-group">

          <div className="settings-row">
            <div className="settings-row-icon" style={{ background: 'var(--accent-glow)' }}>
              <svg width="14" height="14" fill="none" stroke="var(--accent)" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </div>
            <div className="settings-row-body">
              <span className="settings-row-label">Display Name</span>
              <span className="settings-row-value">{displayName}</span>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-row-icon" style={{ background: 'var(--blue-glow)' }}>
              <svg width="14" height="14" fill="none" stroke="var(--blue)" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
              </svg>
            </div>
            <div className="settings-row-body">
              <span className="settings-row-label">Email</span>
              <span className="settings-row-value">{user?.email}</span>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-row-icon" style={{ background: 'rgba(168,85,247,0.1)' }}>
              <svg width="14" height="14" fill="none" stroke="#a855f7" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div className="settings-row-body">
              <span className="settings-row-label">Password</span>
              <span className="settings-row-value">••••••••</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── Data Section ──────────────────────────────────────── */}
      <div className="section">
        <div className="section-title">Data & Privacy</div>
        <div className="settings-group">

          <div className="settings-row">
            <div className="settings-row-icon" style={{ background: 'rgba(var(--success-rgb),0.1)' }}>
              <svg width="14" height="14" fill="none" stroke="var(--success)" strokeWidth="2" viewBox="0 0 24 24">
                <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
              </svg>
            </div>
            <div className="settings-row-body">
              <span className="settings-row-label">Cloud Sync</span>
              <span className="settings-row-value" style={{ color: 'var(--success)' }}>Connected · Supabase</span>
            </div>
            <span className="settings-badge-green">Live</span>
          </div>

          <div className="settings-row">
            <div className="settings-row-icon" style={{ background: 'var(--accent-glow)' }}>
              <svg width="14" height="14" fill="none" stroke="var(--accent)" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div className="settings-row-body">
              <span className="settings-row-label">Row Level Security</span>
              <span className="settings-row-value">Your data is private</span>
            </div>
            <span className="settings-badge-green">On</span>
          </div>

        </div>
      </div>

      {/* ── App Section ───────────────────────────────────────── */}
      <div className="section">
        <div className="section-title">App</div>
        <div className="settings-group">

          <div className="settings-row">
            <div className="settings-row-icon" style={{ background: 'rgba(var(--warning-rgb),0.1)' }}>
              <svg width="14" height="14" fill="none" stroke="var(--warning)" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div className="settings-row-body">
              <span className="settings-row-label">Version</span>
              <span className="settings-row-value">FitTracker v1.0.0</span>
            </div>
          </div>

          <div className="settings-row" style={{ cursor: 'pointer' }} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <div className="settings-row-icon" style={{ background: 'rgba(255,255,255,0.05)' }}>
              {theme === 'dark' ? (
                <svg width="14" height="14" fill="none" stroke="var(--text-muted)" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              ) : (
                <svg width="14" height="14" fill="none" stroke="var(--text-muted)" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              )}
            </div>
            <div className="settings-row-body">
              <span className="settings-row-label">Theme</span>
              <span className="settings-row-value">{theme === 'dark' ? 'Dark Mode (Lime)' : 'Light Mode (Orange)'}</span>
            </div>
            <div style={{
              width: 32, height: 18, borderRadius: 10,
              background: theme === 'dark' ? 'var(--accent)' : 'rgba(0,0,0,0.1)',
              position: 'relative', transition: 'var(--transition)'
            }}>
              <div style={{
                position: 'absolute', top: 2, left: theme === 'dark' ? 16 : 2,
                width: 14, height: 14, borderRadius: '50%',
                background: theme === 'dark' ? '#000' : '#fff',
                transition: 'var(--transition)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }} />
            </div>
          </div>

        </div>
      </div>

      {/* ── Sign Out ──────────────────────────────────────────── */}
      <div className="section">
        <div className="settings-group">
          {!showConfirm ? (
            <button
              id="btn-logout-settings"
              className="settings-logout-btn"
              onClick={() => setShowConfirm(true)}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign Out
            </button>
          ) : (
            <div className="settings-confirm">
              <p className="settings-confirm-text">Are you sure you want to sign out?</p>
              <div className="settings-confirm-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowConfirm(false)}
                  disabled={loggingOut}
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-logout"
                  className="settings-logout-confirm-btn"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  {loggingOut ? (
                    <span className="login-spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.2)' }} />
                  ) : (
                    <>
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Yes, Sign Out
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}
