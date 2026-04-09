import React, { useState } from 'react'
import { format } from 'date-fns'
import { useChatStore } from '../store'
import { messageApi } from '../utils/api'
import Avatar from './Avatar'
import styles from './MessageBubble.module.css'

export default function MessageBubble({ message, isMine, showAvatar }) {
  const [showMenu, setShowMenu] = useState(false)
  const { messages, setMessages } = useChatStore()

  const time = message.createdAt ? format(new Date(message.createdAt), 'HH:mm') : ''

  const handleDelete = async () => {
    try {
      await messageApi.deleteMessage(message.id)
      setShowMenu(false)
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  if (message.isDeleted) {
    return (
      <div className={`${styles.row} ${isMine ? styles.mine : styles.theirs}`}>
        <div className={`${styles.bubble} ${styles.deleted}`}>
          <span>🚫 This message was deleted</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`${styles.row} ${isMine ? styles.mine : styles.theirs}`}
      onMouseLeave={() => setShowMenu(false)}
    >
      {!isMine && showAvatar && (
        <Avatar user={message.sender} size={28} />
      )}

      <div className={styles.bubbleWrap}>
        {!isMine && showAvatar && (
          <span className={styles.senderName}>{message.sender?.displayName}</span>
        )}

        {message.replyToId && (
          <div className={styles.replyBar}>
            Replying to message #{message.replyToId}
          </div>
        )}

        <div
          className={`${styles.bubble} ${isMine ? styles.sentBubble : styles.receivedBubble}`}
          onMouseEnter={() => setShowMenu(true)}
        >
          {message.type === 'IMAGE' && message.mediaUrl && (
            <img src={message.mediaUrl} alt="media" className={styles.mediaImg} />
          )}

          <span className={styles.content}>{message.content}</span>

          <div className={styles.meta}>
            <span className={styles.time}>{time}</span>
            {isMine && <StatusTick status={message.status} />}
          </div>
        </div>

        {showMenu && isMine && (
          <div className={styles.menu}>
            <button className={styles.menuItem} onClick={handleDelete}>Delete</button>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusTick({ status }) {
  if (status === 'READ') {
    return <span className={`${styles.tick} ${styles.read}`}>✓✓</span>
  }
  if (status === 'DELIVERED') {
    return <span className={styles.tick}>✓✓</span>
  }
  return <span className={styles.tick}>✓</span>
}
