package com.example.springaichat.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * ChatClient配置类
 * 配置ChatClient以支持UTF-8编码，解决中文乱码问题
 */
@Configuration
public class ChatClientConfig {

    @Autowired
    private OpenAiChatModel chatModel;

    /**
     * 配置支持UTF-8编码的ChatClient
     * @return 配置好的ChatClient
     */
    @Bean
    @Primary
    public ChatClient chatClient() {
        // 使用基础配置创建ChatClient
        return ChatClient.builder(chatModel).build();
    }
}