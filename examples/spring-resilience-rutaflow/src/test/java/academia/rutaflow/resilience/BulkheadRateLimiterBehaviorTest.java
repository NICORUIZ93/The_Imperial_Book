package academia.rutaflow.resilience;

import io.github.resilience4j.bulkhead.Bulkhead;
import io.github.resilience4j.bulkhead.BulkheadConfig;
import io.github.resilience4j.bulkhead.BulkheadFullException;
import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterConfig;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BulkheadRateLimiterBehaviorTest {

    @Test
    void semaphoreBulkheadRechazaUnaTerceraLlamadaMientrasDosSiguenDentro() throws Exception {
        Bulkhead bulkhead = Bulkhead.of("tarifas", BulkheadConfig.custom()
            .maxConcurrentCalls(2)
            .maxWaitDuration(Duration.ZERO)
            .build());
        CountDownLatch dosLlamadasDentro = new CountDownLatch(2);
        CountDownLatch permitirSalida = new CountDownLatch(1);
        ExecutorService pool = Executors.newFixedThreadPool(2);

        try {
            Runnable llamadaLenta = Bulkhead.decorateRunnable(bulkhead, () -> {
                dosLlamadasDentro.countDown();
                try {
                    permitirSalida.await();
                } catch (InterruptedException interrupted) {
                    Thread.currentThread().interrupt();
                }
            });
            Future<?> primera = pool.submit(llamadaLenta);
            Future<?> segunda = pool.submit(llamadaLenta);

            dosLlamadasDentro.await();
            assertThat(bulkhead.getMetrics().getAvailableConcurrentCalls()).isZero();
            assertThatThrownBy(() -> Bulkhead.decorateRunnable(bulkhead, () -> {}).run())
                .isInstanceOf(BulkheadFullException.class);

            permitirSalida.countDown();
            primera.get();
            segunda.get();
            assertThat(bulkhead.getMetrics().getAvailableConcurrentCalls()).isEqualTo(2);
        } finally {
            permitirSalida.countDown();
            pool.shutdownNow();
        }
    }

    @Test
    void rateLimiterEntregaDosPermisosYRechazaElTerceroEnElMismoPeriodo() {
        RateLimiter limiter = RateLimiter.of("tarifas", RateLimiterConfig.custom()
            .limitForPeriod(2)
            .limitRefreshPeriod(Duration.ofHours(1))
            .timeoutDuration(Duration.ZERO)
            .build());

        assertThat(limiter.acquirePermission()).isTrue();
        assertThat(limiter.acquirePermission()).isTrue();
        assertThat(limiter.acquirePermission()).isFalse();
    }
}
