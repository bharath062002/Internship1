import React from 'react'

const COLORS = [
  '#a8ff3e', '#ff6b6b', '#4ecdc4', '#45b7d1',
  '#96ceb4', '#ffeaa7', '#dfe6e9', '#fd79a8',
]

function getColor(str) {
  if (!str) return COLORS[0]
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
}

function getInitials(user) {
  if (!user) return '?'
  const name = user.displayName || user.username || '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function Avatar({ user, size = 40 }) {
  const color = getColor(user?.username)
  const initials = getInitials(user)

  const style = {
    width: size,
    height: size,
    borderRadius: '50%',
    background: user?.avatarUrl ? 'transparent' : `${color}22`,
    border: `1.5px solid ${color}44`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size * 0.36,
    fontWeight: 700,
    color,
    overflow: 'hidden',
    flexShrink: 0,
    fontFamily: 'var(--font-mono)',
    userSelect: 'none',
  }

  if (user?.avatarUrl) {
    return (
      <div style={style}>
        <img
          src={user.avatarUrl}
          alt={initials}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    )
  }

  return <div style={style}>{initials}</div>
}
