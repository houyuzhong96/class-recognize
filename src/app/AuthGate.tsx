import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import {
  GraduationCap,
  KeyRound,
  LoaderCircle,
  LogIn,
  Mail,
  UserPlus,
} from 'lucide-react'
import { isCloudConfigured, supabase } from '../data/supabase'
import { validateCredentials, validateEmail } from './authValidation'

interface AuthGateProps {
  children(session: Session | null): ReactNode
}

type AuthMode = 'login' | 'register'

function translateAuthError(message: string): string {
  const normalized = message.toLowerCase()
  if (normalized.includes('invalid login credentials')) {
    return '邮箱或密码不正确'
  }
  if (normalized.includes('user already registered')) {
    return '该邮箱已经注册，请直接登录'
  }
  if (normalized.includes('password should contain')) {
    return '密码需同时包含小写字母、大写字母和数字'
  }
  if (normalized.includes('email rate limit exceeded')) {
    return '发送次数过多，请稍后再试'
  }
  return message
}

export function AuthGate({ children }: AuthGateProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

  async function submitPassword() {
    const validationError = validateCredentials(email, password)
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    setError('')
    setMessage('')

    const result =
      mode === 'login'
        ? await authClient.auth.signInWithPassword({
            email: email.trim(),
            password,
          })
        : await authClient.auth.signUp({
            email: email.trim(),
            password,
          })

    setSubmitting(false)
    if (result.error) {
      setError(translateAuthError(result.error.message))
      return
    }

    if (mode === 'register' && !result.data.session) {
      setMode('login')
      setMessage('账号已创建，请使用邮箱和密码登录。')
      return
    }
    setMessage(mode === 'login' ? '登录成功。' : '账号创建成功。')
  }

  async function sendMagicLink() {
    const validationError = validateEmail(email)
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    setError('')
    setMessage('')

    const result = await authClient.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    })

    setSubmitting(false)
    if (result.error) {
      setError(translateAuthError(result.error.message))
      return
    }
    setMessage('备用登录链接已发送，请打开邮箱完成登录。')
  }

  return (
    <main className="auth-page">
      <form
        className="auth-card"
        onSubmit={(event) => {
          event.preventDefault()
          void submitPassword()
        }}
      >
        <span className="auth-mark" aria-hidden="true">
          <GraduationCap size={26} strokeWidth={1.8} />
        </span>
        <h1>{mode === 'login' ? '登录数学教学反思' : '创建账号'}</h1>
        <p>
          {mode === 'login'
            ? '使用邮箱和密码登录，登录状态会长期保存在当前设备。'
            : '设置邮箱和密码，创建后可直接进入应用。'}
        </p>

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

        <label className="field">
          <span>密码</span>
          <input
            type="password"
            value={password}
            required
            minLength={8}
            autoComplete={
              mode === 'login' ? 'current-password' : 'new-password'
            }
            placeholder="至少 8 位"
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <button
          type="submit"
          className="button button--primary"
          disabled={submitting}
        >
          {submitting ? (
            <LoaderCircle
              aria-hidden="true"
              className="spin"
              size={18}
            />
          ) : mode === 'login' ? (
            <LogIn aria-hidden="true" size={18} />
          ) : (
            <UserPlus aria-hidden="true" size={18} />
          )}
          {submitting
            ? '处理中'
            : mode === 'login'
              ? '密码登录'
              : '创建账号'}
        </button>

        <button
          type="button"
          className="auth-mode-button"
          onClick={() => {
            setMode((current) =>
              current === 'login' ? 'register' : 'login',
            )
            setMessage('')
            setError('')
          }}
        >
          <KeyRound aria-hidden="true" size={16} />
          {mode === 'login' ? '没有账号，注册一个' : '已有账号，返回登录'}
        </button>

        {mode === 'login' ? (
          <button
            type="button"
            className="auth-link-button"
            disabled={submitting}
            onClick={() => void sendMagicLink()}
          >
            <Mail aria-hidden="true" size={15} />
            忘记密码或使用邮箱链接登录
          </button>
        ) : null}

        {message ? <p className="form-message">{message}</p> : null}
        {error ? (
          <p className="form-message form-message--error">{error}</p>
        ) : null}
      </form>
    </main>
  )
}
