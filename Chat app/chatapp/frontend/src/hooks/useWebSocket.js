import { useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuthStore, useChatStore } from '../store'
import toast from 'react-hot-toast'

let stompClient = null

export function useWebSocket() {
  const { accessToken, user } = useAuthStore()
  const {
    addMessage,
    setTyping,
    setUserOnline,
    addNotification,
    activeConversation,
    incrementUnread,
  } = useChatStore()

  const isConnected = useRef(false)
  const activeConversationRef = useRef(activeConversation)

  useEffect(() => {
    activeConversationRef.current = activeConversation
  }, [activeConversation])

  const getConversationId = useCallback((msg) => {
    if (msg.groupId) return `group_${msg.groupId}`
    const ids = [msg.sender?.id, msg.receiverId].filter(Boolean).sort((a, b) => a - b)
    return `private_${ids[0]}_${ids[1]}`
  }, [])

  useEffect(() => {
    if (!accessToken || !user) return

    let client

    try {
      client = new Client({
        webSocketFactory: () => new SockJS('/ws'),
        connectHeaders: { Authorization: `Bearer ${accessToken}` },
        reconnectDelay: 3000,
        debug: (str) => { if (import.meta.env.DEV) console.debug('[STOMP]', str) },

        onConnect: () => {
          isConnected.current = true
          console.log('WebSocket connected')

          client.subscribe(`/user/queue/messages`, (frame) => {
            const message = JSON.parse(frame.body)
            const convId = getConversationId(message)
            addMessage(convId, message)

            const isActive = activeConversationRef.current?.conversationId === convId
            if (!isActive) {
              incrementUnread(convId)
              toast(`New message from ${message.sender?.displayName}`, {
                icon: 'MSG',
                duration: 3000,
                style: {
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                },
              })
            }
          })

          client.subscribe(`/user/queue/typing`, (frame) => {
            const event = JSON.parse(frame.body)
            const convId = event.groupId
              ? `group_${event.groupId}`
              : `private_${Math.min(user.id, event.senderId)}_${Math.max(user.id, event.senderId)}`
            setTyping(convId, event.senderId, event.typing)
          })

          client.subscribe(`/user/queue/read-receipts`, (frame) => {
            const receipt = JSON.parse(frame.body)
            console.log('Read receipt:', receipt)
          })

          client.subscribe(`/user/queue/notifications`, (frame) => {
            const notification = JSON.parse(frame.body)
            addNotification(notification)
          })

          client.subscribe(`/topic/status`, (frame) => {
            const update = JSON.parse(frame.body)
            setUserOnline(update.userId, update.status === 'ONLINE')
          })
        },

        onDisconnect: () => {
          isConnected.current = false
          console.log('WebSocket disconnected')
        },

        onStompError: (frame) => {
          console.error('STOMP error:', frame)
        },
      })

      client.activate()
      stompClient = client
    } catch (error) {
      console.error('Failed to initialize WebSocket client:', error)
      toast.error('Realtime connection could not be started')
      return
    }

    return () => {
      client?.deactivate()
      stompClient = null
      isConnected.current = false
    }
  }, [accessToken, user?.id, addMessage, setTyping, setUserOnline, addNotification, incrementUnread, getConversationId])

  const sendMessage = useCallback((destination, body) => {
    if (stompClient?.connected) {
      stompClient.publish({
        destination,
        body: JSON.stringify(body),
      })
    }
  }, [])

  const sendTyping = useCallback((receiverId, groupId, typing) => {
    sendMessage('/app/chat.typing', { receiverId, groupId, typing })
  }, [sendMessage])

  return { sendMessage, sendTyping, isConnected: isConnected.current }
}

export { stompClient }
