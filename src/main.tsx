import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './phase11Sidebar.css';

const App = React.lazy(() => import('./App.tsx'));

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Studio runtime error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#050608',
            color: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div style={{ maxWidth: 760, width: '100%' }}>
            <div style={{ fontSize: 12, letterSpacing: '0.12em', color: '#67e8f9', marginBottom: 10 }}>
              BASITBIOYUN STUDIO
            </div>
            <h1 style={{ fontSize: 24, margin: '0 0 12px' }}>Editor failed to start</h1>
            <p style={{ color: '#a1a1aa', margin: '0 0 16px' }}>
              The interface was protected from a blank-screen crash. Runtime error details are below.
            </p>
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
                padding: 16,
                borderRadius: 12,
                background: '#111318',
                border: '1px solid #27272a',
                color: '#fca5a5',
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              {this.state.error.message || String(this.state.error)}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root was not found.');
}

createRoot(rootElement).render(
  <AppErrorBoundary>
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            background: '#050608',
            color: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Loading Studio…
        </div>
      }
    >
      <App />
    </Suspense>
  </AppErrorBoundary>,
);
