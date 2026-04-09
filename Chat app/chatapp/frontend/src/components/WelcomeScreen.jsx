import React from 'react'
import { useAuthStore } from '../store'
import styles from './WelcomeScreen.module.css'

export default function WelcomeScreen() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.logoMark}>N</div>
        <h1 className={styles.title}>Welcome to Nexus</h1>
        <p className={styles.subtitle}>
          Hey <strong>{user?.displayName || user?.username}</strong>, select a conversation from the sidebar or start a new one.
        </p>

        <div className={styles.features}>
          {features.map((f) => (
            <div key={f.label} className={styles.feature}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <div>
                <div className={styles.featureLabel}>{f.label}</div>
                <div className={styles.featureDesc}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const features = [
  { icon: '⚡', label: 'Real-time messaging', desc: 'Powered by WebSocket' },
  { icon: '🔒', label: 'Secure & encrypted', desc: 'JWT-authenticated sessions' },
  { icon: '👥', label: 'Group chats', desc: 'Create and manage groups' },
  { icon: '🔔', label: 'Notifications', desc: 'Never miss a message' },
]
