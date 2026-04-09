function stripHtml(value) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function getApiErrorMessage(error, fallbackMessage) {
  const responseData = error?.response?.data

  if (typeof responseData === 'object' && responseData !== null) {
    if (typeof responseData.message === 'string' && responseData.message.trim()) {
      return responseData.message.trim()
    }
    if (typeof responseData.error === 'string' && responseData.error.trim()) {
      return responseData.error.trim()
    }
  }

  if (typeof responseData === 'string' && responseData.trim()) {
    const cleaned = stripHtml(responseData)
    if (/ECONNREFUSED|proxy error|connect ECONNREFUSED/i.test(cleaned)) {
      return 'Backend server is not reachable on http://localhost:8080'
    }
    if (cleaned) {
      return cleaned
    }
  }

  if (error?.code === 'ERR_NETWORK') {
    return 'Backend server is not reachable on http://localhost:8080'
  }

  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message.trim()
  }

  return fallbackMessage
}
