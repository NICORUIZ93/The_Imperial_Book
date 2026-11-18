package academia.rutaflow.reactor;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

class MonoFluxTest {
    private EntregaFlows flows;

    @BeforeEach
    void setUp() {
        flows = new EntregaFlows();
    }

    @Test
    void monoEntregaCeroOUnaGuia() {
        StepVerifier.create(flows.buscar("RF-1200"))
                .expectNext("Guía RF-1200")
                .verifyComplete();

        StepVerifier.create(flows.buscar("1200"))
                .verifyComplete();
    }

    @Test
    void errorEsUnaSenalDistintaDeCompletarVacio() {
        StepVerifier.create(Mono.<String>error(new IllegalArgumentException("código inválido")))
                .expectErrorMessage("código inválido")
                .verify();
    }

    @Test
    void deferEjecutaElCalculoUnaVezPorSuscripcion() {
        AtomicInteger contador = new AtomicInteger();
        Mono<Integer> resultado = flows.siguienteNumero(contador);

        assertThat(contador).hasValue(0);
        StepVerifier.create(resultado).expectNext(1).verifyComplete();
        StepVerifier.create(resultado).expectNext(2).verifyComplete();
        assertThat(contador).hasValue(2);
    }

    @Test
    void fluxRespetaLaDemandaYEmiteEnOrden() {
        Flux<String> codigos = flows.pendientes();

        StepVerifier.create(codigos, 0)
                .thenRequest(1)
                .expectNext("RF-1200")
                .expectNoEvent(Duration.ofMillis(20))
                .thenRequest(1)
                .expectNext("RF-1201")
                .thenRequest(1)
                .expectNext("RF-1202")
                .thenRequest(1)
                .verifyComplete();
    }
}
