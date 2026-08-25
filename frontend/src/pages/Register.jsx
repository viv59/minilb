import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Server as ServerIcon } from 'lucide-react'
import { useAuthStore } from '../store/authStore.js'
import Button from '../components/common/Button.jsx'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const register = useAuthStore((s) => s.register)
  const loading = useAuthStore((s) => s.loading)
  const error = useAuthStore((s) => s.error)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await register(name, email, password)
      navigate('/', { replace: true })
    } catch {
      // error already captured in the store
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg px-4">
      <div className="w-full max-w-sm rounded-2xl border border-app-border-soft bg-app-panel p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex aspect-square w-12 items-center justify-center rounded-full border border-accent1/70 bg-accent1/10">
            <ServerIcon className="h-5 w-5 text-app-text" />
          </div>
          <h1 className="text-lg text-app-text">Create an account</h1>
          <p className="text-xs text-text-faint">New accounts start with standard access</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-xs font-medium text-app-text">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-app-border-soft  px-3 py-2 text-sm outline-none transition focus:border-accent1"
              placeholder="Jane Doe"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-medium text-app-text">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-app-border-soft  px-3 py-2 text-sm outline-none transition focus:border-accent1"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-medium text-app-text">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-app-border-soft  px-3 py-2 text-sm outline-none transition focus:border-accent1"
              placeholder="At least 8 characters"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-status-red/30 bg-status-red/10 px-3 py-2 text-xs text-status-red">
              {error}
            </div>
          )}

          {/* <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg border border-accent1/70 bg-accent1/10 py-2 text-sm font-semibold text-accent1 transition hover:bg-accent1/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button> */}
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-text-faint">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent1 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}