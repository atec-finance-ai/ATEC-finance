import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(name, pin)
    } catch (err) {
      setError('로그인 실패: 이름 또는 PIN을 확인해주세요.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-box">
      <h2>관리자 로그인</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-text">{error}</div>}
        <input
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="username"
        />
        <input
          placeholder="PIN 6자리"
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          autoComplete="current-password"
        />
        <button className="btn-primary" type="submit" disabled={busy}>
          {busy ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  )
}
