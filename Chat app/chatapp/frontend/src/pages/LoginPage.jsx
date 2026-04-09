import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../utils/api'
import { getApiErrorMessage } from '../utils/errors'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'
import styles from './AuthPage.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authApi.login(form)
      setAuth(data.user, data.accessToken, data.refreshToken)
      navigate('/')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Login failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid} aria-hidden="true">
        {Array.from({ length: 64 }).map((_, i) => (
          <div key={i} className={styles.gridCell} />
        ))}
      </div>

      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>N</span>
          <span className={styles.logoText}>NEXUS</span>
        </div>

        <h1 className={styles.heading}>Welcome back</h1>
        <p className={styles.subheading}>Sign in to continue messaging</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Username or Email</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Enter your username or email"
              value={form.usernameOrEmail}
              onChange={(e) => setForm({ ...form, usernameOrEmail: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Sign In →'}
          </button>
        </form>

        <p className={styles.footer}>
          New to Nexus?{' '}
          <Link to="/register" className={styles.link}>Create account</Link>
        </p>
      </div>
    </div>
  )
}
