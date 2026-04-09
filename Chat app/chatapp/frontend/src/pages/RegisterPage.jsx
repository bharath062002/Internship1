import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../utils/api'
import { getApiErrorMessage } from '../utils/errors'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'
import styles from './AuthPage.module.css'

export default function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        displayName: form.displayName.trim() || form.username.trim(),
      }

      const { data } = await authApi.register(payload)
      setAuth(data.user, data.accessToken, data.refreshToken)
      navigate('/')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Registration failed'))
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

        <h1 className={styles.heading}>Create account</h1>
        <p className={styles.subheading}>Join the network</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Username</label>
              <input
                type="text"
                className={styles.input}
                placeholder="username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Display Name</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Your name"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className={styles.input}
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              className={styles.input}
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={8}
            />
          </div>

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Create Account →'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
