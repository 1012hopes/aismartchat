package com.example.springaichat.repository;

import com.example.springaichat.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 聊天消息数据访问接口
 */
@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {
    
    /**
     * 根据会话ID查询所有消息，按时间戳升序排列
     */
    List<ChatMessage> findBySessionIdOrderByTimestampAsc(String sessionId);
    
    /**
     * 删除指定会话的所有消息
     */
    void deleteBySessionId(String sessionId);
}

