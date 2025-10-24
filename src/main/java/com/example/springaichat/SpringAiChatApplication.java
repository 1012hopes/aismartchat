package com.example.springaichat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Spring AI聊天应用程序 - 主入口点
 * 
 * 该应用程序提供一个简单的AI聊天交互Web服务，
 * 使用Spring AI和OpenAI集成。
 */
@SpringBootApplication
public class SpringAiChatApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringAiChatApplication.class, args);
    }
}