import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { authApi, userApi } from '../utils/api'
import toast from 'react-hot-toast'

export function useAuth() {
  const { user, isAuthenticated, setAuth, updateUser, logout: storeLogout } = useAuthStore()
  const navigate = useNavigate()

  const login = useCallback(async (usernameOrEmail, password) => {
    const { data } = await authApi.login({ usernameOrEmail, password })
    setAuth(data.user, data.accessToken, data.refreshToken)
    return data
  }, [setAuth])

  const register = useCallback(async (form) => {
    const { data } = await authApi.register(form)
    setAuth(data.user, data.accessToken, data.refreshToken)
    return data
  }, [setAuth])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch { /* ignore */ } finally {
      storeLogout()
      navigate('/login')
      toast.success('Signed out')
    }
  }, [storeLogout, navigate])

  const refreshProfile = useCallback(async () => {
    try {
      const { data } = await userApi.getMe()
      updateUser(data)
      return data
    } catch (err) {
      console.error('Failed to refresh profile:', err)
    }
  }, [updateUser])

  return { user, isAuthenticated, login, register, logout, refreshProfile }
}
