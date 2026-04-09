import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
      }),

      updateUser: (user) => set({ user }),

      logout: () => set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      }),
    }),
    {
      name: 'chatapp-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: {},          // { conversationId: Message[] }
  typingUsers: {},       // { conversationId: Set<userId> }
  onlineUsers: new Set(),
  groups: [],
  notifications: [],
  unreadNotifications: 0,
  searchQuery: '',
  searchResults: [],

  setConversations: (conversations) => set({ conversations }),

  setActiveConversation: (conv) => set({ activeConversation: conv }),

  addMessage: (conversationId, message) => set((state) => ({
    messages: {
      ...state.messages,
      [conversationId]: [...(state.messages[conversationId] || []), message],
    },
  })),

  setMessages: (conversationId, messages) => set((state) => ({
    messages: { ...state.messages, [conversationId]: messages },
  })),

  prependMessages: (conversationId, messages) => set((state) => ({
    messages: {
      ...state.messages,
      [conversationId]: [...messages, ...(state.messages[conversationId] || [])],
    },
  })),

  updateMessageStatus: (conversationId, messageId, status) => set((state) => ({
    messages: {
      ...state.messages,
      [conversationId]: (state.messages[conversationId] || []).map(m =>
        m.id === messageId ? { ...m, status } : m
      ),
    },
  })),

  setTyping: (conversationId, userId, isTyping) => set((state) => {
    const current = new Set(state.typingUsers[conversationId] || [])
    if (isTyping) current.add(userId)
    else current.delete(userId)
    return { typingUsers: { ...state.typingUsers, [conversationId]: current } }
  }),

  setUserOnline: (userId, online) => set((state) => {
    const updated = new Set(state.onlineUsers)
    if (online) updated.add(userId)
    else updated.delete(userId)
    return { onlineUsers: updated }
  }),

  setGroups: (groups) => set({ groups }),

  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unreadNotifications: state.unreadNotifications + 1,
  })),

  setNotifications: (notifications, unreadCount) => set({
    notifications,
    unreadNotifications: unreadCount,
  }),

  markNotificationsRead: () => set({ unreadNotifications: 0 }),

  setSearchQuery: (q) => set({ searchQuery: q }),
  setSearchResults: (results) => set({ searchResults: results }),

  updateLastMessage: (conversationId, message) => set((state) => ({
    conversations: state.conversations.map(c =>
      c.conversationId === conversationId
        ? { ...c, lastMessage: message }
        : c
    ),
  })),

  incrementUnread: (conversationId) => set((state) => ({
    conversations: state.conversations.map(c =>
      c.conversationId === conversationId
        ? { ...c, unreadCount: (c.unreadCount || 0) + 1 }
        : c
    ),
  })),

  clearUnread: (conversationId) => set((state) => ({
    conversations: state.conversations.map(c =>
      c.conversationId === conversationId
        ? { ...c, unreadCount: 0 }
        : c
    ),
  })),
}))
