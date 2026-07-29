import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '../firebase'

// 이름 + 6자리 PIN 로그인
// Firebase Auth는 이메일/비밀번호 로그인만 기본 제공하므로
// 이름을 `이름@atec.local` 형식 이메일로, PIN을 비밀번호로 사용합니다.
// (Firebase 콘솔 > Authentication > Users 에서 관리자 계정을 미리 만들어 두어야 합니다.)

const AuthContext = createContext(null)

function toEmail(name) {
  return `${name.trim()}@atec.local`
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  async function login(name, pin) {
    if (!name || pin.length !== 6) {
      throw new Error('이름과 6자리 PIN을 입력해주세요.')
    }
    await signInWithEmailAndPassword(auth, toEmail(name), pin)
  }

  async function logout() {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
