package academia.resiliencia;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.github.resilience4j.bulkhead.BulkheadFullException;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.ratelimiter.RequestNotPermitted;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeoutException;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@SpringBootTest
class PatronesTest {

    static InventarioFalso inventario;

    @DynamicPropertySource
    static void url(DynamicPropertyRegistry r) throws Exception {
        inventario = new InventarioFalso();
        r.add("inventario.url", inventario::url);
    }

    @AfterAll
    static void apagar() { inventario.close(); }

    @Autowired InventarioCliente cliente;
    @Autowired CircuitBreakerRegistry circuitos;

    @BeforeEach
    void limpiar() {
        inventario.reiniciar();
        circuitos.circuitBreaker("inventario").reset();
    }

    @Test
    void retryReintentaDosVecesYLaTerceraFunciona() {
        inventario.fallarProximas.set(2);
        assertThat(cliente.consultar("7")).isEqualTo(new Stock("7", 12, null));
        assertThat(inventario.atendidas).hasValue(3);
    }

    @Test
    void circuitBreakerSeAbreYDejaDeLlamarAlInventario() {
        inventario.siempreFalla = true;
        cliente.consultar("7");                       // 3 intentos fallidos (3 de 4 en la ventana)
        Stock segunda = cliente.consultar("7");       // 4.º fallo => OPEN; el 5.º intento es rechazado
        assertThat(circuitos.circuitBreaker("inventario").getState().name()).isEqualTo("OPEN");
        assertThat(segunda.fuente()).isEqualTo("fallback: CallNotPermittedException");
        int antes = inventario.atendidas.get();
        Stock tercera = cliente.consultar("7");
        assertThat(tercera.stock()).isNull();
        assertThat(inventario.atendidas).as("con el circuito abierto no sale ninguna llamada").hasValue(antes);
    }

    @Test
    void rateLimiterDejaPasarTresPorSegundo() {
        List<String> resultados = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            try {
                cliente.consultarConCuota("7");
                resultados.add("OK");
            } catch (RequestNotPermitted e) {
                resultados.add("RequestNotPermitted");
            }
        }
        assertThat(resultados).containsExactly("OK", "OK", "OK", "RequestNotPermitted", "RequestNotPermitted");
    }

    @Test
    void bulkheadRechazaLaTerceraLlamadaSimultanea() throws Exception {
        inventario.latenciaMs = 500;
        var hilos = Executors.newVirtualThreadPerTaskExecutor();
        List<CompletableFuture<String>> llamadas = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            llamadas.add(CompletableFuture.supplyAsync(() -> {
                try {
                    cliente.consultarAislado("7");
                    return "OK";
                } catch (BulkheadFullException e) {
                    return "BulkheadFull";
                }
            }, hilos));
            Thread.sleep(30);
        }
        assertThat(llamadas.stream().map(CompletableFuture::join))
            .containsExactly("OK", "OK", "BulkheadFull", "BulkheadFull");
    }

    @Test
    void timeLimiterCortaALos500ms() {
        inventario.latenciaMs = 2000;
        long t0 = System.nanoTime();
        assertThatThrownBy(() -> cliente.consultarConLimite("7").get())
            .isInstanceOf(ExecutionException.class).hasCauseInstanceOf(TimeoutException.class);
        assertThat((System.nanoTime() - t0) / 1_000_000).isBetween(450L, 900L);
    }
}
