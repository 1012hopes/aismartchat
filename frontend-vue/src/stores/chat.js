import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useChatStore = defineStore('chat', () => {
  const sessions = ref([])
  const currentSessionId = ref(null)
  const messages = ref([])
  const isLoading = ref(false)

  const currentSession = computed(() => {
    return sessions.value.find(s => s.id === currentSessionId.value)
  })

  const generateId = (prefix = 'id') => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/ai/sessions')
      const data = await response.json()
      sessions.value = data
      
      if (sessions.value.length === 0) {
        await createSession('新对话')
      }
      
      if (!currentSessionId.value && sessions.value.length > 0) {
        currentSessionId.value = sessions.value[0].id
      }
    } catch (error) {
      console.error('加载会话失败:', error)
    }
  }

  const createSession = async (name = '新对话') => {
    try {
      const sessionId = generateId('session')
      const response = await fetch('/api/ai/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, name })
      })
      const data = await response.json()
      
      sessions.value.unshift({
        id: data.id,
        name: data.name,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      })
      
      currentSessionId.value = data.id
      messages.value = []
      return data
    } catch (error) {
      console.error('创建会话失败:', error)
    }
  }

  const switchSession = async (sessionId) => {
    if (currentSessionId.value === sessionId) return
    currentSessionId.value = sessionId
    await loadMessages(sessionId)
  }

  const loadMessages = async (sessionId) => {
    try {
      const response = await fetch(`/api/ai/sessions/${sessionId}/messages`)
      messages.value = await response.json()
    } catch (error) {
      console.error('加载消息失败:', error)
      messages.value = []
    }
  }

  const deleteSession = async (sessionId) => {
    try {
      await fetch(`/api/ai/sessions/${sessionId}`, { method: 'DELETE' })
      
      const index = sessions.value.findIndex(s => s.id === sessionId)
      if (index > -1) {
        sessions.value.splice(index, 1)
      }
      
      if (currentSessionId.value === sessionId) {
        if (sessions.value.length > 0) {
          await switchSession(sessions.value[0].id)
        } else {
          await createSession()
        }
      }
    } catch (error) {
      console.error('删除会话失败:', error)
    }
  }

  const renameSession = async (sessionId, newName) => {
    try {
      await fetch(`/api/ai/sessions/${sessionId}/rename`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      })
      
      const session = sessions.value.find(s => s.id === sessionId)
      if (session) {
        session.name = newName
      }
    } catch (error) {
      console.error('重命名失败:', error)
    }
  }

  const clearHistory = async (sessionId) => {
    try {
      await fetch(`/api/ai/history/${sessionId}`, { method: 'DELETE' })
      if (currentSessionId.value === sessionId) {
        messages.value = []
      }
    } catch (error) {
      console.error('清空历史失败:', error)
    }
  }

  // 当前活跃的AbortController，用于取消请求
  let currentAbortController = null

  const sendMessage = async (content) => {
    if (!content.trim() || isLoading.value) return
    
    isLoading.value = true
    
    // 创建用户消息
    const userMessage = {
      id: generateId('msg'),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
      status: 'success'
    }
    messages.value.push(userMessage)
    
    // 创建AI消息对象
    const aiMessageIndex = messages.value.length
    messages.value.push({
      id: generateId('msg'),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      status: 'loading'
    })
    
    console.log('🤖 开始接收AI响应，消息索引:', aiMessageIndex)
    
    // 创建AbortController用于中断请求
    currentAbortController = new AbortController()
    
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          message: content,
          sessionId: currentSessionId.value
        }),
        signal: currentAbortController.signal
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          console.log('✅ 流式读取完成')
          break
        }
        
        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk
        
        // SSE格式解析：按行处理
        const lines = buffer.split('\n')
        // 保留最后一个可能不完整的行
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine) continue
          
          // 解析SSE event行
          if (trimmedLine.startsWith('event:')) {
            const eventType = trimmedLine.substring(6).trim()
            console.log('📨 事件类型:', eventType)
            continue
          }
          
          // 解析SSE data行
          if (trimmedLine.startsWith('data:')) {
            let data = trimmedLine.substring(5).trim()
            
            // 检查是否有双重data:前缀（兼容性处理）
            if (data.startsWith('data:')) {
              data = data.substring(5).trim()
            }
            
            if (!data) continue
            
            // 调试：显示原始数据
            if (import.meta.env.DEV) {
              console.log('🔍 原始SSE数据:', data.substring(0, 100))
            }
            
            try {
              const parsed = JSON.parse(data)
              
              // 处理内容
              if (parsed.content !== undefined) {
                if (parsed.content) {
                  messages.value[aiMessageIndex].content += parsed.content
                  messages.value[aiMessageIndex].status = 'streaming'
                  console.log('📥 收到片段:', parsed.content.substring(0, 20), '总长度:', messages.value[aiMessageIndex].content.length)
                }
              }
              
              // 处理完成标记
              if (parsed.done === true) {
                messages.value[aiMessageIndex].status = 'success'
                console.log('✅ AI响应完成，总长度:', messages.value[aiMessageIndex].content.length)
                await loadSessions()
              }
              
              // 处理错误
              if (parsed.error) {
                messages.value[aiMessageIndex].status = 'error'
                messages.value[aiMessageIndex].content = parsed.error
                console.error('❌ 收到错误:', parsed.error)
              }
            } catch (e) {
              console.error('❌ 解析SSE数据失败:', e.message)
              console.error('   原始数据:', data.substring(0, 100))
            }
          }
        }
      }
      
      // 确保最终状态正确
      if (messages.value[aiMessageIndex].status === 'streaming') {
        messages.value[aiMessageIndex].status = 'success'
        console.log('✅ 流式输出结束')
      }
      
    } catch (error) {
      // 检查是否是用户主动取消
      if (error.name === 'AbortError') {
        console.log('⏹️ 用户取消了请求')
        messages.value[aiMessageIndex].status = 'cancelled'
        messages.value[aiMessageIndex].content = messages.value[aiMessageIndex].content || '已取消生成'
      } else {
        console.error('❌ 发送消息失败:', error)
        messages.value[aiMessageIndex].status = 'error'
        messages.value[aiMessageIndex].content = '发送失败，请重试'
      }
    } finally {
      isLoading.value = false
      currentAbortController = null
    }
  }
  
  // 停止当前的AI响应生成
  const stopGeneration = () => {
    if (currentAbortController) {
      currentAbortController.abort()
      console.log('⏹️ 已中断AI生成')
    }
  }

  return {
    sessions,
    currentSessionId,
    currentSession,
    messages,
    isLoading,
    loadSessions,
    loadMessages,
    createSession,
    switchSession,
    deleteSession,
    renameSession,
    clearHistory,
    sendMessage,
    stopGeneration
  }
})

