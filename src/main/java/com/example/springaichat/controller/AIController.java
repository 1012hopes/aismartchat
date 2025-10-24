package com.example.springaichat.controller;

import com.example.springaichat.entity.ChatMessage;
import com.example.springaichat.entity.ChatSession;
import com.example.springaichat.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * AI控制器 - AI聊天交互的REST API
 * 
 * 该控制器提供与AI模型交互的端点，
 * 使用Spring AI的ChatClient集成。
 * 支持对话上下文管理。
 */
@RestController
@RequestMapping("/ai")
@CrossOrigin(origins = "*") // 启用所有来源的CORS支持
public class AIController {

    private final ChatService chatService;

    @Autowired
    public AIController(ChatService chatService) {
        this.chatService = chatService;
    }
    
    /**
     * 聊天端点，将消息发送给AI模型并返回流式响应
     * 使用 SseEmitter 实现标准 Server-Sent Events
     * 
     * @param request 包含用户消息的聊天请求
     * @return SseEmitter 流式响应对象
     */
    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE + ";charset=UTF-8")
    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter chat(@RequestBody ChatRequest request) {
        // 调用服务层处理聊天逻辑，返回SseEmitter
        return chatService.chatStream(request.getSessionId(), request.getMessage());
    }
    
    /**
     * 清除指定会话的历史记录
     * 
     * @param sessionId 会话ID
     * @return 操作结果
     */
    @DeleteMapping("/history/{sessionId}")
    public ResponseEntity<String> clearHistory(@PathVariable String sessionId) {
        chatService.clearHistory(sessionId);
        return ResponseEntity.ok().body("会话历史已清除");
    }
    
    /**
     * 获取所有会话列表
     * 
     * @return 会话列表（不包含消息内容）
     */
    @GetMapping("/sessions")
    public ResponseEntity<List<Map<String, Object>>> getAllSessions() {
        List<ChatSession> sessions = chatService.getAllSessions();
        List<Map<String, Object>> result = sessions.stream()
            .map(session -> {
                Map<String, Object> sessionData = new HashMap<>();
                sessionData.put("id", session.getId());
                sessionData.put("name", session.getName());
                sessionData.put("createdAt", session.getCreatedAt().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());
                sessionData.put("updatedAt", session.getUpdatedAt().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());
                
                // 获取消息列表用于生成预览
                List<ChatMessage> messages = chatService.getSessionMessages(session.getId());
                sessionData.put("messageCount", messages.size());
                
                // 获取最后一条用户消息作为预览
                String preview = messages.stream()
                    .filter(m -> "user".equals(m.getRole()))
                    .reduce((first, second) -> second)
                    .map(m -> m.getContent().length() > 30 ? m.getContent().substring(0, 30) + "..." : m.getContent())
                    .orElse("暂无消息");
                sessionData.put("preview", preview);
                
                return sessionData;
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * 获取指定会话的所有消息
     * 
     * @param sessionId 会话ID
     * @return 消息列表
     */
    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<List<Map<String, Object>>> getSessionMessages(@PathVariable String sessionId) {
        List<ChatMessage> messages = chatService.getSessionMessages(sessionId);
        List<Map<String, Object>> result = messages.stream()
            .map(message -> {
                Map<String, Object> messageData = new HashMap<>();
                messageData.put("id", message.getId());
                messageData.put("role", message.getRole());
                messageData.put("content", message.getContent());
                messageData.put("timestamp", message.getTimestamp().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());
                messageData.put("status", message.getStatus());
                return messageData;
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * 创建新会话
     * 
     * @param request 会话创建请求
     * @return 创建的会话信息
     */
    @PostMapping("/sessions")
    public ResponseEntity<Map<String, Object>> createSession(@RequestBody SessionRequest request) {
        ChatSession session = chatService.createSession(request.getSessionId(), request.getName());
        
        Map<String, Object> sessionData = new HashMap<>();
        sessionData.put("id", session.getId());
        sessionData.put("name", session.getName());
        sessionData.put("createdAt", session.getCreatedAt().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());
        sessionData.put("updatedAt", session.getUpdatedAt().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());
        
        return ResponseEntity.ok(sessionData);
    }
    
    /**
     * 删除会话
     * 
     * @param sessionId 会话ID
     * @return 操作结果
     */
    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<String> deleteSession(@PathVariable String sessionId) {
        chatService.deleteSession(sessionId);
        return ResponseEntity.ok("会话已删除");
    }
    
    /**
     * 重命名会话
     * 
     * @param sessionId 会话ID
     * @param request 重命名请求
     * @return 操作结果
     */
    @PutMapping("/sessions/{sessionId}/rename")
    public ResponseEntity<String> renameSession(@PathVariable String sessionId, @RequestBody RenameRequest request) {
        chatService.renameSession(sessionId, request.getName());
        return ResponseEntity.ok("会话已重命名");
    }

    /**
     * 聊天请求的数据传输对象
     */
    public static class ChatRequest {
        private String message;
        private String sessionId; // 可选的会话ID

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
        
        public String getSessionId() {
            return sessionId;
        }
        
        public void setSessionId(String sessionId) {
            this.sessionId = sessionId;
        }
    }
    
    /**
     * 会话创建请求的数据传输对象
     */
    public static class SessionRequest {
        private String sessionId;
        private String name;
        
        public String getSessionId() {
            return sessionId;
        }
        
        public void setSessionId(String sessionId) {
            this.sessionId = sessionId;
        }
        
        public String getName() {
            return name;
        }
        
        public void setName(String name) {
            this.name = name;
        }
    }
    
    /**
     * 重命名请求的数据传输对象
     */
    public static class RenameRequest {
        private String name;
        
        public String getName() {
            return name;
        }
        
        public void setName(String name) {
            this.name = name;
        }
    }


    
    /**
     * 健康检查端点
     * 确保响应头包含UTF-8编码
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(new MediaType("text", "plain", StandardCharsets.UTF_8));
        return ResponseEntity.ok()
                .headers(headers)
                .body("AI服务运行正常 - UTF-8编码测试：你好，世界！Hello World! 🚀");
    }

}