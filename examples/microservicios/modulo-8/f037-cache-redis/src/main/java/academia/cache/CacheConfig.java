package academia.cache;

import java.time.Duration;

import org.springframework.boot.cache.autoconfigure.RedisCacheManagerBuilderCustomizer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheWriter;
import org.springframework.data.redis.connection.RedisConnectionFactory;

/**
 * @EnableCaching activa el proxy que intercepta @Cacheable/@CacheEvict.
 * Va en una clase de configuración (no en la de main), como recomienda la guía de Spring Boot.
 */
@Configuration(proxyBeanMethods = false)
@EnableCaching
class CacheConfig {

    @Bean
    RedisCacheManagerBuilderCustomizer configuracionDeCaches(RedisConnectionFactory redis) {
        return builder -> builder
                // Spring Data Redis 4 con Lettuce escribe en la caché (put, evict, clear) de forma ASÍNCRONA
                // por defecto: justo después de @CacheEvict la clave puede seguir ahí. immediateWrites()
                // hace que cada escritura termine antes de que el método devuelva el control.
                .cacheWriter(RedisCacheWriter.create(redis, writer -> writer.immediateWrites()))
                // TTL por caché: "ofertas" cambia a diario en la vida real; aquí 2 s para verlo expirar en el test.
                .withCacheConfiguration("ofertas",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofSeconds(2)));
    }
}
