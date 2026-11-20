package academia.cache;

import java.time.Duration;

import org.springframework.boot.cache.autoconfigure.RedisCacheManagerBuilderCustomizer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;

/**
 * @EnableCaching activa el proxy que intercepta @Cacheable/@CacheEvict.
 * Va en una clase de configuración (no en la de main), como recomienda la guía de Spring Boot.
 */
@Configuration(proxyBeanMethods = false)
@EnableCaching
class CacheConfig {

    /** TTL por caché: "ofertas" cambia a diario en la vida real; aquí 2 s para verlo expirar en el test. */
    @Bean
    RedisCacheManagerBuilderCustomizer ttlPorCache() {
        return builder -> builder.withCacheConfiguration("ofertas",
                RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofSeconds(2)));
    }
}
