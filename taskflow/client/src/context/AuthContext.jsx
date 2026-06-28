import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'
import {
  getCurrentUser,
  loginUser as loginRequest,
  registerUser as registerRequest,
} from '../services/authService'

const AuthContext = createContext(null)
const TOKEN_KEY = 'taskflow_token'

function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(token))

  const saveSession = useCallback((authData) => {
    localStorage.setItem(TOKEN_KEY, authData.token)
    api.defaults.headers.common.Authorization = `Bearer ${authData.token}`
    setToken(authData.token)
    setUser(authData.user)
  }, [])

  const register = useCallback(
    async (formData) => {
      const authData = await registerRequest(formData)
      saveSession(authData)
      return authData
    },
    [saveSession],
  )

  const login = useCallback(
    async (credentials) => {
      const authData = await loginRequest(credentials)
      saveSession(authData)
      toast.success(`Welcome back, ${authData.user?.name || 'there'}! 👋`)
      return authData
    },
    [saveSession],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    delete api.defaults.headers.common.Authorization
    setToken(null)
    setUser(null)
    toast.success('Logged out successfully')
  }, [])

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        api.defaults.headers.common.Authorization = `Bearer ${token}`
        const data = await getCurrentUser(token)
        setUser(data.user)
      } catch {
        logout()
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [token, logout])

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token),
      register,
      login,
      logout,
    }),
    [user, token, loading, register, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

export { AuthProvider, useAuth }
