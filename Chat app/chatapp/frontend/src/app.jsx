import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

function AppShellState({ title, message, actionLabel = 'Reload', onAction = () => window.location.reload() }) {
  return (
    <div style={shellStyles.wrap}>
      <div style={shellStyles.card}>
        <div style={shellStyles.mark}>N</div>
        <h1 style={shellStyles.title}>{title}</h1>
        <p style={shellStyles.message}>{message}</p>
        <button style={shellStyles.button} onClick={onAction}>
          {actionLabel}
        </button>
      </div>
    </div>
  )
}

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    console.error('Authenticated app crashed:', error)
  }

  render() {
    if (this.state.error) {
      return (
        <AppShellState
          title="Chat crashed"
          message={this.state.error.message || 'An unexpected client error occurred.'}
        />
      )
    }

    return this.props.children
  }
}

const ChatPage = lazy(() =>
  import('./pages/ChatPage').catch((error) => {
    console.error('Failed to load ChatPage:', error)
    return {
      default: function ChatPageLoadError() {
        return (
          <AppShellState
            title="Chat failed to load"
            message={error.message || 'The chat page could not be loaded.'}
          />
        )
      },
    }
  })
)

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return !isAuthenticated ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Suspense
                fallback={
                  <AppShellState
                    title="Loading chat"
                    message="Preparing your conversations..."
                    actionLabel="Refresh"
                  />
                }
              >
                <AppErrorBoundary>
                  <ChatPage />
                </AppErrorBoundary>
              </Suspense>
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  )
}

const shellStyles = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: 'var(--bg-base)',
    color: 'var(--text-primary)',
  },
  card: {
    width: 'min(420px, 100%)',
    padding: '32px 28px',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    background: 'var(--bg-surface)',
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
    textAlign: 'center',
  },
  mark: {
    width: '52px',
    height: '52px',
    margin: '0 auto 18px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--accent)',
    color: 'var(--text-inverse)',
    fontWeight: 800,
    fontSize: '24px',
    fontFamily: 'var(--font-display)',
  },
  title: {
    margin: '0 0 10px',
    fontSize: '28px',
    fontFamily: 'var(--font-display)',
  },
  message: {
    margin: '0 0 20px',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  button: {
    padding: '10px 18px',
    borderRadius: '8px',
    border: '1px solid var(--border-accent)',
    background: 'var(--accent)',
    color: 'var(--text-inverse)',
    fontWeight: 700,
  },
}
