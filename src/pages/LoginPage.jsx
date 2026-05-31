import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthLayout } from '../components/auth/AuthLayout.jsx'
import { GoogleIcon } from '../components/auth/GoogleIcon.jsx'
import { Card } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Input } from '../components/ui/Input.jsx'
import { useAuth } from '../hooks/useAuth.js'

/**
 * Email + password login, plus Google popup sign-in.
 * After success, navigates to `location.state.from` or the dashboard home.
 */
export function LoginPage() {
  const { signInWithEmail, signInWithGoogle, mapFirebaseAuthError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from && location.state.from !== '/login' ? location.state.from : '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Enter your email address.')
      return
    }
    if (!password) {
      setError('Enter your password.')
      return
    }
    setSubmitting(true)
    try {
      await signInWithEmail(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(mapFirebaseAuthError(err?.code))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
      navigate(from, { replace: true })
    } catch (err) {
      setError(mapFirebaseAuthError(err?.code))
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <AuthLayout
      footer={
        <p>
          No account yet?{' '}
          <Link to="/signup" className="font-semibold text-violet-600 underline-offset-4 hover:underline dark:text-violet-300">
            Create one
          </Link>
        </p>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="p-6 shadow-2xl shadow-violet-500/10 dark:shadow-violet-950/40" padding="">
          <div className="border-b border-zinc-200/80 p-6 dark:border-white/10">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">Welcome back</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Sign in to open your AI learning workspace.</p>
          </div>

          <form className="space-y-4 p-6" onSubmit={handleSubmit} noValidate>
            {error ? (
              <p className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-800 dark:text-rose-100" role="alert">
                {error}
              </p>
            ) : null}

            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <Button type="submit" className="w-full" loading={submitting} disabled={googleLoading}>
              Sign in
            </Button>

            <div className="relative py-2 text-center text-xs text-zinc-500">
              <span className="relative z-10 bg-white/90 px-2 dark:bg-zinc-950/90">or continue with</span>
              <span className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-zinc-200 dark:bg-white/10" aria-hidden />
            </div>

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={handleGoogle}
              loading={googleLoading}
              loadingLabel="Opening Google…"
              disabled={submitting}
            >
              <GoogleIcon />
              Google
            </Button>
          </form>
        </Card>
      </motion.div>
    </AuthLayout>
  )
}
