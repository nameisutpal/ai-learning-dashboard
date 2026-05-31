import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { LmsProvider } from './contexts/LmsContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { PreferencesProvider } from './contexts/PreferencesContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { FirestoreDataProvider } from './contexts/FirestoreDataContext.jsx'

/**
 * Provider order matters:
 * - `AuthProvider` — Firebase Auth session.
 * - `PreferencesProvider` — theme + goals (LocalStorage); must sit above `FirestoreDataProvider` so stats can read prefs.
 * - `FirestoreDataProvider` — real-time tasks / notes / study sessions for the signed-in user.
 * - `ToastProvider` stays outside so notifications still work during preference errors.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <PreferencesProvider>
            <FirestoreDataProvider>
              <LmsProvider>
                <App />
              </LmsProvider>
            </FirestoreDataProvider>
          </PreferencesProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
