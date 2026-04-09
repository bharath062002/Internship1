import React, { useState, useRef } from 'react'
import { useChatStore, useAuthStore } from '../store'
import { userApi, groupApi } from '../utils/api'
import { formatDistanceToNow } from 'date-fns'
import NewGroupModal from './NewGroupModal'
import UserSearchModal from './UserSearchModal'
import NotificationPanel from './NotificationPanel'
import ProfileSettingsModal from './ProfileSettingsModal'
import Avatar from './Avatar'
import styles from './Sidebar.module.css'

const tabs = ['Chats', 'Groups']

export default function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const {
    conversations, groups, activeConversation, setActiveConversation,
    onlineUsers, unreadNotifications,
  } = useChatStore()

  const [tab, setTab] = useState('Chats')
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showProfileSettings, setShowProfileSettings] = useState(false)

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv)
  }

  const handleSelectGroup = (group) => {
    setActiveConversation({
      conversationId: `group_${group.id}`,
      group,
      isGroup: true,
    })
  }

  return (
    <>
      <aside className={styles.sidebar}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.brand}>
            <span className={styles.brandMark}>N</span>
            <span className={styles.brandName}>NEXUS</span>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.iconBtn}
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              <BellIcon />
              {unreadNotifications > 0 && (
                <span className={styles.badge}>{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>
              )}
            </button>
            <button
              className={styles.iconBtn}
              onClick={() => setShowSearchModal(true)}
              title="New chat"
            >
              <PenIcon />
            </button>
            <button
              className={styles.iconBtn}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              title="Profile"
            >
              <Avatar user={user} size={28} />
            </button>
          </div>
        </div>

        {/* Profile menu */}
        {showProfileMenu && (
          <div className={styles.profileMenu}>
            <div className={styles.profileInfo}>
              <Avatar user={user} size={40} />
              <div>
                <div className={styles.profileName}>{user?.displayName}</div>
                <div className={styles.profileUsername}>@{user?.username}</div>
              </div>
            </div>
            <div className={styles.profileMenuDivider} />
            <button className={styles.profileMenuItem} onClick={() => { setShowProfileSettings(true); setShowProfileMenu(false) }}>
              <SettingsIcon /> Profile settings
            </button>
            <button className={styles.profileMenuItem} onClick={logout}>
              <LogoutIcon /> Sign out
            </button>
          </div>
        )}

        {/* Notification panel */}
        {showNotifications && (
          <NotificationPanel onClose={() => setShowNotifications(false)} />
        )}

        {/* Tabs */}
        <div className={styles.tabs}>
          {tabs.map((t) => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
          {tab === 'Groups' && (
            <button
              className={styles.newGroupBtn}
              onClick={() => setShowGroupModal(true)}
              title="New group"
            >
              +
            </button>
          )}
        </div>

        {/* List */}
        <div className={styles.list}>
          {tab === 'Chats' && (
            conversations.length === 0 ? (
              <div className={styles.empty}>
                <p>No conversations yet</p>
                <button className={styles.startBtn} onClick={() => setShowSearchModal(true)}>
                  Start a chat
                </button>
              </div>
            ) : (
              conversations.map((conv) => (
                <ConversationItem
                  key={conv.conversationId}
                  conv={conv}
                  isActive={activeConversation?.conversationId === conv.conversationId}
                  isOnline={onlineUsers.has(conv.otherUser?.id)}
                  onSelect={() => handleSelectConversation(conv)}
                />
              ))
            )
          )}

          {tab === 'Groups' && (
            groups.length === 0 ? (
              <div className={styles.empty}>
                <p>No groups yet</p>
                <button className={styles.startBtn} onClick={() => setShowGroupModal(true)}>
                  Create a group
                </button>
              </div>
            ) : (
              groups.map((group) => (
                <GroupItem
                  key={group.id}
                  group={group}
                  isActive={activeConversation?.conversationId === `group_${group.id}`}
                  onSelect={() => handleSelectGroup(group)}
                />
              ))
            )
          )}
        </div>

        {/* Footer status bar */}
        <div className={styles.statusBar}>
          <span className={styles.statusDot} />
          <span className={styles.statusText}>Connected</span>
        </div>
      </aside>

      {showGroupModal && <NewGroupModal onClose={() => setShowGroupModal(false)} />}
      {showSearchModal && <UserSearchModal onClose={() => setShowSearchModal(false)} />}
      {showProfileSettings && <ProfileSettingsModal onClose={() => setShowProfileSettings(false)} />}
    </>
  )
}

function ConversationItem({ conv, isActive, isOnline, onSelect }) {
  const { otherUser, lastMessage, unreadCount } = conv

  return (
    <button
      className={`${styles.item} ${isActive ? styles.itemActive : ''}`}
      onClick={onSelect}
    >
      <div className={styles.avatarWrap}>
        <Avatar user={otherUser} size={44} />
        <span className={`${styles.statusIndicator} ${isOnline ? styles.online : styles.offline}`} />
      </div>
      <div className={styles.itemContent}>
        <div className={styles.itemTop}>
          <span className={styles.itemName}>{otherUser?.displayName || otherUser?.username}</span>
          {lastMessage?.createdAt && (
            <span className={styles.itemTime}>
              {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: false })}
            </span>
          )}
        </div>
        <div className={styles.itemBottom}>
          <span className={styles.itemPreview}>
            {lastMessage?.isDeleted
              ? '🚫 Deleted'
              : lastMessage?.type === 'IMAGE'
              ? '📷 Photo'
              : lastMessage?.content || 'Start a conversation'}
          </span>
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </div>
      </div>
    </button>
  )
}

function GroupItem({ group, isActive, onSelect }) {
  return (
    <button
      className={`${styles.item} ${isActive ? styles.itemActive : ''}`}
      onClick={onSelect}
    >
      <div className={styles.groupAvatar}>
        {group.name.slice(0, 2).toUpperCase()}
      </div>
      <div className={styles.itemContent}>
        <div className={styles.itemTop}>
          <span className={styles.itemName}>{group.name}</span>
          <span className={styles.itemTime}>{group.memberCount} members</span>
        </div>
        <div className={styles.itemBottom}>
          <span className={styles.itemPreview}>{group.description || 'Group chat'}</span>
        </div>
      </div>
    </button>
  )
}

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const PenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
)
const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const SettingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)
