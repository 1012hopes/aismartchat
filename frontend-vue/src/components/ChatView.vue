<template>
  <div class="chat-container">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <button class="new-chat-btn" @click="createNewChat" v-if="!sidebarCollapsed">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>新对话</span>
        </button>
      </div>

      <div class="sessions-list" v-if="!sidebarCollapsed">
        <div class="sessions-scroll">
          <div 
            v-for="session in chatStore.sessions" 
            :key="session.id"
            class="session-item"
            :class="{ active: session.id === chatStore.currentSessionId }"
            @click="switchSession(session.id)"
          >
            <svg class="session-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span class="session-name">{{ session.name }}</span>
            <div class="session-actions">
              <button class="action-btn" @click.stop="renameSession(session)" title="重命名">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="action-btn delete" @click.stop="deleteSession(session)" title="删除">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="sidebar-footer" v-if="!sidebarCollapsed">
        <div class="theme-toggle" @click="toggleTheme">
          <svg v-if="isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          <span>{{ isDark ? '浅色模式' : '深色模式' }}</span>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 顶部导航 -->
      <nav class="top-nav">
        <button class="menu-btn" @click="sidebarCollapsed = !sidebarCollapsed">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1 class="nav-title">{{ currentSessionName }}</h1>
        <div class="nav-actions">
          <button class="icon-btn" @click="clearHistory" title="清空对话">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </nav>

      <!-- 消息区域 -->
      <div class="messages-area" ref="messagesArea">
        <div class="messages-container">
          <!-- 空状态 -->
          <div v-if="chatStore.messages.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h2>开始新的对话</h2>
            <p>向AI助手提问任何问题</p>
          </div>

          <!-- 消息列表 -->
          <div v-else class="messages-list">
            <div 
              v-for="message in chatStore.messages" 
              :key="message.id"
              class="message-wrapper"
              :class="message.role"
            >
              <div class="message-content">
                <div class="message-avatar">
                  <svg v-if="message.role === 'user'" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                  </svg>
                  <div v-else class="ai-avatar">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,17V16H9V14H11V13H8V11H11V10H9V8H11V7H13V8H15V10H13V11H16V13H13V14H15V16H13V17H11Z" />
                    </svg>
                  </div>
                </div>
                <div class="message-body">
                  <div class="message-text-wrapper">
                    <div class="message-text" v-html="formatMessage(message.content)"></div>
                    <span v-if="message.status === 'streaming'" class="streaming-cursor"></span>
                  </div>
                  <div v-if="message.status === 'loading'" class="message-loading">
                    <div class="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                  <div v-if="message.status === 'streaming'" class="message-streaming">
                    <div class="streaming-indicator">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="13 17 18 12 13 7"></polyline>
                        <polyline points="6 17 11 12 6 7"></polyline>
                      </svg>
                      <span>正在生成...</span>
                    </div>
                  </div>
                  <div v-if="message.status === 'error'" class="message-error">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    {{ message.content }}
                  </div>
                  <div v-if="message.status === 'success' && message.role === 'assistant'" class="message-actions">
                    <button class="action-btn" @click="copyMessage(message.content)" title="复制">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                    <button class="action-btn" @click="likeMessage(message.id)" title="点赞">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <div class="input-container">
          <textarea
            ref="textarea"
            v-model="inputMessage"
            @keydown.enter="handleKeydown"
            @input="adjustTextareaHeight"
            placeholder="发送消息..."
            rows="1"
            :disabled="chatStore.isLoading"
          ></textarea>
          <button 
            v-if="!chatStore.isLoading"
            class="send-btn"
            @click="sendMessage"
            :disabled="!canSend"
            :class="{ active: canSend }"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
          <button 
            v-else
            class="stop-btn"
            @click="stopGeneration"
            title="停止生成"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
          </button>
        </div>
        <div class="input-hint">Shift + Enter 换行 · Enter 发送</div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useChatStore } from '../stores/chat'

const chatStore = useChatStore()
const sidebarCollapsed = ref(false)
const inputMessage = ref('')
const textarea = ref(null)
const messagesArea = ref(null)
const isDark = ref(localStorage.getItem('theme') === 'dark')

// 计算属性
const canSend = computed(() => {
  return inputMessage.value.trim() && !chatStore.isLoading
})

const currentSessionName = computed(() => {
  const session = chatStore.sessions.find(s => s.id === chatStore.currentSessionId)
  return session?.name || 'AI Chat'
})

// 主题切换
const toggleTheme = () => {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
}

// 调整输入框高度
const adjustTextareaHeight = () => {
  nextTick(() => {
    if (textarea.value) {
      textarea.value.style.height = 'auto'
      textarea.value.style.height = Math.min(textarea.value.scrollHeight, 200) + 'px'
    }
  })
}

// 处理键盘事件
const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

// 发送消息
const sendMessage = async () => {
  if (!canSend.value) return
  
  const content = inputMessage.value.trim()
  inputMessage.value = ''
  adjustTextareaHeight()
  
  await chatStore.sendMessage(content)
  scrollToBottom()
}

// 停止生成
const stopGeneration = () => {
  chatStore.stopGeneration()
}

// 创建新对话
const createNewChat = async () => {
  await chatStore.createSession()
  scrollToBottom()
}

// 切换会话
const switchSession = async (sessionId) => {
  await chatStore.switchSession(sessionId)
  scrollToBottom()
}

// 重命名会话
const renameSession = async (session) => {
  const newName = prompt('请输入新的对话名称:', session.name)
  if (newName && newName.trim()) {
    await chatStore.renameSession(session.id, newName.trim())
  }
}

// 删除会话
const deleteSession = async (session) => {
  if (confirm(`确定要删除对话"${session.name}"吗？`)) {
    await chatStore.deleteSession(session.id)
  }
}

// 清空历史
const clearHistory = async () => {
  if (confirm('确定要清空当前对话的所有消息吗？')) {
    await chatStore.clearHistory(chatStore.currentSessionId)
  }
}

// 复制消息
const copyMessage = async (content) => {
  try {
    await navigator.clipboard.writeText(content)
    showToast('已复制')
  } catch (error) {
    console.error('复制失败:', error)
  }
}

// 点赞消息
const likeMessage = (messageId) => {
  console.log('点赞:', messageId)
  showToast('感谢反馈')
}

// 格式化消息
const formatMessage = (content) => {
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesArea.value) {
      messagesArea.value.scrollTop = messagesArea.value.scrollHeight
    }
  })
}

// 显示提示
const showToast = (message) => {
  const toast = document.createElement('div')
  toast.className = 'toast-message'
  toast.textContent = message
  document.body.appendChild(toast)
  
  setTimeout(() => toast.classList.add('show'), 10)
  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => toast.remove(), 300)
  }, 2000)
}

// 监听消息变化，自动滚动
watch(() => chatStore.messages.length, () => {
  scrollToBottom()
})

// 深度监听消息内容变化（流式输出时）
watch(() => chatStore.messages, () => {
  // 如果最后一条消息正在流式输出，自动滚动
  const lastMessage = chatStore.messages[chatStore.messages.length - 1]
  if (lastMessage && (lastMessage.status === 'streaming' || lastMessage.status === 'loading')) {
    scrollToBottom()
  }
}, { deep: true })

// 初始化
onMounted(async () => {
  // 设置主题
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  
  // 加载数据
  await chatStore.loadSessions()
  if (chatStore.currentSessionId) {
    await chatStore.loadMessages(chatStore.currentSessionId)
  }
  scrollToBottom()
  
  // 聚焦输入框
  if (textarea.value) {
    textarea.value.focus()
  }
})
</script>

<style lang="scss" scoped>
@import '../styles/chat.scss';
</style>

