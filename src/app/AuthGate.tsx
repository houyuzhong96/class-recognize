import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { GraduationCap, LoaderCircle, Mail } from 'lucide-react'
import { isCloudConfigured, supabase } from '../data/supabase'

interface AuthGateProps {
  children(session: Session | null): ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!supabase) return

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!isCloudConfigured || !supabase) {
    return <>{children(null)}</>
  }

  const authClient = supabase

  if (loading) {
    return (
      <div className="auth-page">
        <LoaderCircle className="spin" aria-label="正在加载" size={24} />
      </div>
    )
  }

  if (session) {
    return <>{children(session)}</>
  }

  return (
    <main className="auth-page">
      <form
        className="auth-card"
        onSubmit={(event) => {
          event.preventDefault()
          setSubmitting(true)
          setError('')
          setMessage('')

          void authClient.auth
            .signInWithOtp({
              email,
              options: { emailRedirectTo: window.location.origin },
            })
            .then(({ error: authError }) => {
              if (authError) {
                setError(authError.message)
                return
              }
              setMessage('登录链接已发送，请打开邮箱完成登录。')
            })
            .finally(() => setSubmitting(false))
        }}
      >
        <span className="auth-mark" aria-hidden="true">
          <GraduationCap size={26} strokeWidth={1.8} />
        </span>
        <h1>登录数学教学反思</h1>
        <p>使用邮箱接收登录链接，电脑和手机登录同一邮箱即可同步。</p>

        <label className="field">
          <span>邮箱</span>
          <input
            type="email"
            value={email}
            required
            autoComplete="email"
            placeholder="teacher@example.com"
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <button
          type="submit"
          className="button button--primary"
          disabled={submitting}
        >
          <Mail aria-hidden="true" size={18} />
          {submitting ? '发送中' : '发送登录链接'}
        </button>

        {message ? <p className="form-message">{message}</p> : null}
        {error ? (
          <p className="form-message form-message--error">{error}</p>
        ) : null}
      </form>
    </main>
  )
}
