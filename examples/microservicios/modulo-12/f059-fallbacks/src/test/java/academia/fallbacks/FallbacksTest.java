package academia.fallbacks;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@SpringBootTest
class FallbacksTest {

    static InventarioFalso inventario;

    @DynamicPropertySource
    static void url(DynamicPropertyRegistry r) throws Exception {
        inventario = new InventarioFalso();
        r.add("inventario.url", inventario::url);
    }

    @AfterAll
    static void apagar() { inventario.close(); }

    @Autowired InventarioServicio servicio;
    @Autowired CircuitBreakerRegistry circuitos;

    @BeforeEach
    void limpiar() {
        inventario.reiniciar();
        circuitos.circuitBreaker("inventario").reset();
    }

    @Test
    void conElInventarioCaidoDevuelveElUltimoValorBuenoMarcado() throws Exception {
        assertThat(servicio.consultar("7").fuente()).isEqualTo("inventario");
        Thread.sleep(200);
        inventario.siempreFalla = true;
        Stock s = servicio.consultar("7");
        assertThat(s.stock()).isEqualTo(12);
        assertThat(s.fuente()).isEqualTo("cache");
        assertThat(s.edadMs()).isGreaterThanOrEqualTo(200);
    }

    @Test
    void unProductoNuncaVistoQuedaComoDesconocido() {
        inventario.siempreFalla = true;
        assertThat(servicio.consultar("99")).isEqualTo(new Stock("99", null, "defecto", 0));
    }

    @Test
    void conElCircuitoAbiertoUsaElFallbackEspecifico() {
        servicio.consultar("7");                                   // llena la caché
        inventario.siempreFalla = true;
        for (int i = 0; i < 4; i++) servicio.consultar("7");      // 4 fallos => OPEN
        assertThat(servicio.consultar("7").fuente()).isEqualTo("cache (circuito abierto)");
    }

    @Test
    void reservarNoTieneFallbackYFallaRapido() {
        inventario.siempreFalla = true;
        long t0 = System.nanoTime();
        assertThatThrownBy(() -> servicio.reservar("7", 1)).isInstanceOf(RuntimeException.class);
        assertThat((System.nanoTime() - t0) / 1_000_000).isLessThan(500);
    }
}
