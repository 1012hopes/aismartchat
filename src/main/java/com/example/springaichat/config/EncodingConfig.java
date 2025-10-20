package com.example.springaichat.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.filter.CharacterEncodingFilter;

import jakarta.servlet.Filter;
import java.net.InetSocketAddress;
import java.net.Proxy;

/**
 * 字符编码配置类
 * 确保所有请求和响应都使用UTF-8编码
 * 注意：避免与Spring Boot默认的characterEncodingFilter冲突
 */
@Configuration
public class EncodingConfig {

    /**
     * 配置自定义字符编码过滤器
     * 使用不同的bean名称避免冲突
     */
    @Bean
    public FilterRegistrationBean<Filter> customCharacterEncodingFilter() {
        CharacterEncodingFilter filter = new CharacterEncodingFilter();
        filter.setEncoding("UTF-8");
        filter.setForceEncoding(true);
        filter.setForceRequestEncoding(true);
        filter.setForceResponseEncoding(true);

        FilterRegistrationBean<Filter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(filter);
        registrationBean.addUrlPatterns("/*");
        registrationBean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        registrationBean.setName("customCharacterEncodingFilter");
        
        return registrationBean;
    }
    
    /**
     * 配置HTTP代理（如果需要）
     * 如果不需要代理，可以返回null
     */
    @Bean
    public Proxy httpProxy() {
        // 如果需要使用代理，取消下面的注释并配置正确的代理地址
        // String proxyHost = System.getProperty("http.proxyHost");
        // String proxyPort = System.getProperty("http.proxyPort");
        // 
        // if (proxyHost != null && proxyPort != null) {
        //     return new Proxy(Proxy.Type.HTTP, new InetSocketAddress(proxyHost, Integer.parseInt(proxyPort)));
        // }
        
        return Proxy.NO_PROXY;
    }
}