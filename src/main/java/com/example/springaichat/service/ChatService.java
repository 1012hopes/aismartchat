package com.example.springaichat.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

/**
 * 聊天服务类 - 封装AI模型交互逻辑
 * 负责处理用户消息、管理对话历史和调用AI模型
 */
@Service
public class ChatService {
    
    private static final Logger logger = Logger.getLogger(ChatService.class.getName());
    
    private final ChatClient chatClient;
    
    // 存储用户对话历史，使用ConcurrentHashMap保证线程安全
    private final ConcurrentHashMap<String, List<ChatMessage>> conversationHistory = new ConcurrentHashMap<>();
    
    // 最大对话历史记录数（每方）
    private static final int MAX_CONVERSATION_HISTORY = 10;
    
    // 系统提示词，指导AI模型的行为
    private static final String SYSTEM_PROMPT = "你是一个友好、专业的AI助手。请用简洁、准确的中文回答用户的问题。";

    @Autowired
    public ChatService(ChatClient chatClient) {
        this.chatClient = chatClient;
    }
    
    /**
     * 处理聊天请求，返回流式响应
     * 
     * @param sessionId 会话ID
     * @param userMessage 用户消息内容
     * @return 流式AI响应
     */
    public Flux<String> chat(String sessionId, String userMessage) {
        if (sessionId == null || sessionId.isEmpty()) {
            sessionId = "default";
        }
        
        // 获取或创建会话历史
        List<ChatMessage> history = conversationHistory.computeIfAbsent(sessionId, k -> new ArrayList<>());
        
        // 添加用户消息到历史
        ChatMessage newUserMessage = new ChatMessage("user", userMessage, System.currentTimeMillis());
        history.add(newUserMessage);
        
        // 确保历史记录不超过最大限制
        trimHistory(history);
        
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
        
        // 添加历史对话作为上下文
        for (ChatMessage message : history) {
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
    private void saveChatHistory(String sessionId, String aiResponse) {
        List<ChatMessage> history = conversationHistory.get(sessionId);
        if (history != null && aiResponse != null && !aiResponse.isEmpty()) {
            ChatMessage aiMessage = new ChatMessage("assistant", aiResponse, System.currentTimeMillis());
            history.add(aiMessage);
            
            // 确保历史记录不超过最大限制
            trimHistory(history);
            
            logger.info(String.format("保存对话历史 - 会话ID: %s, 消息长度: %d", sessionId, aiResponse.length()));
        }
    }
    
    /**
     * 裁剪历史记录，确保不超过最大限制
     * 
     * @param history 对话历史
     */
    private void trimHistory(List<ChatMessage> history) {
        // 计算用户和助手消息的数量
        int userMessageCount = 0;
        int assistantMessageCount = 0;
        
        for (ChatMessage message : history) {
            if ("user".equals(message.getRole())) {
                userMessageCount++;
            } else if ("assistant".equals(message.getRole())) {
                assistantMessageCount++;
            }
        }
        
        // 如果任一类型消息超过限制，移除最早的消息
        int messagesToRemove = Math.max(0, userMessageCount - MAX_CONVERSATION_HISTORY) + 
                              Math.max(0, assistantMessageCount - MAX_CONVERSATION_HISTORY);
        
        if (messagesToRemove > 0 && messagesToRemove < history.size()) {
            List<ChatMessage> trimmedHistory = new ArrayList<>(history.subList(messagesToRemove, history.size()));
            history.clear();
            history.addAll(trimmedHistory);
            logger.info("对话历史已裁剪以符合最大限制");
        }
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
     * 聊天消息模型
     */
    public static class ChatMessage {
        private String role;      // 角色：user 或 assistant
        private String content;   // 消息内容
        private long timestamp;   // 时间戳
        
        public ChatMessage(String role, String content, long timestamp) {
            this.role = role;
            this.content = content;
            this.timestamp = timestamp;
        }
        
        public String getRole() {
            return role;
        }
        
        public String getContent() {
            return content;
        }
        
        public long getTimestamp() {
            return timestamp;
        }
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
    public void clearHistory(String sessionId) {
        if (sessionId != null && !sessionId.isEmpty()) {
            conversationHistory.remove(sessionId);
            logger.info("已清除会话历史: " + sessionId);
        }
    }
}