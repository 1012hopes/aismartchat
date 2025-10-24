package com.example.springaichat.repository;

import com.example.springaichat.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 聊天会话数据访问接口
 */
@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, String> {
    
    /**
     * 查找所有会话，按更新时间降序排列
     */
    List<ChatSession> findAllByOrderByUpdatedAtDesc();
}

