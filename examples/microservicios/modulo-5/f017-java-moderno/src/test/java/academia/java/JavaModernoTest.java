package academia.java;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import academia.java.JavaModerno.Efectivo;
import academia.java.JavaModerno.Linea;
import academia.java.JavaModerno.Producto;
import academia.java.JavaModerno.Tarjeta;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class JavaModernoTest {

    private final List<Linea> lineas = JavaModerno.pedidoDeEjemplo();

    @Test
    void sumaElPedidoConStreams() {
        assertEquals(new BigDecimal("250000"), JavaModerno.total(lineas));
    }

    @Test
    void agrupaPorCategoriaEnOrdenAlfabetico() {
        Map<String, BigDecimal> porCategoria = JavaModerno.totalPorCategoria(lineas);
        assertEquals(List.of("libros", "papeleria", "tecnologia"), List.copyOf(porCategoria.keySet()));
        assertEquals(new BigDecimal("90000"), porCategoria.get("libros"));
    }

    @Test
    void ordenaLosCarosDeMayorAMenor() {
        assertEquals(List.of("TEC-3", "LIB-1"), JavaModerno.skusCaros(lineas, new BigDecimal("40000")));
    }

    @Test
    void optionalVacioCuandoNoExisteElSku() {
        assertTrue(JavaModerno.buscar(lineas, "XXX-0").isEmpty());
        assertEquals("tecnologia", JavaModerno.buscar(lineas, "TEC-3").orElseThrow().categoria());
    }

    @Test
    void patternMatchingDistingueCuotas() {
        assertEquals("Tarjeta *4242 a 3 cuotas", JavaModerno.describir(new Tarjeta("4242", 3)));
        assertEquals("Tarjeta *1111 de contado", JavaModerno.describir(new Tarjeta("1111", 1)));
        assertEquals("Efectivo contra entrega", JavaModerno.describir(new Efectivo()));
    }

    @Test
    void elRecordRechazaPreciosNegativos() {
        var error = assertThrows(IllegalArgumentException.class,
            () -> new Producto("MAL-1", "x", new BigDecimal("-1")));
        assertEquals("precio negativo: -1", error.getMessage());
    }
}
