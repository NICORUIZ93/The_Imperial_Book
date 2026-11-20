package academia.patrones;

import org.springframework.boot.cache.autoconfigure.RedisCacheManagerBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheWriter;
import org.springframework.data.redis.connection.RedisConnectionFactory;

/**
 * Write-Through promete que, al volver de cambiarPrecio, la caché YA tiene el valor nuevo.
 * Con Lettuce, Spring Data Redis 4 hace put/evict/clear asíncronos por defecto; immediateWrites() lo garantiza.
 */
@Configuration(proxyBeanMethods = false)
class CacheConfig {

    @Bean
    RedisCacheManagerBuilderCustomizer escriturasInmediatas(RedisConnectionFactory redis) {
        return builder -> builder.cacheWriter(RedisCacheWriter.create(redis, writer -> writer.immediateWrites()));
    }
}
