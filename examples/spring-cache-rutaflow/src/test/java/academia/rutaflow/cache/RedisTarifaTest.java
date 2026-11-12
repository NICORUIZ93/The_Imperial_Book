package academia.rutaflow.cache;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.cache.RedisCacheWriter;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@EnabledIfSystemProperty(named = "redis.integration", matches = "true")
@ActiveProfiles("redis")
@SpringBootTest(properties = "spring.data.redis.timeout=2s")
class RedisTarifaTest {
    private static final String PREFIJO = "rutaflow-lab-" + UUID.randomUUID() + ":";

    @DynamicPropertySource
    static void aislarClaves(DynamicPropertyRegistry properties) {
        properties.add("spring.cache.redis.key-prefix", () -> PREFIJO);
    }

    @Autowired TarifaService tarifas;
    @Autowired CacheManager cacheManager;
    @Autowired RedisConnectionFactory connectionFactory;
    @Autowired StringRedisTemplate redis;

    @Test
    void dosGestoresCompartenValorTtlEInvalidacion() {
        assertThat(cacheManager).isInstanceOf(RedisCacheManager.class);
        RedisCacheManager segundo = RedisCacheManager.builder(RedisCacheWriter.create(connectionFactory,
                        config -> config.immediateWrites()))
                .cacheDefaults(RedisCacheConfiguration.defaultCacheConfig()
                        .prefixCacheNameWith(PREFIJO).entryTtl(Duration.ofMinutes(5)))
                .build();
        segundo.afterPropertiesSet();
        Cache compartida = segundo.getCache("tarifas");

        try {
            tarifas.buscar("NORTE");
            assertThat(compartida.get("NORTE", Tarifa.class)).isEqualTo(new Tarifa("NORTE", 1200));
            assertThat(redis.getExpire(PREFIJO + "tarifas::NORTE", TimeUnit.SECONDS))
                    .isBetween(1L, 300L);

            tarifas.actualizar(new Tarifa("NORTE", 1350));
            assertThat(compartida.get("NORTE")).isNull();

            tarifas.buscar("NORTE");
            assertThat(compartida.get("NORTE", Tarifa.class)).isEqualTo(new Tarifa("NORTE", 1350));
        } finally {
            compartida.evict("NORTE");
        }
    }
}
