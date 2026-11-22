package com.academia.profiles;
import org.springframework.boot.context.properties.ConfigurationProperties;
@ConfigurationProperties(prefix = "app")
public record AppProperties(String message, boolean featureX) {}
