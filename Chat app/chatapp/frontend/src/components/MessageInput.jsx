import React, { useState, useRef, useEffect, useCallback } from 'react'
import { messageApi } from '../utils/api'
import { useChatStore, useAuthStore } from '../store'
import styles from './MessageInput.module.css'

const TYPING_DEBOUNCE = 1000

export default function MessageInput({ convId, receiverId, groupId, onTyping }) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const { addMessage } = useChatStore()
  const user = useAuthStore((s) => s.user)
  const typingTimer = useRef(null)
  const isTyping = useRef(false)
  const textareaRef = useRef(null)

  const stopTyping = useCallback(() => {
    if (isTyping.current) {
      isTyping.current = false
      onTyping?.(false)
    }
  }, [onTyping])

  const handleChange = (e) => {
    setText(e.target.value)

    if (!isTyping.current) {
      isTyping.current = true
      onTyping?.(true)
    }

    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(stopTyping, TYPING_DEBOUNCE)

    // Auto-resize
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
    }
  }

  const handleSend = async () => {
    const content = text.trim()
    if (!content || sending) return

    stopTyping()
    setSending(true)
    setText('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    // Optimistic update
    const optimistic = {
      id: `opt_${Date.now()}`,
      sender: user,
      receiverId,
      groupId,
      content,
      type: 'TEXT',
      status: 'SENT',
      createdAt: new Date().toISOString(),
      isDeleted: false,
    }
    addMessage(convId, optimistic)

    try {
      const { data } = await messageApi.send({ receiverId, groupId, content, type: 'TEXT' })
      // Replace optimistic with real
      addMessage(convId, data)
    } catch (err) {
      console.error('Send failed:', err)
    } finally {
      setSending(false)
      textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    return () => {
      clearTimeout(typingTimer.current)
      stopTyping()
    }
  }, [convId])

  return (
    <div className={styles.container}>
      <div className={styles.inputRow}>
        <button className={styles.actionBtn} title="Attach file">
          <AttachIcon />
        </button>

        <div className={styles.textareaWrap}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            placeholder="Type a message..."
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            rows={1}
            autoFocus
          />
        </div>

        <button className={styles.actionBtn} title="Emoji">
          <EmojiIcon />
        </button>

        <button
          className={`${styles.sendBtn} ${text.trim() ? styles.sendActive : ''}`}
          onClick={handleSend}
          disabled={!text.trim() || sending}
          title="Send (Enter)"
        >
          {sending ? <span className={styles.spinner} /> : <SendIcon />}
        </button>
      </div>

      <div className={styles.hint}>
        <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for new line
      </div>
    </div>
  )
}

const AttachIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
)

const EmojiIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
)

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
)
