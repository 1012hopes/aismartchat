package com.example.springaichat.service;

import com.example.springaichat.entity.ChatMessage;
import com.example.springaichat.entity.ChatSession;
import com.example.springaichat.repository.ChatMessageRepository;
import com.example.springaichat.repository.ChatSessionRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import reactor.core.publisher.Flux;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.logging.Logger;

/**
 * 聊天服务类 - 封装AI模型交互逻辑
 * 负责处理用户消息、管理对话历史和调用AI模型
 */
@Service
public class ChatService {
    
    private static final Logger logger = Logger.getLogger(ChatService.class.getName());
    
    private final ChatClient chatClient;
    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    
    // 线程池，用于处理异步SSE请求
    private final ExecutorService executorService = Executors.newCachedThreadPool();
    
    // 最大对话历史记录数（每方）
    private static final int MAX_CONVERSATION_HISTORY = 10;
    
    // SSE超时时间（5分钟）
    private static final long SSE_TIMEOUT = 5 * 60 * 1000L;
    
    // 系统提示词，指导AI模型的行为
    private static final String SYSTEM_PROMPT = "你是一个友好、专业的AI助手。请用简洁、准确的中文回答用户的问题。";

    @Autowired
    public ChatService(ChatClient chatClient, 
                      ChatSessionRepository sessionRepository,
                      ChatMessageRepository messageRepository) {
        this.chatClient = chatClient;
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
    }
    
    /**
     * 处理聊天请求，使用SseEmitter返回标准SSE流式响应
     * 
     * @param sessionId 会话ID
     * @param userMessage 用户消息内容
     * @return SseEmitter对象，用于流式推送AI响应
     */
    public SseEmitter chatStream(String sessionId, String userMessage) {
        logger.info(String.format("开始流式聊天 - 会话ID: %s, 消息长度: %d", sessionId, userMessage.length()));
        
        // 创建SseEmitter，设置超时时间
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);
        
        // 异步处理聊天请求
        executorService.execute(() -> {
            try {
                processStreamingChat(emitter, sessionId, userMessage);
            } catch (Exception e) {
                logger.severe("流式聊天处理异常: " + e.getMessage());
                handleStreamError(emitter, e);
            }
        });
        
        // 设置超时回调
        emitter.onTimeout(() -> {
            logger.warning("SSE连接超时 - 会话ID: " + sessionId);
            emitter.complete();
        });
        
        // 设置错误回调
        emitter.onError((ex) -> {
            logger.severe("SSE连接错误: " + ex.getMessage());
            emitter.complete();
        });
        
        return emitter;
    }
    
    /**
     * 处理流式聊天的核心逻辑
     */
    private void processStreamingChat(SseEmitter emitter, String sessionIdParam, String userMessage) {
        final String sessionId = (sessionIdParam == null || sessionIdParam.isEmpty()) ? "default" : sessionIdParam;
        
        try {
            // 获取或创建会话
            ChatSession session = getOrCreateSession(sessionId);
            
            // 保存用户消息到数据库
            ChatMessage userMsg = new ChatMessage(
                generateMessageId(), 
                "user", 
                userMessage, 
                "success"
            );
            userMsg.setSession(session);
            messageRepository.save(userMsg);
            
            // 获取会话历史
            List<ChatMessage> history = messageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
            
            // 构建消息列表
            List<Message> messages = buildMessagesFromHistory(history);
            
            // 用于收集完整响应
            StringBuilder fullResponse = new StringBuilder();
            
            // 调用AI模型并流式返回
            chatClient.prompt()
                .messages(messages)
                .stream()
                .chatResponse()
                .doOnNext(response -> {
                    try {
                        String content = response.getResult().getOutput().getContent();
                        
                        if (content != null && !content.isEmpty()) {
                            // 收集完整响应
                            fullResponse.append(content);
                            
                            // 发送SSE事件
                            String escapedContent = escapeJson(content);
                            String sseData = String.format("{\"content\":\"%s\",\"done\":false}", escapedContent);
                            emitter.send(SseEmitter.event()
                                .name("message")
                                .data(sseData));
                            
                            logger.fine("发送内容片段: " + content.substring(0, Math.min(20, content.length())));
                        }
                    } catch (IOException e) {
                        logger.severe("发送SSE数据失败: " + e.getMessage());
                        throw new RuntimeException(e);
                    }
                })
                .doOnComplete(() -> {
                    try {
                        // 保存完整响应到数据库
                        String completeResponse = fullResponse.toString();
                        if (!completeResponse.isEmpty()) {
                            saveChatHistory(sessionId, completeResponse);
                        }
                        
                        // 发送完成事件
                        emitter.send(SseEmitter.event()
                            .name("message")
                            .data("{\"done\":true}"));
                        
                        // 完成SSE连接
                        emitter.complete();
                        
                        logger.info(String.format("流式响应完成 - 会话ID: %s, 响应长度: %d", 
                            sessionId, completeResponse.length()));
                    } catch (IOException e) {
                        logger.severe("发送完成事件失败: " + e.getMessage());
                        emitter.completeWithError(e);
                    }
                })
                .doOnError(error -> {
                    logger.severe("AI模型调用错误: " + error.getMessage());
                    handleStreamError(emitter, error);
                })
                .subscribe();
                
        } catch (Exception e) {
            logger.severe("处理流式聊天时发生错误: " + e.getMessage());
            handleStreamError(emitter, e);
        }
    }
    
    /**
     * 处理流式错误
     */
    private void handleStreamError(SseEmitter emitter, Throwable error) {
        try {
            String errorMessage = handleErrorMessage(error.getMessage());
            String escapedError = escapeJson(errorMessage);
            String errorData = String.format("{\"error\":\"%s\",\"done\":true}", escapedError);
            
            emitter.send(SseEmitter.event()
                .name("error")
                .data(errorData));
            
            emitter.completeWithError(error);
        } catch (IOException e) {
            logger.severe("发送错误事件失败: " + e.getMessage());
            emitter.completeWithError(e);
        }
    }
    
    /**
     * 处理聊天请求，返回流式响应（保留旧的Flux方法以兼容）
     * 
     * @param sessionId 会话ID
     * @param userMessage 用户消息内容
     * @return 流式AI响应
     */
    @Transactional
    public Flux<String> chat(String sessionId, String userMessage) {
        if (sessionId == null || sessionId.isEmpty()) {
            sessionId = "default";
        }
        
        // 获取或创建会话
        ChatSession session = getOrCreateSession(sessionId);
        
        // 保存用户消息到数据库
        ChatMessage userMsg = new ChatMessage(
            generateMessageId(), 
            "user", 
            userMessage, 
            "success"
        );
        userMsg.setSession(session);
        messageRepository.save(userMsg);
        
        // 获取会话历史
        List<ChatMessage> history = messageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
        
        // 创建响应收集器
        final ResponseCollector collector = new ResponseCollector(sessionId);
        
        try {
            // 构建消息列表，包含历史记录作为上下文
            List<Message> messages = buildMessagesFromHistory(history);
            
            // 调用AI模型并返回流式响应
            return chatClient.prompt()
                    .messages(messages)
                    .stream()
                    .chatResponse()
                    .map(response -> {
                        String content = response.getResult().getOutput().getContent();
                        
                        if (content != null && !content.isEmpty()) {
                            // 收集响应内容
                            collector.addContent(content);
                            
                            // 返回标准SSE格式数据
                            String escapedContent = escapeJson(content);
                            return "data: {\"content\": \"" + escapedContent + "\"}\n\n";
                        }
                        
                        return "data: {\"content\": \"\"}\n\n";
                    })
                    .filter(content -> !content.isEmpty()) // 过滤空内容
                    .doFinally(signal -> {
                        // 在流完成时保存历史记录
                        if (signal == reactor.core.publisher.SignalType.ON_COMPLETE) {
                            collector.saveHistory();
                        }
                    })
                    .onErrorResume(e -> {
                        logger.severe("AI模型调用错误: " + e.getMessage());
                        logger.severe("错误类型: " + e.getClass().getSimpleName());
                        
                        // 特殊处理网络连接错误
                        if (e.getMessage() != null && 
                            (e.getMessage().contains("UnresolvedAddressException") || 
                             e.getMessage().contains("ConnectException") ||
                             e.getMessage().contains("UnknownHostException"))) {
                            logger.severe("检测到网络连接问题，建议检查网络配置或代理设置");
                        }
                        
                        String errorMessage = handleErrorMessage(e.getMessage());
                        return Flux.just(
                            "data: {\"error\": \"" + escapeJson(errorMessage) + "\"}\n\n",
                            "[DONE]\n\n"
                        );
                    })
                    .concatWithValues("[DONE]\n\n");
                    
        } catch (Exception e) {
            logger.severe("处理聊天请求时发生错误: " + e.getMessage());
            logger.severe("错误类型: " + e.getClass().getSimpleName());
            String errorMessage = handleErrorMessage(e.getMessage());
            return Flux.just(
                "data: {\"error\": \"" + escapeJson(errorMessage) + "\"}\n\n",
                "[DONE]\n\n"
            );
        }
    }
    
    /**
     * 从历史记录构建消息列表，包含系统提示、历史对话和当前用户消息
     * 
     * @param history 对话历史
     * @return 构建好的消息列表
     */
    private List<Message> buildMessagesFromHistory(List<ChatMessage> history) {
        List<Message> messages = new ArrayList<>();
        
        // 添加系统提示词
        messages.add(new SystemMessage(SYSTEM_PROMPT));
        
        // 限制历史记录数量，只使用最近的对话
        int startIndex = Math.max(0, history.size() - (MAX_CONVERSATION_HISTORY * 2));
        List<ChatMessage> recentHistory = history.subList(startIndex, history.size());
        
        // 添加历史对话作为上下文
        for (ChatMessage message : recentHistory) {
            if ("user".equals(message.getRole())) {
                messages.add(new UserMessage(message.getContent()));
            } else if ("assistant".equals(message.getRole())) {
                messages.add(new AssistantMessage(message.getContent()));
            }
        }
        
        return messages;
    }
    
    /**
     * 保存AI响应到对话历史
     * 
     * @param sessionId 会话ID
     * @param aiResponse AI响应内容
     */
    @Transactional
    private void saveChatHistory(String sessionId, String aiResponse) {
        if (aiResponse != null && !aiResponse.isEmpty()) {
            ChatSession session = getOrCreateSession(sessionId);
            
            ChatMessage aiMessage = new ChatMessage(
                generateMessageId(),
                "assistant",
                aiResponse,
                "success"
            );
            aiMessage.setSession(session);
            messageRepository.save(aiMessage);
            
            // 更新会话的最后更新时间
            session.setUpdatedAt(LocalDateTime.now());
            sessionRepository.save(session);
            
            logger.info(String.format("保存对话历史 - 会话ID: %s, 消息长度: %d", sessionId, aiResponse.length()));
        }
    }
    
    /**
     * 获取或创建会话
     * 
     * @param sessionId 会话ID
     * @return 会话对象
     */
    private ChatSession getOrCreateSession(String sessionId) {
        Optional<ChatSession> sessionOpt = sessionRepository.findById(sessionId);
        if (sessionOpt.isPresent()) {
            return sessionOpt.get();
        }
        
        // 创建新会话
        ChatSession newSession = new ChatSession(sessionId, "新对话");
        return sessionRepository.save(newSession);
    }
    
    /**
     * 生成消息ID
     */
    private String generateMessageId() {
        return "msg_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 10000);
    }
    
    /**
     * 处理错误消息，转换为友好的用户提示
     * 
     * @param errorMessage 原始错误消息
     * @return 友好的错误提示
     */
    private String handleErrorMessage(String errorMessage) {
        if (errorMessage == null) {
            return "发生未知错误，请稍后再试。";
        }
        
        // DNS解析错误处理
        if (errorMessage.contains("UnresolvedAddressException")) {
            return "无法连接到AI服务，请检查网络连接或DNS设置";
        }
        // 连接异常处理
        else if (errorMessage.contains("ConnectException")) {
            return "连接AI服务失败，请检查网络连接或防火墙设置";
        }
        // 未知主机错误处理
        else if (errorMessage.contains("UnknownHostException")) {
            return "无法解析AI服务地址，请检查DNS设置或网络连接";
        }
        // API余额不足处理
        else if (errorMessage.contains("Insufficient Balance")) {
            return "API余额不足，请检查您的DeepSeek账户余额";
        }
        // API限流处理
        else if (errorMessage.contains("rate limit")) {
            return "API请求过于频繁，请稍后再试";
        }
        // 网络超时处理
        else if (errorMessage.contains("timeout") || errorMessage.contains("connection")) {
            return "网络连接超时，请检查网络连接或稍后重试";
        }
        // API密钥错误处理
        else if (errorMessage.contains("API key")) {
            return "API密钥配置错误，请检查配置文件";
        }
        // 其他错误
        else {
            return "处理请求时发生错误，请稍后再试";
        }
    }
    
    /**
     * 转义JSON字符串中的特殊字符
     * 
     * @param content 原始内容
     * @return 转义后的内容
     */
    private String escapeJson(String content) {
        return content
            .replace("\\", "\\\\")  // 转义反斜杠
            .replace("\"", "\\\"")  // 转义双引号
            .replace("\n", "\\n")    // 转义换行符
            .replace("\r", "\\r")    // 转义回车符
            .replace("\t", "\\t");    // 转义制表符
    }
    
    /**
     * 响应收集器，用于收集AI响应内容并保存历史记录
     */
    private class ResponseCollector {
        private final String sessionId;
        private final StringBuilder contentBuilder = new StringBuilder();
        
        public ResponseCollector(String sessionId) {
            this.sessionId = sessionId;
        }
        
        public void addContent(String content) {
            contentBuilder.append(content);
        }
        
        public void saveHistory() {
            String fullResponse = contentBuilder.toString();
            if (!fullResponse.isEmpty()) {
                saveChatHistory(sessionId, fullResponse);
            }
        }
    }
    
    /**
     * 清除指定会话的历史记录
     * 
     * @param sessionId 会话ID
     */
    @Transactional
    public void clearHistory(String sessionId) {
        if (sessionId != null && !sessionId.isEmpty()) {
            messageRepository.deleteBySessionId(sessionId);
            logger.info("已清除会话历史: " + sessionId);
        }
    }
    
    /**
     * 获取所有会话
     */
    public List<ChatSession> getAllSessions() {
        return sessionRepository.findAllByOrderByUpdatedAtDesc();
    }
    
    /**
     * 获取指定会话
     */
    public Optional<ChatSession> getSession(String sessionId) {
        return sessionRepository.findById(sessionId);
    }
    
    /**
     * 创建新会话
     */
    @Transactional
    public ChatSession createSession(String sessionId, String name) {
        ChatSession session = new ChatSession(sessionId, name);
        return sessionRepository.save(session);
    }
    
    /**
     * 删除会话
     */
    @Transactional
    public void deleteSession(String sessionId) {
        sessionRepository.deleteById(sessionId);
        logger.info("已删除会话: " + sessionId);
    }
    
    /**
     * 重命名会话
     */
    @Transactional
    public void renameSession(String sessionId, String newName) {
        Optional<ChatSession> sessionOpt = sessionRepository.findById(sessionId);
        if (sessionOpt.isPresent()) {
            ChatSession session = sessionOpt.get();
            session.setName(newName);
            sessionRepository.save(session);
            logger.info("已重命名会话: " + sessionId + " -> " + newName);
        }
    }
    
    /**
     * 获取会话的所有消息
     */
    public List<ChatMessage> getSessionMessages(String sessionId) {
        return messageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
    }
}