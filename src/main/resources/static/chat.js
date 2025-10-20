/**
 * 智能聊天应用 - 增强版
 * 功能：打字机动画、本地存储、多会话管理
 */
class ChatApp {
    constructor() {
        console.log('开始初始化ChatApp');
        
        // 添加全局错误处理
        window.addEventListener('error', (event) => {
            console.error('全局JavaScript错误:', event.error);
            console.error('错误位置:', event.filename, '行号:', event.lineno);
        });
        
        // 添加未处理的Promise拒绝处理
        window.addEventListener('unhandledrejection', (event) => {
            console.error('未处理的Promise拒绝:', event.reason);
        });
        
        // 添加DOM加载状态检查
        console.log('当前DOM加载状态:', document.readyState);
        console.log('body元素:', document.body);
        console.log('messagesContainer元素（初始化前）:', document.getElementById('messagesContainer'));
        
        // DOM元素引用 - 延迟获取，确保元素已存在
        this.chatMessages = null;
        this.userInput = null;
        this.sendButton = null;
        this.newChatButton = null;
        this.clearButton = null;
        this.sidebar = null;
        this.chatArea = null;
        this.sessionList = null;
        this.emptyState = null;
        this.copyToast = null;
        
        // 状态变量
        this.isLoading = false;
        this.currentSessionId = this.generateSessionId();
        this.sessions = this.loadSessions();
        this.currentTypingMessage = null;
        this.typingSpeed = 30; // 打字速度（毫秒）
        
        console.log('状态初始化完成');
        
        // 初始化
        console.log('开始初始化应用');
        
        // 延迟初始化，确保DOM完全加载
        const initApp = () => {
            console.log('执行初始化函数');
            
            // 获取DOM元素
            this.chatMessages = document.getElementById('messagesContainer');
            this.userInput = document.getElementById('messageInput');
            this.sendButton = document.getElementById('sendButton');
            this.newChatButton = document.getElementById('newChatBtn');
            this.clearButton = document.getElementById('clearMessagesBtn');
            this.sidebar = document.querySelector('.sidebar');
            this.chatArea = document.querySelector('.chat-area');
            this.sessionList = document.getElementById('chatList');
            this.emptyState = document.querySelector('.empty-state');
            this.copyToast = document.getElementById('toast');
            
            console.log('DOM元素初始化完成');
            console.log('chatMessages:', this.chatMessages);
            console.log('userInput:', this.userInput);
            console.log('sendButton:', this.sendButton);
            
            this.initializeEventListeners();
            this.setupInputAutoResize();
            this.setupSessionListEvents();  // 设置会话列表事件委托
            this.loadCurrentSession();
            this.renderSessionList();
            this.checkEmptyState();
        };
        
        // 检查DOM是否完全加载
        if (document.readyState === 'loading') {
            console.log('DOM仍在加载，等待DOMContentLoaded事件');
            document.addEventListener('DOMContentLoaded', () => {
                console.log('DOMContentLoaded事件触发，重新初始化');
                initApp();
            });
        } else {
            console.log('DOM已加载完成，直接初始化');
            // 使用setTimeout确保DOM完全渲染
            setTimeout(() => {
                initApp();
            }, 0);
        }
        
        console.log('聊天应用已初始化，当前会话ID:', this.currentSessionId);
        
        // 添加一个测试函数来验证DOM操作
        window.testDOM = () => {
            console.log('测试DOM操作');
            console.log('chatMessages:', this.chatMessages);
            console.log('messagesContainer元素:', document.getElementById('messagesContainer'));
            
            if (this.chatMessages) {
                const testDiv = document.createElement('div');
                testDiv.textContent = '测试消息 - ' + new Date().toLocaleTimeString();
                testDiv.style.background = 'red';
                testDiv.style.color = 'white';
                this.chatMessages.appendChild(testDiv);
                console.log('测试div已添加');
            } else {
                console.error('chatMessages未找到！');
            }
        };
        
        console.log('测试函数已创建，在控制台输入 testDOM() 来测试');
        
        // 添加一个测试消息显示的函数
        window.testMessageDisplay = () => {
            console.log('测试消息显示功能');
            const testMessage = {
                id: 'test-' + Date.now(),
                role: 'assistant',
                content: '这是一条测试消息，用于验证消息显示功能是否正常工作。',
                status: 'success',
                timestamp: Date.now()
            };
            
            console.log('测试消息对象:', testMessage);
            this.addMessageToChat(testMessage);
            
            // 延迟后测试打字机效果
            setTimeout(() => {
                console.log('测试打字机效果');
                this.typeMessage(testMessage.id, '这是通过打字机效果显示的测试消息内容。');
            }, 1000);
        };
        
        console.log('测试消息显示函数已创建，在控制台输入 testMessageDisplay() 来测试');
        
        // 添加一个简单的DOM检查函数
        window.checkDOM = () => {
            console.log('========== DOM 检查 ==========');
            console.log('messagesContainer:', document.getElementById('messagesContainer'));
            console.log('所有消息元素:', document.querySelectorAll('[data-message-id]'));
            console.log('所有 .message-bubble:', document.querySelectorAll('.message-bubble'));
            
            const messages = document.querySelectorAll('[data-message-id]');
            messages.forEach((msg, index) => {
                console.log(`消息 ${index + 1}:`, {
                    id: msg.getAttribute('data-message-id'),
                    bubble: msg.querySelector('.message-bubble'),
                    content: msg.querySelector('.message-bubble')?.textContent
                });
            });
        };
        
        console.log('DOM检查函数已创建，在控制台输入 checkDOM() 来检查');
        
        // 添加会话列表测试函数
        window.testSessionList = () => {
            console.log('========== 会话列表测试 ==========');
            console.log('sessionList 元素:', this.sessionList);
            console.log('所有会话:', this.sessions);
            console.log('当前会话 ID:', this.currentSessionId);
            console.log('会话列表子元素数量:', this.sessionList?.children.length);
            
            const chatItems = document.querySelectorAll('.chat-item');
            console.log('找到的 .chat-item 数量:', chatItems.length);
            
            chatItems.forEach((item, index) => {
                const sessionId = item.getAttribute('data-session-id');
                const mainArea = item.querySelector('.chat-item-main');
                const renameBtn = item.querySelector('.rename-btn');
                const deleteBtn = item.querySelector('.delete-btn');
                
                console.log(`会话 ${index + 1}:`, {
                    sessionId,
                    hasMainArea: !!mainArea,
                    hasRenameBtn: !!renameBtn,
                    hasDeleteBtn: !!deleteBtn
                });
            });
        };
        
        console.log('会话列表测试函数已创建，在控制台输入 testSessionList() 来测试');
    }
    
    /**
     * 初始化事件监听器
     */
    initializeEventListeners() {
        // 发送消息
        this.sendButton.addEventListener('click', () => {
            console.log('发送按钮被点击');
            this.sendMessage();
        });
        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                console.log('Enter被按下');
                this.sendMessage();
            }
        });
        
        // 新建会话
        this.newChatButton.addEventListener('click', () => {
            console.log('新建会话按钮被点击');
            this.createNewSession();
        });
        
        // 重命名对话
        const renameChatBtn = document.getElementById('renameChatBtn');
        if (renameChatBtn) {
            renameChatBtn.addEventListener('click', () => {
                console.log('重命名对话按钮被点击');
                this.renameSession(this.currentSessionId);
            });
        }
        
        // 删除对话
        const deleteChatBtn = document.getElementById('deleteChatBtn');
        if (deleteChatBtn) {
            deleteChatBtn.addEventListener('click', () => {
                console.log('删除对话按钮被点击');
                this.deleteSession(this.currentSessionId);
            });
        }
        
        // 清空对话
        this.clearButton.addEventListener('click', () => {
            console.log('清空消息按钮被点击');
            this.clearChatHistory();
        });

        // 测试按钮
        document.getElementById('testButton').addEventListener('click', () => {
            console.log('测试按钮被点击');
            if (window.testMessageDisplay) {
                window.testMessageDisplay();
            } else {
                console.log('testMessageDisplay函数不存在');
            }
            
            // 简单的测试函数
        window.testSimpleMessage = function() {
            console.log('执行简单消息测试');
            const testMessage = {
                id: 'test_simple_' + Date.now(),
                role: 'assistant',
                content: '这是一个简单的测试消息',
                status: 'success',
                timestamp: Date.now()
            };
            
            console.log('准备添加消息:', testMessage);
            chatApp.addMessageToChat(testMessage);
            
            // 延迟1秒后测试打字机效果
            setTimeout(() => {
                console.log('测试打字机效果');
                chatApp.typeMessage(testMessage.id, '这是更新后的内容，通过打字机效果显示！');
            }, 1000);
        };
        
        // 模拟流式响应测试
        window.testStreamingResponse = function() {
            console.log('执行流式响应测试');
            
            // 创建AI消息占位符
            const aiMessage = {
                id: 'test_stream_' + Date.now(),
                role: 'assistant',
                content: '',
                timestamp: Date.now(),
                status: 'sending'
            };
            
            console.log('创建AI消息占位符:', aiMessage);
            chatApp.addMessageToChat(aiMessage);
            
            // 模拟流式数据
            const chunks = [
                'data:data: {"content": "你好"}',
                'data:',
                'data:',
                'data:data: {"content": "，"}',
                'data:',
                'data:',
                'data:data: {"content": "我是"}',
                'data:',
                'data:',
                'data:data: {"content": "AI助手"}',
                'data:',
                'data:',
                'data:data: {"content": "！"}',
                'data:',
                'data:',
                'data:data: {"content": ""}',
                'data:',
                'data:',
                'data:[DONE]',
                'data:',
                'data:'
            ];
            
            let fullContent = '';
            let chunkIndex = 0;
            
            const processNextChunk = () => {
                if (chunkIndex >= chunks.length) {
                    console.log('所有数据块处理完成');
                    aiMessage.status = 'success';
                    aiMessage.content = fullContent;
                    chatApp.updateMessageStatus(aiMessage.id, 'success');
                    return;
                }
                
                const line = chunks[chunkIndex++];
                console.log('处理数据块:', line);
                
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    
                    if (data.startsWith('data: ')) {
                        const actualData = data.slice(6);
                        
                        if (actualData === '[DONE]') {
                            console.log('收到[DONE]标记');
                            aiMessage.status = 'success';
                            aiMessage.content = fullContent;
                            chatApp.updateMessageStatus(aiMessage.id, 'success');
                            return;
                        }
                        
                        if (actualData && actualData.trim() !== '') {
                            try {
                                const parsed = JSON.parse(actualData);
                                if (parsed.content) {
                                    fullContent += parsed.content;
                                    console.log('解析到内容:', parsed.content, '完整内容:', fullContent);
                                    chatApp.typeMessage(aiMessage.id, fullContent);
                                }
                            } catch (e) {
                                console.warn('解析失败:', e);
                            }
                        }
                    }
                }
                
                // 延迟处理下一个数据块
                setTimeout(processNextChunk, 200);
            };
            
            // 开始处理数据块
            processNextChunk();
        };
        
        // 错误响应测试
        window.testErrorResponse = function() {
            console.log('执行错误响应测试');
            
            // 创建AI消息占位符
            const aiMessage = {
                id: 'test_error_' + Date.now(),
                role: 'assistant',
                content: '',
                timestamp: Date.now(),
                status: 'sending'
            };
            
            console.log('创建AI错误消息占位符:', aiMessage);
            chatApp.addMessageToChat(aiMessage);
            
            // 模拟错误响应
            setTimeout(() => {
                console.log('模拟网络错误');
                aiMessage.status = 'error';
                aiMessage.content = '无法连接到AI服务，请检查网络连接或DNS设置';
                chatApp.updateMessageStatus(aiMessage.id, 'error');
                
                // 更新消息内容显示错误信息
                const messageElement = document.querySelector(`[data-message-id="${aiMessage.id}"]`);
                if (messageElement) {
                    const bubbleElement = messageElement.querySelector('.message-bubble');
                    if (bubbleElement) {
                        bubbleElement.innerHTML = `
                            <div class="error-message">
                                <div class="error-icon">⚠️</div>
                                <div class="error-text">${aiMessage.content}</div>
                            </div>
                        `;
                    }
                }
            }, 1000);
        };
            
            window.testSimpleMessage();
            
            // 添加流式响应测试按钮事件
            setTimeout(() => {
                console.log('5秒后将自动执行流式响应测试');
                window.testStreamingResponse();
            }, 5000);
            
            // 10秒后执行错误测试
            setTimeout(() => {
                console.log('执行错误测试...');
                window.testErrorResponse();
            }, 10000);
        });
        
        // 输入验证
        this.userInput.addEventListener('input', () => {
            const hasText = this.userInput.value.trim().length > 0;
            this.sendButton.disabled = !hasText || this.isLoading;
            this.sendButton.classList.toggle('active', hasText && !this.isLoading);
        });
        
        // 移动端侧边栏切换
        const toggleSidebar = document.getElementById('toggleSidebar');
        if (toggleSidebar) {
            toggleSidebar.addEventListener('click', () => {
                this.sidebar.classList.toggle('active');
            });
        }
        
        // 窗口大小变化时关闭移动端侧边栏
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.sidebar.classList.remove('active');
            }
        });
    }
    
    /**
     * 设置输入框自动调整大小
     */
    setupInputAutoResize() {
        this.userInput.addEventListener('input', () => {
            this.autoResizeInput();
        });
    }
    
    /**
     * 自动调整输入框高度
     */
    autoResizeInput() {
        this.userInput.style.height = 'auto';
        const scrollHeight = this.userInput.scrollHeight;
        const maxHeight = 120;
        const newHeight = Math.min(scrollHeight, maxHeight);
        this.userInput.style.height = newHeight + 'px';
        this.userInput.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
    
    /**
     * 发送消息
     */
    async sendMessage() {
        console.log('sendMessage 被调用');
        console.log('userInput:', this.userInput);
        console.log('chatMessages:', this.chatMessages);
        const message = this.userInput.value.trim();
        console.log('开始发送消息:', message);
        if (!message || this.isLoading) {
            console.log('消息为空或正在加载，返回');
            return;
        }
        console.log('消息有效，继续处理');
        
        // 清除空状态
        console.log('清除空状态');
        this.clearEmptyState();
        
        console.log('创建用户消息');
        // 创建用户消息
        const userMessage = {
            id: this.generateMessageId(),
            role: 'user',
            content: message,
            timestamp: Date.now(),
            status: 'success'
        };
        
        // 添加到会话历史
        this.addMessageToSession(userMessage);
        
        // 如果是新会话的第一条消息，自动命名
        const currentSession = this.sessions[this.currentSessionId];
        if (currentSession && currentSession.messages.length === 1) {
            // 使用消息前20个字符作为会话名称
            const sessionName = message.length > 20 ? message.substring(0, 20) + '...' : message;
            currentSession.name = sessionName;
            this.saveSessions();
            this.renderSessionList();
            this.updateChatTitle(sessionName);
        }
        
        // 显示用户消息
        console.log('准备显示用户消息');
        this.addMessageToChat(userMessage);
        console.log('用户消息显示完成');
        
        // 清空输入框
        this.userInput.value = '';
        this.autoResizeInput();
        this.sendButton.disabled = true;
        this.sendButton.classList.remove('active');
        
        // 设置加载状态
        this.setLoading(true);
        
        // 创建AI消息占位符
        const aiMessage = {
            id: this.generateMessageId(),
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
            status: 'sending'
        };
        
        console.log('准备显示AI消息占位符');
        this.addMessageToChat(aiMessage);
        console.log('AI消息占位符显示完成');
        
        try {
            // 创建超时控制器
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒超时
            
            // 发送请求到后端
            console.log('准备调用API，消息:', message, '会话ID:', this.currentSessionId);
            const response = await fetch('/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Accept': 'text/event-stream'
                },
                body: JSON.stringify({
                    message: message,
                    sessionId: this.currentSessionId
                }),
                signal: controller.signal
            });
            
            console.log('API响应状态:', response.status, response.ok);
            if (!response.ok) {
                console.error('API响应错误详情:', response.status, response.statusText, 'URL:', response.url);
            }
            
            // 清除超时
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                console.error('API响应错误:', response.status, response.statusText);
                throw new Error(`HTTP错误! 状态: ${response.status}`);
            }

            console.log('开始处理流式响应');
            // 处理流式响应
            await this.streamAIResponse(response, aiMessage);
            
        } catch (error) {
            console.error('发送消息失败:', error);
            
            // 特殊处理超时错误
            if (error.name === 'AbortError') {
                error.message = '请求超时：服务器响应时间过长，请稍后重试';
            }
            
            this.handleAPIError(error, aiMessage);
        } finally {
            this.setLoading(false);
        }
    }
    
    /**
     * 处理AI流式响应（UTF-8安全版）
     */
    async streamAIResponse(response, aiMessage) {
        console.log('开始处理流式响应，消息ID:', aiMessage.id);
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let fullContent = '';
        let buffer = ''; // 用于处理不完整的JSON数据
        let chunkCount = 0;
        
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                // 解码接收到的数据，确保UTF-8编码
                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;
                chunkCount++;
                console.log(`接收到数据块 #${chunkCount}:`, chunk);
                
                // 处理完整的行
                const lines = buffer.split('\n');
                // 保留最后一行（可能不完整）
                buffer = lines.pop() || '';
                
                for (const line of lines) {
                    // 跳过空行
                    if (!line || !line.trim()) continue;
                    
                    const trimmedLine = line.trim();
                    
                    // 只处理以"data:"开头的行（注意：可能没有空格）
                    if (trimmedLine.startsWith('data:')) {
                        // 提取data:后面的内容，处理可能有或没有空格的情况
                        const data = trimmedLine.slice(5).trimStart();  // slice(5) 跳过 'data:'，然后去除前导空格
                        
                        // 处理双重 data: 前缀的情况 (data:)
                        if (data.startsWith('data:')) {
                            const actualData = data.slice(5).trimStart();  // 再次跳过 'data:' 并去除空格
                            
                            // 跳过[DONE]标记
                            if (actualData === '[DONE]') {
                                // 流式响应完成
                                aiMessage.status = 'success';
                                aiMessage.content = fullContent;
                                this.updateMessageInSession(aiMessage);
                                this.updateMessageStatus(aiMessage.id, 'success');
                                
                                // 清除打字动画
                                if (this.currentTypingMessage) {
                                    clearInterval(this.currentTypingMessage.interval);
                                    this.currentTypingMessage = null;
                                }
                                return;
                            }
                            
                            // 跳过空数据
                            if (!actualData || actualData.trim() === '') continue;
                            
                            try {
                                // 直接解析JSON数据
                                const parsed = JSON.parse(actualData);
                                
                                if (parsed.content !== undefined && parsed.content !== null) {
                                    fullContent += parsed.content;
                                    // 使用打字机效果显示
                                    this.typeMessage(aiMessage.id, fullContent);
                                }
                            } catch (e) {
                                console.warn('解析双重data前缀的SSE数据失败:', e);
                            }
                            continue;
                        }
                        
                        // 跳过[DONE]标记
                        if (data === '[DONE]') {
                            console.log('收到[DONE]标记，响应完成');
                            // 流式响应完成
                            aiMessage.status = 'success';
                            aiMessage.content = fullContent;
                            this.updateMessageInSession(aiMessage);
                            this.updateMessageStatus(aiMessage.id, 'success');
                            
                            // 清除打字动画
                            if (this.currentTypingMessage) {
                                clearInterval(this.currentTypingMessage.interval);
                                this.currentTypingMessage = null;
                            }
                            console.log('流式响应处理完成，最终内容长度:', fullContent.length);
                            return;
                        }
                        
                        // 跳过空数据
                        if (!data || data.trim() === '') continue;
                        
                        try {
                            // 直接解析JSON数据
                            const parsed = JSON.parse(data);
                            
                            if (parsed.content !== undefined && parsed.content !== null) {
                                fullContent += parsed.content;
                                // 使用打字机效果显示
                                this.typeMessage(aiMessage.id, fullContent);
                            }
                        } catch (e) {
                            console.warn('解析SSE数据失败:', e);
                        }
                    }
                }
            }
            
            // 处理剩余的缓冲区内容
            if (buffer.trim().startsWith('data:')) {
                const data = buffer.trim().slice(5).trimStart();  // 跳过 'data:' 并去除前导空格
                
                // 处理双重 data: 前缀的情况 (data:)
                if (data.startsWith('data:')) {
                    const actualData = data.slice(5).trimStart();  // 再次跳过 'data:' 并去除空格
                    
                    if (actualData === '[DONE]') {
                        aiMessage.status = 'success';
                        aiMessage.content = fullContent;
                        this.updateMessageInSession(aiMessage);
                        this.updateMessageStatus(aiMessage.id, 'success');
                        
                        if (this.currentTypingMessage) {
                            clearInterval(this.currentTypingMessage.interval);
                            this.currentTypingMessage = null;
                        }
                    } else {
                        // 尝试解析剩余的JSON数据
                        try {
                            // 直接解析JSON数据
                            const parsed = JSON.parse(actualData);
                            if (parsed.content) {
                                fullContent += parsed.content;
                                console.log('解析到内容:', parsed.content, '完整内容:', fullContent);
                                // 使用打字机效果显示
                                this.typeMessage(aiMessage.id, fullContent);
                            }
                        } catch (e) {
                            console.warn('解析剩余缓冲区数据失败:', e, '数据:', data);
                        }
                    }
                }
            }
            
        } catch (error) {
            console.error('流式响应处理失败:', error);
            aiMessage.status = 'error';
            aiMessage.content = '抱歉，响应处理失败。';
            this.updateMessageInSession(aiMessage);
            this.updateMessageStatus(aiMessage.id, 'error');
            
            // 清除打字动画
            if (this.currentTypingMessage) {
                clearInterval(this.currentTypingMessage.interval);
                this.currentTypingMessage = null;
            }
        }
    }
    
    /**
     * 打字机效果显示消息
     */
    typeMessage(messageId, fullContent) {
        // 清除之前的打字动画
        if (this.currentTypingMessage) {
            clearInterval(this.currentTypingMessage.interval);
        }
        
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (!messageElement) {
            console.error('消息元素未找到，ID:', messageId);
            return;
        }
        
        // 查找 .message-bubble 元素
        const bubbleElement = messageElement.querySelector('.message-bubble');
        if (!bubbleElement) {
            console.error('气泡元素未找到');
            return;
        }
        
        // 直接设置内容（无打字机效果，提升性能）
        bubbleElement.textContent = fullContent;
        this.scrollToBottom();
    }
    
    /**
     * 添加消息到聊天区域
     */
    addMessageToChat(message) {
        console.log('addMessageToChat 被调用，消息:', message);
        console.log('chatMessages 元素:', this.chatMessages);
        
        if (!this.chatMessages) {
            console.error('错误：chatMessages 元素未找到！');
            return;
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.role}`;
        messageDiv.setAttribute('data-message-id', message.id);
        
        const time = new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        const isUser = message.role === 'user';
        
        // 对于空内容的AI消息，使用占位符
        const displayContent = message.content || (message.role === 'assistant' && message.status === 'sending' ? '...' : '');
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                ${isUser ? 
                    '<svg width="20" height="20"><use href="#icon-user"></use></svg>' : 
                    '<svg width="20" height="20"><use href="#icon-ai"></use></svg>'
                }
            </div>
            <div class="message-content">
                <div class="message-bubble" data-bubble-for="${message.id}">
                    ${this.formatMessage(displayContent)}
                </div>
                <div class="message-info">
                    <span class="message-time">${time}</span>
                    <div class="message-status">
                        ${this.getStatusIcon(message.status)}
                    </div>
                </div>
                <div class="message-actions">
                    <button class="message-action-btn copy-btn" onclick="chatApp.copyMessage('${message.id}')" title="复制消息">
                        <svg width="14" height="14"><use href="#icon-copy"></use></svg>
                        <span>复制</span>
                    </button>
                    <button class="message-action-btn like-btn" onclick="chatApp.likeMessage('${message.id}')" title="点赞">
                        <svg width="14" height="14"><use href="#icon-like"></use></svg>
                        <span>赞</span>
                    </button>
                    ${!isUser ? `
                    <button class="message-action-btn refresh-btn" onclick="chatApp.regenerateMessage('${message.id}')" title="重新生成">
                        <svg width="14" height="14"><use href="#icon-refresh"></use></svg>
                        <span>重试</span>
                    </button>` : ''}
                </div>
            </div>
        `;
        
        console.log('消息div创建完成，准备添加到chatMessages');
        this.chatMessages.appendChild(messageDiv);
        console.log('消息已添加到chatMessages，子元素数量:', this.chatMessages.children.length);
        this.scrollToBottom();
        
        // 添加动画效果
        setTimeout(() => {
            messageDiv.classList.add('show');
        }, 10);
    }
    
    /**
     * 获取状态图标
     */
    getStatusIcon(status) {
        switch (status) {
            case 'sending': 
                return '<span class="status-icon status-sending" title="发送中"><div class="status-dot pulse"></div></span>';
            case 'success': 
                return '<span class="status-icon status-sent" title="已送达"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></span>';
            case 'error': 
                return '<span class="status-icon status-error" title="发送失败"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg></span>';
            default: 
                return '';
        }
    }
    
    /**
     * 更新消息状态
     */
    updateMessageStatus(messageId, status) {
        console.log('更新消息状态:', messageId, '状态:', status);
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (!messageElement) {
            console.log('消息元素未找到:', messageId);
            return;
        }
        
        const statusElement = messageElement.querySelector('.message-status');
        if (statusElement) {
            statusElement.innerHTML = this.getStatusIcon(status);
            console.log('状态已更新为:', status);
        } else {
            console.log('状态元素未找到');
        }
    }
    
    /**
     * 复制消息内容
     */
    async copyMessage(messageId) {
        const message = this.getMessageFromSession(messageId);
        if (!message) return;
        
        try {
            await navigator.clipboard.writeText(message.content);
            this.showToast('✅ 已复制到剪贴板', 'success');
            
            // 高亮复制按钮
            const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
            if (messageElement) {
                const copyBtn = messageElement.querySelector('.copy-btn');
                if (copyBtn) {
                    copyBtn.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.15))';
                    copyBtn.style.borderColor = 'var(--success-color)';
                    copyBtn.style.color = 'var(--success-color)';
                    setTimeout(() => {
                        copyBtn.style.background = '';
                        copyBtn.style.borderColor = '';
                        copyBtn.style.color = '';
                    }, 1000);
                }
            }
        } catch (error) {
            console.error('复制失败:', error);
            // 降级方案
            const textArea = document.createElement('textarea');
            textArea.value = message.content;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('✅ 已复制到剪贴板', 'success');
        }
    }
    
    /**
     * 点赞消息
     */
    likeMessage(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (!messageElement) return;
        
        const likeBtn = messageElement.querySelector('.like-btn');
        if (!likeBtn) return;
        
        const isLiked = likeBtn.classList.contains('liked');
        
        if (isLiked) {
            // 取消点赞
            likeBtn.classList.remove('liked');
            const svg = likeBtn.querySelector('svg use');
            if (svg) svg.setAttribute('href', '#icon-like');
            this.showToast('取消点赞', 'info');
        } else {
            // 点赞
            likeBtn.classList.add('liked');
            const svg = likeBtn.querySelector('svg use');
            if (svg) svg.setAttribute('href', '#icon-like-filled');
            this.showToast('❤️ 点赞成功', 'success');
        }
    }
    
    /**
     * 重新生成消息
     */
    regenerateMessage(messageId) {
        const message = this.getMessageFromSession(messageId);
        if (!message || message.role !== 'assistant') return;
        
        // 找到对应的问题消息
        const session = this.sessions[this.currentSessionId];
        const messageIndex = session.messages.findIndex(m => m.id === messageId);
        if (messageIndex === -1) return;
        
        // 获取用户问题（前一个消息）
        const userMessage = session.messages[messageIndex - 1];
        if (!userMessage || userMessage.role !== 'user') return;
        
        // 重新发送用户消息
        this.userInput.value = userMessage.content;
        this.sendMessage();
    }
    
    /**
     * 显示提示消息
     */
    showToast(message, type = 'success') {
        if (!this.copyToast) return;
        
        this.copyToast.textContent = message;
        this.copyToast.className = `toast ${type}`;
        this.copyToast.classList.add('show');
        
        setTimeout(() => {
            this.copyToast.classList.remove('show');
        }, 2000);
    }
    
    /**
     * 显示复制成功提示（保持向后兼容）
     */
    showCopyToast() {
        this.showToast('✅ 已复制到剪贴板', 'success');
    }
    
    /**
     * 处理API错误
     */
    handleAPIError(error, aiMessage) {
        console.error('API错误:', error);
        
        let errorMessage = '抱歉，我遇到了一个错误。';
        
        if (error.name === 'AbortError' || error.message.includes('超时')) {
            errorMessage = '请求超时：服务器响应时间过长，请稍后重试';
        } else if (error.message.includes('余额不足')) {
            errorMessage = '错误：API余额不足，请联系管理员';
        } else if (error.message.includes('限流')) {
            errorMessage = '错误：请求过于频繁，请稍后再试';
        } else if (error.message.includes('网络') || error.message.includes('Network')) {
            errorMessage = '错误：网络连接失败，请检查网络连接';
        } else if (error.message.includes('HTTP错误: 429')) {
            errorMessage = '错误：请求过于频繁，请等待几分钟后重试';
        } else if (error.message.includes('HTTP错误: 5')) {
            errorMessage = '错误：服务器内部错误，请稍后重试';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage = '错误：无法连接到服务器，请检查网络连接';
        }
        
        // 停止打字动画
        if (this.currentTypingMessage) {
            clearInterval(this.currentTypingMessage.interval);
            this.currentTypingMessage = null;
        }
        
        // 更新错误消息
        const messageElement = document.querySelector(`[data-message-id="${aiMessage.id}"]`);
        if (messageElement) {
            const bubbleElement = messageElement.querySelector('.message-bubble');
            if (bubbleElement) {
                bubbleElement.textContent = errorMessage;
            }
        }
        
        aiMessage.content = errorMessage;
        aiMessage.status = 'error';
        this.updateMessageInSession(aiMessage);
        this.updateMessageStatus(aiMessage.id, 'error');
    }
    
    /**
     * 设置加载状态
     */
    setLoading(loading) {
        this.isLoading = loading;
        this.sendButton.disabled = loading || !this.userInput.value.trim();
        this.userInput.disabled = loading;
        
        if (loading) {
            this.sendButton.innerHTML = '<div class="loading-spinner"></div>';
            this.sendButton.classList.add('sending');
        } else {
            this.sendButton.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
            `;
            this.sendButton.classList.remove('sending');
        }
    }
    
    /**
     * 滚动到底部
     */
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
    
    /**
     * 检查空状态
     */
    checkEmptyState() {
        const hasMessages = this.chatMessages.children.length > 0;
        this.emptyState.style.display = hasMessages ? 'none' : 'flex';
    }
    
    /**
     * 更新聊天标题
     */
    updateChatTitle(title) {
        const chatTitleElement = document.getElementById('chatTitle');
        if (chatTitleElement) {
            const titleText = chatTitleElement.querySelector('svg') ? 
                chatTitleElement.innerHTML.replace(/新对话|默认对话/, title) : 
                title;
            if (!chatTitleElement.querySelector('svg')) {
                chatTitleElement.innerHTML = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; vertical-align: middle;">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    ${title}
                `;
            } else {
                const svg = chatTitleElement.querySelector('svg');
                chatTitleElement.innerHTML = '';
                chatTitleElement.appendChild(svg);
                chatTitleElement.appendChild(document.createTextNode(title));
            }
        }
    }
    
    /**
     * 清除空状态
     */
    clearEmptyState() {
        this.emptyState.style.display = 'none';
    }
    
    /**
     * 格式化消息内容
     */
    formatMessage(content) {
        return content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/\n/g, '<br>');
    }
    
    // ===== 会话管理相关方法 =====
    
    /**
     * 生成会话ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * 生成消息ID
     */
    generateMessageId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * 创建新会话
     */
    createNewSession() {
        const sessionId = this.generateSessionId();
        const session = {
            id: sessionId,
            name: '新对话 ' + new Date().toLocaleDateString(),
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        this.sessions[sessionId] = session;
        this.currentSessionId = sessionId;
        this.saveSessions();
        this.renderSessionList();
        this.clearChatDisplay();
        this.checkEmptyState();
        
        console.log('创建新会话:', sessionId);
    }
    
    /**
     * 切换到指定会话
     */
    switchSession(sessionId) {
        if (!this.sessions[sessionId]) return;
        
        this.currentSessionId = sessionId;
        this.loadCurrentSession();
        this.renderSessionList();
        
        // 更新聊天标题
        const session = this.sessions[sessionId];
        if (session) {
            this.updateChatTitle(session.name);
        }
        
        // 移动端关闭侧边栏
        if (window.innerWidth <= 768) {
            this.sidebar.classList.remove('active');
        }
        
        console.log('切换到会话:', sessionId);
    }
    
    /**
     * 删除会话
     */
    deleteSession(sessionId) {
        if (Object.keys(this.sessions).length <= 1) {
            alert('至少需要保留一个对话');
            return;
        }
        
        if (confirm('确定要删除这个对话吗？')) {
            delete this.sessions[sessionId];
            
            // 如果删除的是当前会话，切换到第一个会话
            if (this.currentSessionId === sessionId) {
                this.currentSessionId = Object.keys(this.sessions)[0];
            }
            
            this.saveSessions();
            this.renderSessionList();
            this.loadCurrentSession();
            
            console.log('删除会话:', sessionId);
        }
    }
    
    /**
     * 重命名会话
     */
    renameSession(sessionId) {
        const session = this.sessions[sessionId];
        if (!session) return;
        
        const newName = prompt('请输入新的对话名称:', session.name);
        if (newName && newName.trim()) {
            session.name = newName.trim();
            session.updatedAt = Date.now();
            this.saveSessions();
            this.renderSessionList();
            
            // 如果重命名的是当前会话，更新聊天标题
            if (sessionId === this.currentSessionId) {
                this.updateChatTitle(session.name);
            }
            
            console.log('重命名会话:', sessionId, '新名称:', newName);
        }
    }
    
    /**
     * 渲染会话列表
     */
    renderSessionList() {
        console.log('🔄 开始渲染会话列表，会话数量:', Object.keys(this.sessions).length);
        this.sessionList.innerHTML = '';
        
        // 按更新时间排序
        const sortedSessions = Object.values(this.sessions)
            .sort((a, b) => b.updatedAt - a.updatedAt);
        
        // 如果没有会话，显示空状态
        if (sortedSessions.length === 0) {
            this.sessionList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💭</div>
                    <div class="empty-state-title">暂无对话</div>
                    <div class="empty-state-desc">点击 + 按钮创建新对话</div>
                </div>
            `;
            return;
        }
        
        sortedSessions.forEach(session => {
            const sessionItem = document.createElement('div');
            sessionItem.className = `chat-item ${session.id === this.currentSessionId ? 'active' : ''}`;
            sessionItem.setAttribute('data-session-id', session.id);
            
            const time = new Date(session.updatedAt);
            const timeStr = time.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
            
            sessionItem.innerHTML = `
                <div class="chat-item-main" data-action="switch">
                    <div class="chat-item-title">${this.escapeHtml(session.name)}</div>
                    <div class="chat-item-preview">${this.getSessionPreview(session)}</div>
                    <div class="chat-item-time">${timeStr}</div>
                </div>
                <div class="chat-item-actions">
                    <button class="chat-item-action-btn rename-btn" data-action="rename" title="重命名">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="chat-item-action-btn delete-btn" data-action="delete" title="删除">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            `;
            
            this.sessionList.appendChild(sessionItem);
        });
        
        console.log('✅ 会话列表渲染完成');
    }
    
    /**
     * 设置会话列表事件委托
     */
    setupSessionListEvents() {
        // 使用事件委托处理所有会话列表的点击
        this.sessionList.addEventListener('click', (e) => {
            console.log('📌 会话列表被点击', e.target);
            
            // 找到最近的 chat-item
            const chatItem = e.target.closest('.chat-item');
            if (!chatItem) {
                console.log('⚠️ 未点击在会话项上');
                return;
            }
            
            const sessionId = chatItem.getAttribute('data-session-id');
            console.log('🎯 点击的会话ID:', sessionId);
            
            // 找到具体的操作元素
            const action = e.target.closest('[data-action]');
            if (action) {
                const actionType = action.getAttribute('data-action');
                console.log('🔧 执行操作:', actionType, '会话ID:', sessionId);
                
                switch(actionType) {
                    case 'switch':
                        console.log('→ 切换会话');
                        this.switchSession(sessionId);
                        break;
                    case 'rename':
                        console.log('→ 重命名会话');
                        e.stopPropagation();
                        this.renameSession(sessionId);
                        break;
                    case 'delete':
                        console.log('→ 删除会话');
                        e.stopPropagation();
                        this.deleteSession(sessionId);
                        break;
                }
            } else {
                // 如果没有具体操作，默认切换会话
                console.log('→ 默认切换会话');
                this.switchSession(sessionId);
            }
        });
        
        console.log('✅ 会话列表事件委托已设置');
    }
    
    /**
     * 获取会话预览
     */
    getSessionPreview(session) {
        const userMessages = session.messages.filter(m => m.role === 'user');
        if (userMessages.length === 0) return '暂无消息';
        
        const lastMessage = userMessages[userMessages.length - 1];
        const preview = lastMessage.content.substring(0, 30);
        return preview + (lastMessage.content.length > 30 ? '...' : '');
    }
    
    /**
     * 转义HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * 清空聊天显示
     */
    clearChatDisplay() {
        this.chatMessages.innerHTML = '';
        this.checkEmptyState();
    }
    
    /**
     * 清空对话历史
     */
    clearChatHistory() {
        if (confirm('确定要清空当前对话的所有消息吗？')) {
            const session = this.sessions[this.currentSessionId];
            if (session) {
                session.messages = [];
                session.updatedAt = Date.now();
                this.saveSessions();
                this.clearChatDisplay();
                
                console.log('清空会话历史:', this.currentSessionId);
            }
        }
    }
    
    /**
     * 加载当前会话
     */
    loadCurrentSession() {
        const session = this.sessions[this.currentSessionId];
        if (!session) {
            this.createNewSession();
            return;
        }
        
        this.clearChatDisplay();
        
        // 显示会话消息
        session.messages.forEach(message => {
            this.addMessageToChat(message);
        });
        
        this.checkEmptyState();
    }
    
    /**
     * 添加消息到会话
     */
    addMessageToSession(message) {
        const session = this.sessions[this.currentSessionId];
        if (session) {
            session.messages.push(message);
            session.updatedAt = Date.now();
            this.saveSessions();
            this.renderSessionList();
        }
    }
    
    /**
     * 更新会话中的消息
     */
    updateMessageInSession(updatedMessage) {
        const session = this.sessions[this.currentSessionId];
        if (session) {
            const index = session.messages.findIndex(m => m.id === updatedMessage.id);
            if (index !== -1) {
                session.messages[index] = updatedMessage;
                session.updatedAt = Date.now();
                this.saveSessions();
                this.renderSessionList();
            }
        }
    }
    
    /**
     * 从会话中获取消息
     */
    getMessageFromSession(messageId) {
        const session = this.sessions[this.currentSessionId];
        if (session) {
            return session.messages.find(m => m.id === messageId);
        }
        return null;
    }
    
    /**
     * 加载所有会话
     */
    loadSessions() {
        try {
            const saved = localStorage.getItem('chatSessions');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('加载会话失败:', error);
        }
        
        // 默认创建一个会话
        const defaultSession = {
            id: this.currentSessionId,
            name: '默认对话',
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        return {
            [this.currentSessionId]: defaultSession
        };
    }
    
    /**
     * 保存所有会话
     */
    saveSessions() {
        try {
            localStorage.setItem('chatSessions', JSON.stringify(this.sessions));
        } catch (error) {
            console.error('保存会话失败:', error);
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.chatApp = new ChatApp();
    
    // 页面可见性变化时处理
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && window.chatApp) {
            // 页面重新可见时刷新会话列表
            window.chatApp.renderSessionList();
        }
    });
});