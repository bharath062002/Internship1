import React, { useState, useEffect, useRef } from 'react'
import { userApi } from '../utils/api'
import { useAuthStore, useChatStore } from '../store'
import Avatar from './Avatar'
import styles from './Modal.module.css'

export default function UserSearchModal({ onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const currentUser = useAuthStore((s) => s.user)
  const { setActiveConversation, conversations } = useChatStore()
  const inputRef = useRef(null)
  const timer = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    clearTimeout(timer.current)
    if (!query.trim()) { setResults([]); return }

    timer.current = setTimeout(async () => {
      setLoading(true)
      try {
        const { data } = await userApi.search(query)
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer.current)
  }, [query])

  const handleSelect = (user) => {
    const conversationId = `private_${Math.min(currentUser?.id ?? user.id, user.id)}_${Math.max(currentUser?.id ?? user.id, user.id)}`
    setActiveConversation({
      conversationId,
      otherUser: user,
      isGroup: false,
    })
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>New Conversation</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.searchWrap}>
          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Search users by name, username or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className={styles.results}>
          {loading && <div className={styles.loading}>Searching...</div>}

          {!loading && results.length === 0 && query.trim() && (
            <div className={styles.empty}>No users found for "{query}"</div>
          )}

          {!loading && results.length === 0 && !query.trim() && (
            <div className={styles.empty}>Start typing to search users</div>
          )}

          {results.map((user) => (
            <button key={user.id} className={styles.resultItem} onClick={() => handleSelect(user)}>
              <Avatar user={user} size={40} />
              <div className={styles.resultInfo}>
                <div className={styles.resultName}>{user.displayName || user.username}</div>
                <div className={styles.resultSub}>@{user.username}</div>
              </div>
              <span className={`${styles.onlineDot} ${user.onlineStatus === 'ONLINE' ? styles.online : ''}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
