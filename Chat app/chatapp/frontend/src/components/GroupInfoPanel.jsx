import React, { useState } from 'react'
import { groupApi, userApi } from '../utils/api'
import { useChatStore, useAuthStore } from '../store'
import Avatar from './Avatar'
import toast from 'react-hot-toast'
import styles from './GroupInfoPanel.module.css'

export default function GroupInfoPanel({ group, onClose }) {
  const { user } = useAuthStore()
  const { groups, setGroups } = useChatStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const timer = React.useRef(null)

  const isAdmin = group.members?.some(
    (m) => m.id === user?.id && group.createdBy?.id === user?.id
  ) || group.createdBy?.id === user?.id

  const handleSearch = (q) => {
    setSearchQuery(q)
    clearTimeout(timer.current)
    if (!q.trim()) { setSearchResults([]); return }
    timer.current = setTimeout(async () => {
      try {
        const { data } = await userApi.search(q)
        // filter out existing members
        const memberIds = new Set((group.members || []).map((m) => m.id))
        setSearchResults(data.filter((u) => !memberIds.has(u.id)))
      } catch { setSearchResults([]) }
    }, 300)
  }

  const handleAddMember = async (memberId) => {
    try {
      const { data } = await groupApi.addMember(group.id, memberId)
      setGroups(groups.map((g) => (g.id === group.id ? data : g)))
      toast.success('Member added')
      setSearchQuery('')
      setSearchResults([])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member')
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member from the group?')) return
    try {
      await groupApi.removeMember(group.id, memberId)
      const updatedMembers = group.members.filter((m) => m.id !== memberId)
      setGroups(groups.map((g) =>
        g.id === group.id ? { ...g, members: updatedMembers, memberCount: updatedMembers.length } : g
      ))
      toast.success('Member removed')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member')
    }
  }

  const handleLeave = async () => {
    if (!window.confirm('Leave this group?')) return
    try {
      await groupApi.removeMember(group.id, user.id)
      setGroups(groups.filter((g) => g.id !== group.id))
      toast.success(`Left "${group.name}"`)
      onClose()
    } catch (err) {
      toast.error('Failed to leave group')
    }
  }

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>Group Info</span>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
      </div>

      {/* Group identity */}
      <div className={styles.identity}>
        <div className={styles.groupAvatar}>
          {group.name?.slice(0, 2).toUpperCase()}
        </div>
        <div className={styles.groupName}>{group.name}</div>
        {group.description && (
          <div className={styles.groupDesc}>{group.description}</div>
        )}
        <div className={styles.groupMeta}>
          Created by <strong>{group.createdBy?.displayName || group.createdBy?.username}</strong>
          {' · '}{group.memberCount} members
        </div>
      </div>

      {/* Members */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Members</div>
        <div className={styles.memberList}>
          {(group.members || []).map((member) => (
            <div key={member.id} className={styles.memberRow}>
              <Avatar user={member} size={36} />
              <div className={styles.memberInfo}>
                <div className={styles.memberName}>
                  {member.displayName || member.username}
                  {member.id === group.createdBy?.id && (
                    <span className={styles.adminBadge}>admin</span>
                  )}
                  {member.id === user?.id && (
                    <span className={styles.youBadge}>you</span>
                  )}
                </div>
                <div className={styles.memberUsername}>@{member.username}</div>
              </div>
              {isAdmin && member.id !== user?.id && (
                <button
                  className={styles.removeBtn}
                  onClick={() => handleRemoveMember(member.id)}
                  title="Remove member"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add members (admin only) */}
      {isAdmin && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Add Members</div>
          <input
            className={styles.searchInput}
            placeholder="Search users to add..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searchResults.length > 0 && (
            <div className={styles.searchResults}>
              {searchResults.map((u) => (
                <button
                  key={u.id}
                  className={styles.searchResultRow}
                  onClick={() => handleAddMember(u.id)}
                >
                  <Avatar user={u} size={30} />
                  <div className={styles.memberInfo}>
                    <div className={styles.memberName}>{u.displayName || u.username}</div>
                    <div className={styles.memberUsername}>@{u.username}</div>
                  </div>
                  <span className={styles.addIcon}>+</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Leave group */}
      <div className={styles.footer}>
        <button className={styles.leaveBtn} onClick={handleLeave}>
          🚪 Leave Group
        </button>
      </div>
    </div>
  )
}
