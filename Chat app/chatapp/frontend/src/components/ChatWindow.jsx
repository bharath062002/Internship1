import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useChatStore, useAuthStore } from '../store'
import { messageApi } from '../utils/api'
import { useWebSocket } from '../hooks/useWebSocket'
import { format, isToday, isYesterday } from 'date-fns'
import Avatar from './Avatar'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import GroupInfoPanel from './GroupInfoPanel'
import styles from './ChatWindow.module.css'

export default function ChatWindow() {
  const { activeConversation, messages, typingUsers, setMessages, prependMessages, clearUnread } = useChatStore()
  const user = useAuthStore((s) => s.user)
  const { sendTyping } = useWebSocket()

  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [showGroupInfo, setShowGroupInfo] = useState(false)
  const messagesEndRef = useRef(null)
  const containerRef = useRef(null)

  const convId = activeConversation?.conversationId
  const convMessages = messages[convId] || []
  const typingSet = typingUsers[convId] || new Set()
  const isGroup = activeConversation?.isGroup
  const otherUser = activeConversation?.otherUser
  const group = activeConversation?.group

  const headerTitle = isGroup ? group?.name : (otherUser?.displayName || otherUser?.username)
  const headerSub = isGroup
    ? `${group?.memberCount} members`
    : otherUser?.onlineStatus === 'ONLINE' ? 'Online' : 'Offline'

  const fetchMessages = useCallback(async (pg = 0) => {
    if (!activeConversation) return
    setLoading(true)
    try {
      let res
      if (isGroup) {
        res = await messageApi.getGroup(group.id, pg)
      } else {
        res = await messageApi.getPrivate(otherUser.id, pg)
      }
      const { content, last } = res.data
      if (pg === 0) {
        setMessages(convId, content)
      } else {
        prependMessages(convId, content)
      }
      setHasMore(!last)
      setPage(pg)
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    } finally {
      setLoading(false)
    }
  }, [convId, isGroup, group?.id, otherUser?.id])

  useEffect(() => {
    setPage(0)
    setHasMore(true)
    fetchMessages(0)
    clearUnread(convId)

    // Mark as read
    if (!isGroup && otherUser?.id) {
      messageApi.markRead(otherUser.id).catch(() => {})
    }
  }, [convId])

  useEffect(() => {
    if (page === 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [convMessages.length])

  const handleScroll = () => {
    if (containerRef.current?.scrollTop === 0 && hasMore && !loading) {
      fetchMessages(page + 1)
    }
  }

  const groupedMessages = groupByDate(convMessages)

  return (
    <div className={styles.window}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {isGroup ? (
            <div className={styles.groupAvatar}>
              {group?.name?.slice(0, 2).toUpperCase()}
            </div>
          ) : (
            <Avatar user={otherUser} size={38} />
          )}
          <div>
            <div className={styles.headerName}>{headerTitle}</div>
            <div className={`${styles.headerSub} ${otherUser?.onlineStatus === 'ONLINE' ? styles.online : ''}`}>
              {headerSub}
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.iconBtn} title="Search messages">
            <SearchIcon />
          </button>
          <button className={styles.iconBtn} title="Info">
            <InfoIcon />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messages} ref={containerRef} onScroll={handleScroll}>
        {loading && page === 0 && (
          <div className={styles.loadingDots}>
            <span /><span /><span />
          </div>
        )}

        {hasMore && !loading && (
          <button className={styles.loadMore} onClick={() => fetchMessages(page + 1)}>
            Load older messages
          </button>
        )}

        {groupedMessages.map(({ date, msgs }) => (
          <React.Fragment key={date}>
            <div className={styles.dateDivider}>
              <span>{date}</span>
            </div>
            {msgs.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isMine={msg.sender?.id === user?.id}
                showAvatar={isGroup}
              />
            ))}
          </React.Fragment>
        ))}

        {/* Typing indicator */}
        {typingSet.size > 0 && (
          <div className={styles.typingIndicator}>
            <span /><span /><span />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {showGroupInfo && isGroup && (
        <GroupInfoPanel group={group} onClose={() => setShowGroupInfo(false)} />
      )}
      <MessageInput
        convId={convId}
        receiverId={!isGroup ? otherUser?.id : null}
        groupId={isGroup ? group?.id : null}
        onTyping={(typing) => sendTyping(
          !isGroup ? otherUser?.id : null,
          isGroup ? group?.id : null,
          typing
        )}
      />
    </div>
  )
}

function groupByDate(messages) {
  const groups = {}
  messages.forEach((msg) => {
    if (!msg.createdAt) return
    const d = new Date(msg.createdAt)
    let label
    if (isToday(d)) label = 'Today'
    else if (isYesterday(d)) label = 'Yesterday'
    else label = format(d, 'MMMM d, yyyy')

    if (!groups[label]) groups[label] = []
    groups[label].push(msg)
  })
  return Object.entries(groups).map(([date, msgs]) => ({ date, msgs }))
}

const SearchIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const InfoIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
