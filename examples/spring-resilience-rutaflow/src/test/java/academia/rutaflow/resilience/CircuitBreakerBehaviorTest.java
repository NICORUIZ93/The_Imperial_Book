package academia.rutaflow.resilience;

import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CircuitBreakerBehaviorTest {
    private CircuitBreaker newCircuitBreaker() {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
            .failureRateThreshold(50)
            .slidingWindowSize(4)
            .minimumNumberOfCalls(4)
            .permittedNumberOfCallsInHalfOpenState(2)
            .waitDurationInOpenState(Duration.ofMinutes(1))
            .build();
        return CircuitBreakerRegistry.of(config).circuitBreaker("servicioPedidos");
    }

    @Test
    void abreDespuesDeCuatroFallosYBloqueaLaQuintaLlamada() {
        CircuitBreaker breaker = newCircuitBreaker();
        AtomicInteger llamadasReales = new AtomicInteger();
        Supplier<String> llamada = CircuitBreaker.decorateSupplier(breaker, () -> {
            llamadasReales.incrementAndGet();
            throw new IllegalStateException("servicio-pedidos caído");
        });

        for (int i = 0; i < 4; i++) {
            assertThatThrownBy(llamada::get).isInstanceOf(IllegalStateException.class);
        }

        assertThat(breaker.getState()).isEqualTo(CircuitBreaker.State.OPEN);
        assertThatThrownBy(llamada::get).isInstanceOf(CallNotPermittedException.class);
        assertThat(llamadasReales).hasValue(4);
    }

    @Test
    void vuelveACerradoCuandoLasDosLlamadasDePruebaTienenExito() {
        CircuitBreaker breaker = newCircuitBreaker();
        Supplier<String> falla = CircuitBreaker.decorateSupplier(breaker, () -> {
            throw new IllegalStateException("servicio-pedidos caído");
        });
        for (int i = 0; i < 4; i++) {
            assertThatThrownBy(falla::get).isInstanceOf(IllegalStateException.class);
        }
        assertThat(breaker.getState()).isEqualTo(CircuitBreaker.State.OPEN);

        breaker.transitionToHalfOpenState();
        Supplier<String> recuperada = CircuitBreaker.decorateSupplier(breaker, () -> "pedido-p-17");
        assertThat(recuperada.get()).isEqualTo("pedido-p-17");
        assertThat(breaker.getState()).isEqualTo(CircuitBreaker.State.HALF_OPEN);
        assertThat(recuperada.get()).isEqualTo("pedido-p-17");
        assertThat(breaker.getState()).isEqualTo(CircuitBreaker.State.CLOSED);
    }
}
