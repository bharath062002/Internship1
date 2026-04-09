import { format, isToday, isYesterday, differenceInMinutes } from 'date-fns'

/**
 * Format a message timestamp for display in the chat list preview
 */
export function formatConversationTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isToday(date)) return format(date, 'HH:mm')
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'dd/MM/yy')
}

/**
 * Format a message timestamp for display inside a chat window
 */
export function formatMessageTime(dateStr) {
  if (!dateStr) return ''
  return format(new Date(dateStr), 'HH:mm')
}

/**
 * Group messages into date buckets
 */
export function groupMessagesByDate(messages) {
  const groups = new Map()

  messages.forEach((msg) => {
    if (!msg.createdAt) return
    const d = new Date(msg.createdAt)
    let label
    if (isToday(d)) label = 'Today'
    else if (isYesterday(d)) label = 'Yesterday'
    else label = format(d, 'MMMM d, yyyy')

    if (!groups.has(label)) groups.set(label, [])
    groups.get(label).push(msg)
  })

  return Array.from(groups.entries()).map(([date, msgs]) => ({ date, msgs }))
}

/**
 * Whether to show the avatar for consecutive messages from same sender
 */
export function shouldShowAvatar(messages, index) {
  if (index === messages.length - 1) return true
  const current = messages[index]
  const next = messages[index + 1]
  if (current.sender?.id !== next.sender?.id) return true
  const diff = differenceInMinutes(new Date(next.createdAt), new Date(current.createdAt))
  return diff > 5
}

/**
 * Truncate text to a given length with ellipsis
 */
export function truncate(text, length = 60) {
  if (!text) return ''
  return text.length <= length ? text : text.slice(0, length) + '…'
}

/**
 * Get a conversation ID string for two users
 */
export function privateConvId(uid1, uid2) {
  const [a, b] = [uid1, uid2].sort((x, y) => x - y)
  return `private_${a}_${b}`
}

/**
 * Get a conversation ID for a group
 */
export function groupConvId(groupId) {
  return `group_${groupId}`
}
