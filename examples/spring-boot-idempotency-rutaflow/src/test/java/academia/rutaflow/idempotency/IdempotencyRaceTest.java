package academia.rutaflow.idempotency;

import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
@SpringBootTest
class IdempotencyRaceTest {
    @Container
    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:16-alpine");

    @DynamicPropertySource
    static void postgresProperties(DynamicPropertyRegistry properties) {
        properties.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        properties.add("spring.datasource.username", POSTGRES::getUsername);
        properties.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @Autowired
    IdempotencyService service;

    @Test
    void dosLlamadasSimultaneasConLaMismaClaveSoloRegistranUna() throws Exception {
        String key = "pedido-rf-001";
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);

        try (var pool = Executors.newFixedThreadPool(2)) {
            var attempts = List.of(
                pool.submit(() -> attempt(key, ready, start)),
                pool.submit(() -> attempt(key, ready, start)));

            ready.await();
            start.countDown();

            boolean first = attempts.get(0).get();
            boolean second = attempts.get(1).get();
            assertThat(first ^ second).isTrue();
            assertThat(service.count(key)).isEqualTo(1);
        }
    }

    @Test
    void reintentoSecuencialConLaMismaClaveNoCreaOtraFila() {
        String key = "pedido-rf-retry-002";

        assertThat(service.register(key)).isTrue();
        assertThat(service.register(key)).isFalse();
        assertThat(service.count(key)).isEqualTo(1);
    }

    private boolean attempt(String key, CountDownLatch ready, CountDownLatch start) throws InterruptedException {
        ready.countDown();
        start.await();
        return service.register(key);
    }
}
