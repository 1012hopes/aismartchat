package com.example.springaichat.controller;

import com.example.springaichat.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import reactor.core.publisher.Flux;
import java.nio.charset.StandardCharsets;

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
     * 支持对话上下文和流式输出
     * 
     * @param request 包含用户消息的聊天请求
     * @return 流式AI模型响应
     */
    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE + ";charset=UTF-8")
    public Flux<String> chat(@RequestBody ChatRequest request) {
        // 调用服务层处理聊天逻辑
        return chatService.chat(request.getSessionId(), request.getMessage());
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