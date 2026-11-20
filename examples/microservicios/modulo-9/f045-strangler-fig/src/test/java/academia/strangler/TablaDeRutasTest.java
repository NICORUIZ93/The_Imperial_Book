package academia.strangler;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;
import org.junit.jupiter.api.Test;

class TablaDeRutasTest {

    private final TablaDeRutas tabla = new TablaDeRutas(List.of("/cotizaciones->nuevo"));

    @Test
    void laRutaMigradaVaAlServicioNuevo() {
        assertEquals("nuevo", tabla.destinoPara("/cotizaciones"));
        assertEquals("nuevo", tabla.destinoPara("/cotizaciones/7"));
    }

    @Test
    void loQueNoSeMigroSigueEnElMonolito() {
        assertEquals("monolito", tabla.destinoPara("/clientes/1"));
    }

    @Test
    void coincidePorSegmentosNoPorTexto() {
        assertEquals("monolito", tabla.destinoPara("/cotizaciones-pdf/7"));
    }

    @Test
    void ganaElPrefijoMasLargoParaDevolverUnaSubrutaAlMonolito() {
        var t = new TablaDeRutas(List.of("/cotizaciones->nuevo", "/cotizaciones/masivas->monolito"));
        assertEquals("monolito", t.destinoPara("/cotizaciones/masivas/3"));
        assertEquals("nuevo", t.destinoPara("/cotizaciones/3"));
    }

    @Test
    void rechazaReglasMalEscritas() {
        assertThrows(IllegalArgumentException.class, () -> new TablaDeRutas(List.of("cotizaciones=nuevo")));
    }
}
