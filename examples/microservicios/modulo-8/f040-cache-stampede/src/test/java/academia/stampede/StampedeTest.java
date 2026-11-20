package academia.stampede;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.function.LongFunction;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;

/** Necesita el Redis del docker-compose.yml en localhost:6379. 50 hilos virtuales piden la misma clave fría. */
@SpringBootTest
class StampedeTest {

    static final int HILOS = 50;

    @Autowired CatalogoServicio catalogo;
    @Autowired BaseLenta base;
    @Autowired StringRedisTemplate redis;

    @BeforeEach
    void limpiar() {
        redis.delete(List.of("catalogo::1", "catalogo::2", "lock:catalogo::2"));
        base.consultas.set(0);
    }

    private List<String> enEstampida(LongFunction<String> peticion, long id) throws Exception {
        var salida = new CountDownLatch(1);
        List<Future<String>> futuros = new ArrayList<>();
        try (var hilos = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < HILOS; i++) {
                futuros.add(hilos.submit(() -> {
                    salida.await();                         // todos esperan el disparo de salida
                    return peticion.apply(id);
                }));
            }
            salida.countDown();
        }
        List<String> respuestas = new ArrayList<>();
        for (Future<String> f : futuros) {
            respuestas.add(f.get());
        }
        return respuestas;
    }

    @Test
    void sinProteccionCasiTodasLasPeticionesVanALaBase() throws Exception {
        var respuestas = enEstampida(catalogo::sinProteccion, 1);
        System.out.println("SIN protección: " + base.consultas.get() + " consultas a la base");
        assertThat(respuestas).hasSize(HILOS).containsOnly("producto-1");
        assertThat(base.consultas.get()).isGreaterThan(HILOS / 2);
    }

    @Test
    void conCandadoSoloUnaPeticionVaALaBase() throws Exception {
        var respuestas = enEstampida(catalogo::conCandado, 2);
        System.out.println("CON candado: " + base.consultas.get() + " consulta a la base");
        assertThat(respuestas).hasSize(HILOS).containsOnly("producto-2");
        assertThat(base.consultas.get()).isEqualTo(1);
    }

    @RepeatedTest(20)
    void elJitterDejaElTtlEntreEl90YEl110PorCiento() {
        Duration ttl = CargadorConCandado.conJitter(Duration.ofSeconds(100));
        assertThat(ttl.toMillis()).isBetween(90_000L, 110_000L);
    }
}
