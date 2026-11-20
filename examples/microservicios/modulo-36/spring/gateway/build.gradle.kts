// API Gateway con rate limiting en Redis (Spring Cloud Gateway 5.0.4 del tren 2025.1.4, Spring Boot 4.1.3).
plugins {
    java
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.spring.dependency.management)
}

group = "academia.microservicios"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

dependencyManagement {
    imports {
        mavenBom("org.springframework.cloud:spring-cloud-dependencies:${libs.versions.spring.cloud.get()}")
    }
}

dependencies {
    implementation(libs.spring.cloud.starter.gateway.server.webflux)
    // El RedisRateLimiter de Spring Cloud Gateway exige el starter reactivo de Redis.
    implementation(libs.spring.boot.starter.data.redis.reactive)
}
