package academia.rutaflow.reactor;

import java.util.concurrent.CopyOnWriteArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

class BackpressureDemandTest {
    @Test
    void stepVerifierSinParametroInicialSolicitaDemandaIlimitada() {
        List<Long> upstreamRequests = new CopyOnWriteArrayList<>();
        Flux<Integer> source = Flux.range(1, 3).doOnRequest(upstreamRequests::add);

        StepVerifier.create(source).expectNextCount(3).verifyComplete();

        assertThat(upstreamRequests).containsExactly(Long.MAX_VALUE);
    }

    @Test
    void emiteTresYDespuesSieteSoloCuandoElSuscriptorLosSolicita() {
        List<Long> upstreamRequests = new CopyOnWriteArrayList<>();
        List<Integer> received = new CopyOnWriteArrayList<>();
        Flux<Integer> source = Flux.range(1, 10)
            .doOnRequest(upstreamRequests::add)
            .doOnNext(received::add);

        StepVerifier.create(source, 0)
            .expectSubscription()
            .then(() -> assertThat(received).isEmpty())
            .thenRequest(3)
            .expectNext(1, 2, 3)
            .then(() -> assertThat(received).containsExactly(1, 2, 3))
            .thenRequest(7)
            .expectNext(4, 5, 6, 7, 8, 9, 10)
            .verifyComplete();

        assertThat(upstreamRequests).containsExactly(3L, 7L);
    }

    @Test
    void limitRateAgrupaLoQueSolicitaAlOrigen() {
        List<Long> upstreamRequests = new CopyOnWriteArrayList<>();
        Flux<Integer> source = Flux.range(1, 10)
            .doOnRequest(upstreamRequests::add)
            .limitRate(4, 0);

        StepVerifier.create(source, 0)
            .thenRequest(3)
            .expectNext(1, 2, 3)
            .thenRequest(1)
            .expectNext(4)
            .thenRequest(4)
            .expectNext(5, 6, 7, 8)
            .thenRequest(2)
            .expectNext(9, 10)
            .verifyComplete();

        assertThat(upstreamRequests).containsExactly(4L, 4L, 4L);
    }
}
