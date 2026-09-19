import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { tokenStorage } from '../api/client'
import { loginUser, registerUser, logoutUser } from '../api/auth'
import { getProfile } from '../api/profile'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // loading=true, пока проверяем, есть ли валидный токен — нужно, чтобы
  // не мигнуть страницей логина на долю секунды при обновлении страницы.
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async () => {
    try {
      const profile = await getProfile()
      setUser(profile)
    } catch {
      // Токен невалиден/истёк и не смог обновиться — тихо разлогиниваем.
      tokenStorage.clear()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (tokenStorage.getAccess()) {
      loadProfile()
    } else {
      setLoading(false)
    }
  }, [loadProfile])

  const login = useCallback(async (credentials) => {
    await loginUser(credentials)
    await loadProfile()
  }, [loadProfile])

  const register = useCallback(async (payload) => {
    const newUser = await registerUser(payload)
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    logoutUser()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile: loadProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth должен использоваться внутри <AuthProvider>')
  return ctx
}
