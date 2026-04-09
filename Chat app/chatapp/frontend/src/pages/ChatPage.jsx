import React, { useEffect } from 'react'
import { useWebSocket } from '../hooks/useWebSocket'
import { useChatStore, useAuthStore } from '../store'
import { userApi, groupApi, notificationApi } from '../utils/api'
import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'
import WelcomeScreen from '../components/WelcomeScreen'
import styles from './ChatPage.module.css'

export default function ChatPage() {
  const { activeConversation, setConversations, setGroups, setNotifications } = useChatStore()
  const user = useAuthStore((s) => s.user)

  // Initialize WebSocket
  useWebSocket()

  useEffect(() => {
    const load = async () => {
      try {
        const [convRes, groupRes, notifRes, unreadRes] = await Promise.allSettled([
          userApi.getConversations(),
          groupApi.getMyGroups(),
          notificationApi.getAll(),
          notificationApi.getUnreadCount(),
        ])
        if (convRes.status === 'fulfilled') setConversations(convRes.value.data)
        if (groupRes.status === 'fulfilled') setGroups(groupRes.value.data)
        if (notifRes.status === 'fulfilled' && unreadRes.status === 'fulfilled') {
          setNotifications(notifRes.value.data.content, unreadRes.value.data.count)
        }
      } catch (err) {
        console.error('Failed to load initial data:', err)
      }
    }
    load()
  }, [user?.id])

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        {activeConversation ? <ChatWindow /> : <WelcomeScreen />}
      </main>
    </div>
  )
}
