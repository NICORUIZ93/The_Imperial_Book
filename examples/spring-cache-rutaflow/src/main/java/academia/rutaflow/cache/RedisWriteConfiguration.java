package academia.rutaflow.cache;

import org.springframework.boot.cache.autoconfigure.RedisCacheManagerBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.cache.RedisCacheWriter;
import org.springframework.data.redis.connection.RedisConnectionFactory;

@Configuration
@Profile("redis")
public class RedisWriteConfiguration {
    @Bean
    RedisCacheManagerBuilderCustomizer escriturasVisiblesAlRetornar(
            RedisConnectionFactory connectionFactory) {
        // La práctica lee desde otro gestor inmediatamente después de escribir.
        // Lettuce permite escrituras diferidas por defecto en Spring Data Redis 4.
        return builder -> builder.cacheWriter(RedisCacheWriter.create(
                connectionFactory, config -> config.immediateWrites()));
    }
}
