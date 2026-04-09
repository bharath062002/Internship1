import React, { useEffect } from 'react'
import { useChatStore } from '../store'
import { notificationApi } from '../utils/api'
import { formatDistanceToNow } from 'date-fns'
import styles from './NotificationPanel.module.css'

export default function NotificationPanel({ onClose }) {
  const { notifications, markNotificationsRead } = useChatStore()

  useEffect(() => {
    notificationApi.markAllRead().catch(() => {})
    markNotificationsRead()
  }, [])

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>Notifications</span>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
      </div>

      <div className={styles.list}>
        {notifications.length === 0 ? (
          <div className={styles.empty}>
            <span>🔔</span>
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className={`${styles.item} ${!n.isRead ? styles.unread : ''}`}>
              <div className={styles.itemIcon}>{typeIcon(n.type)}</div>
              <div className={styles.itemContent}>
                <div className={styles.itemTitle}>{n.title}</div>
                <div className={styles.itemBody}>{n.body}</div>
                {n.createdAt && (
                  <div className={styles.itemTime}>
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function typeIcon(type) {
  switch (type) {
    case 'NEW_MESSAGE': return '💬'
    case 'GROUP_INVITE': return '👥'
    case 'MENTION': return '@'
    default: return '🔔'
  }
}
