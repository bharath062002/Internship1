import React, { useState } from 'react'
import { useAuthStore } from '../store'
import { userApi } from '../utils/api'
import Avatar from './Avatar'
import toast from 'react-hot-toast'
import styles from './Modal.module.css'
import pStyles from './ProfileSettingsModal.module.css'

export default function ProfileSettingsModal({ onClose }) {
  const { user, updateUser } = useAuthStore()
  const [form, setForm] = useState({
    displayName:   user?.displayName   || '',
    statusMessage: user?.statusMessage || '',
    avatarUrl:     user?.avatarUrl     || '',
  })
  const [saving, setSaving] = useState(false)
  const [statusChoice, setStatusChoice] = useState(user?.onlineStatus || 'ONLINE')

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await userApi.updateMe(form)
      updateUser(data)

      // Update online status separately
      await userApi.updateStatus(statusChoice)
      updateUser({ ...data, onlineStatus: statusChoice })

      toast.success('Profile updated!')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const statusOptions = [
    { value: 'ONLINE', label: '🟢 Online' },
    { value: 'AWAY',   label: '🟡 Away' },
    { value: 'BUSY',   label: '🔴 Busy' },
  ]

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Profile Settings</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          {/* Avatar preview */}
          <div className={pStyles.avatarSection}>
            <Avatar user={{ ...user, ...form }} size={72} />
            <div className={pStyles.avatarHint}>
              Paste an image URL below to change your avatar
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Display Name</label>
            <input
              className={styles.input}
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              placeholder="Your display name"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Status Message</label>
            <input
              className={styles.input}
              value={form.statusMessage}
              onChange={(e) => setForm({ ...form, statusMessage: e.target.value })}
              placeholder="What's on your mind?"
              maxLength={100}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Avatar URL</label>
            <input
              className={styles.input}
              value={form.avatarUrl}
              onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Availability</label>
            <div className={pStyles.statusGrid}>
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`${pStyles.statusBtn} ${statusChoice === opt.value ? pStyles.statusActive : ''}`}
                  onClick={() => setStatusChoice(opt.value)}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Read-only info */}
          <div className={pStyles.readOnly}>
            <div className={pStyles.readOnlyRow}>
              <span className={pStyles.readOnlyLabel}>Username</span>
              <span className={pStyles.readOnlyValue}>@{user?.username}</span>
            </div>
            <div className={pStyles.readOnlyRow}>
              <span className={pStyles.readOnlyLabel}>Email</span>
              <span className={pStyles.readOnlyValue}>{user?.email}</span>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button className={styles.primaryBtn} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
