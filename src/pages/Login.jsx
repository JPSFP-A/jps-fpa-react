import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-sm p-8 shadow-2xl">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⚡</div>
          <h1 className="text-2xl font-bold text-white">JPS FP&amp;A</h1>
          <p className="text-muted text-sm mt-1">Financial Planning &amp; Analysis Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[11px] text-muted font-semibold uppercase tracking-wide block mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="w-full bg-surface2 border border-border text-fg rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] text-muted font-semibold uppercase tracking-wide block mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-surface2 border border-border text-fg rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-accent transition-colors"
            />
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger text-danger text-[12px] rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" disabled={loading} className="w-full justify-center mt-2">
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="text-center text-[11px] text-muted mt-6">
          Jamaica Public Service Company Ltd
        </p>
      </div>
    </div>
  )
}
