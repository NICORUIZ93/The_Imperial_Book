package academia.rutaflow.decision;

import java.time.Duration;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RestController
@RequestMapping
public class DeliveryController {
    private final DeliveryRepository repository;

    public DeliveryController(DeliveryRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/deliveries/{trackingCode}")
    public Mono<Delivery> findOne(@PathVariable String trackingCode) {
        return repository.findByTrackingCode(trackingCode);
    }

    @GetMapping("/deliveries")
    public Flux<Delivery> findAll() {
        return repository.findAll();
    }

    @GetMapping("/demo/reactive")
    public Mono<String> reactive() {
        return Mono.just("respuesta reactiva");
    }

    @GetMapping("/demo/block")
    public Mono<String> blockOnEventLoop() {
        Long tick = Mono.delay(Duration.ofMillis(10)).block();
        return Mono.just("tick=" + tick);
    }

    @GetMapping("/demo/legacy")
    public Mono<String> isolateBlockingCall() {
        return Mono.fromCallable(() -> {
                    try {
                        Thread.sleep(25);
                    } catch (InterruptedException interrupted) {
                        Thread.currentThread().interrupt();
                        throw new IllegalStateException("operación cancelada", interrupted);
                    }
                    return Thread.currentThread().getName();
                })
                .subscribeOn(Schedulers.boundedElastic());
    }
}
