import React, { useState, useEffect } from 'react'
import { userApi, groupApi } from '../utils/api'
import { useChatStore } from '../store'
import Avatar from './Avatar'
import toast from 'react-hot-toast'
import styles from './Modal.module.css'

export default function NewGroupModal({ onClose }) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)
  const { groups, setGroups } = useChatStore()
  const timer = React.useRef(null)

  useEffect(() => {
    clearTimeout(timer.current)
    if (!query.trim()) { setResults([]); return }

    timer.current = setTimeout(async () => {
      try {
        const { data } = await userApi.search(query)
        setResults(data)
      } catch {
        setResults([])
      }
    }, 300)
  }, [query])

  const toggleSelect = (user) => {
    setSelected((prev) =>
      prev.find((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user]
    )
  }

  const handleCreate = async () => {
    if (!name.trim()) return toast.error('Group name required')
    setLoading(true)
    try {
      const { data } = await groupApi.create({
        name: name.trim(),
        description: description.trim(),
        memberIds: selected.map((u) => u.id),
      })
      setGroups([...groups, data])
      toast.success(`Group "${data.name}" created!`)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create group')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {step === 1 ? 'New Group' : 'Add Members'}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {step === 1 && (
          <div className={styles.body}>
            <div className={styles.field}>
              <label className={styles.label}>Group name *</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Team Alpha"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Description</label>
              <input
                type="text"
                className={styles.input}
                placeholder="What's this group about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className={styles.actions}>
              <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
              <button
                className={styles.primaryBtn}
                onClick={() => setStep(2)}
                disabled={!name.trim()}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.body}>
            {selected.length > 0 && (
              <div className={styles.chips}>
                {selected.map((u) => (
                  <span key={u.id} className={styles.chip}>
                    {u.displayName || u.username}
                    <button onClick={() => toggleSelect(u)}>✕</button>
                  </span>
                ))}
              </div>
            )}

            <div className={styles.searchWrap}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search users to add..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>

            <div className={styles.results}>
              {results.map((user) => {
                const isSelected = selected.some((u) => u.id === user.id)
                return (
                  <button
                    key={user.id}
                    className={`${styles.resultItem} ${isSelected ? styles.selected : ''}`}
                    onClick={() => toggleSelect(user)}
                  >
                    <Avatar user={user} size={36} />
                    <div className={styles.resultInfo}>
                      <div className={styles.resultName}>{user.displayName || user.username}</div>
                      <div className={styles.resultSub}>@{user.username}</div>
                    </div>
                    {isSelected && <span className={styles.checkmark}>✓</span>}
                  </button>
                )
              })}
            </div>

            <div className={styles.actions}>
              <button className={styles.cancelBtn} onClick={() => setStep(1)}>← Back</button>
              <button
                className={styles.primaryBtn}
                onClick={handleCreate}
                disabled={loading}
              >
                {loading ? 'Creating...' : `Create Group (${selected.length + 1})`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
