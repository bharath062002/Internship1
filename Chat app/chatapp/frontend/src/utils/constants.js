// WebSocket STOMP destinations
export const WS_DESTINATIONS = {
  SEND:   '/app/chat.send',
  TYPING: '/app/chat.typing',
  READ:   '/app/chat.read',
}

export const WS_SUBSCRIPTIONS = {
  MESSAGES:      '/user/queue/messages',
  TYPING:        '/user/queue/typing',
  READ_RECEIPTS: '/user/queue/read-receipts',
  NOTIFICATIONS: '/user/queue/notifications',
  STATUS:        '/topic/status',
  GROUP: (id)  => `/topic/group/${id}`,
}

// Message types
export const MESSAGE_TYPES = {
  TEXT:   'TEXT',
  IMAGE:  'IMAGE',
  VIDEO:  'VIDEO',
  AUDIO:  'AUDIO',
  FILE:   'FILE',
  SYSTEM: 'SYSTEM',
}

// Message statuses
export const MESSAGE_STATUS = {
  SENT:      'SENT',
  DELIVERED: 'DELIVERED',
  READ:      'READ',
}

// Online statuses
export const ONLINE_STATUS = {
  ONLINE:  'ONLINE',
  OFFLINE: 'OFFLINE',
  AWAY:    'AWAY',
  BUSY:    'BUSY',
}

// Pagination
export const PAGE_SIZE = 50

// Timing
export const TYPING_DEBOUNCE_MS = 1000
export const RECONNECT_DELAY_MS = 3000
