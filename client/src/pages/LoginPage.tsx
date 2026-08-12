import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../api/client'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { ErrorBanner } from '../components/ui/feedback'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await login(username, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#eef1f8,_#f5f6fa)] p-4">
      <Card className="w-full max-w-sm p-8">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="mb-2 flex flex-col items-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-base font-semibold text-white">
              T
            </div>
            <h1 className="text-lg font-semibold text-slate-900">Typesense Console</h1>
            <p className="text-sm text-slate-500">Sign in to manage your cluster</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {error && <ErrorBanner>{error}</ErrorBanner>}
          <Button type="submit" disabled={isSubmitting} className="mt-1">
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
