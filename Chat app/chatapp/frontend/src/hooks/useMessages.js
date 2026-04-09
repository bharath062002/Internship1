import { useState, useCallback, useRef } from 'react'
import { messageApi } from '../utils/api'
import { useChatStore } from '../store'

export function useMessages(convId, receiverId, groupId) {
  const { setMessages, prependMessages } = useChatStore()
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const pageRef = useRef(0)

  const fetchPage = useCallback(async (page = 0) => {
    if (loading) return
    setLoading(true)
    try {
      const res = groupId
        ? await messageApi.getGroup(groupId, page)
        : await messageApi.getPrivate(receiverId, page)

      const { content, last } = res.data

      if (page === 0) {
        setMessages(convId, content)
      } else {
        prependMessages(convId, content)
      }

      setHasMore(!last)
      pageRef.current = page
    } catch (err) {
      console.error('Failed to load messages:', err)
    } finally {
      setLoading(false)
    }
  }, [convId, receiverId, groupId, loading])

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchPage(pageRef.current + 1)
    }
  }, [hasMore, loading, fetchPage])

  const reset = useCallback(() => {
    pageRef.current = 0
    setHasMore(true)
  }, [])

  return { loading, hasMore, fetchPage, loadMore, reset }
}
