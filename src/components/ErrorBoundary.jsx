import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('FitTracker crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0f',
          fontFamily: 'Inter, sans-serif',
          padding: '24px',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '420px',
            width: '100%',
            textAlign: 'center',
          }}>
            <div style={{
              width: 48, height: 48,
              background: 'rgba(var(--danger-rgb),0.1)',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <svg width="22" height="22" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: '0 0 8px' }}>
              Something went wrong
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: '0 0 8px', lineHeight: 1.6 }}>
              The app failed to start. If you're on Vercel, make sure the Supabase environment variables are set.
            </p>
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: 10,
              padding: '10px 14px',
              margin: '12px 0 20px',
              textAlign: 'left',
            }}>
              <p style={{ color: 'rgba(var(--accent-rgb),0.8)', fontSize: 10, fontFamily: 'monospace', margin: 0, lineHeight: 1.8 }}>
                VITE_SUPABASE_URL=https://...<br/>
                VITE_SUPABASE_ANON_KEY=eyJ...
              </p>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, margin: '0 0 20px' }}>
              Add these in: Vercel Dashboard → Project → Settings → Environment Variables
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(135deg, #a3e635, #65a30d)',
                color: '#000',
                border: 'none',
                borderRadius: 10,
                padding: '10px 24px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Retry
            </button>
            {this.state.error && (
              <p style={{ color: 'rgba(var(--danger-rgb),0.5)', fontSize: 10, marginTop: 16, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {this.state.error.message}
              </p>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
