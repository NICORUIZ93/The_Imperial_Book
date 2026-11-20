package academia.jpa;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.util.List;
import org.hibernate.LazyInitializationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

/** Requiere el PostgreSQL del módulo: docker compose up -d --wait (desde examples/microservicios/modulo-6). */
@SpringBootTest(properties = "spring.main.web-application-type=none")
class PedidoJpaTest {

    @Autowired ServicioPedidos servicio;
    @Autowired PedidoRepository pedidos;

    private final List<LineaDto> lineas = List.of(
        new LineaDto("CAF-1", 2, new BigDecimal("32000")),
        new LineaDto("TAZ-3", 1, new BigDecimal("58000")));

    @BeforeEach
    void limpiar() { pedidos.deleteAll(); }

    @Test
    void guardaElPedidoConSusLineasEnCascada() {
        Long id = servicio.crear("ana", lineas);
        assertThat(servicio.total(id)).isEqualByComparingTo("122000");
        assertThat(pedidos.findConLineasById(id).orElseThrow().getLineas()).hasSize(2);
    }

    @Test
    void unaLineaInvalidaDeshaceTodaLaTransaccion() {
        assertThatThrownBy(() -> servicio.crear("beto", List.of(
                new LineaDto("CAF-1", 1, new BigDecimal("32000")),
                new LineaDto("TAZ-3", 0, new BigDecimal("58000")))))
            .isInstanceOf(IllegalArgumentException.class);
        assertThat(pedidos.findByClienteOrderByIdAsc("beto")).isEmpty();   // ni el pedido quedó
    }

    @Test
    void dirtyCheckingGuardaElCambioSinLlamarASave() {
        Long id = servicio.crear("ana", lineas);
        servicio.confirmar(id);
        assertThat(pedidos.findById(id).orElseThrow().getEstado()).isEqualTo(EstadoPedido.CONFIRMADO);
    }

    @Test
    void fueraDeLaTransaccionLaColeccionPerezosaNoSePuedeLeer() {
        Long id = servicio.crear("ana", lineas);
        Pedido sinLineas = pedidos.findById(id).orElseThrow();   // la sesión se cerró al volver
        assertThatThrownBy(() -> sinLineas.getLineas().size())
            .isInstanceOf(LazyInitializationException.class);
    }
}
