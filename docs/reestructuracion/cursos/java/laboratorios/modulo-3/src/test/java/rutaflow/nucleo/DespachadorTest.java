// M3 · laboratorio · el despacho probado: cada prueba comprueba una decision de control de flujo.
package rutaflow.nucleo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class DespachadorTest {

    private static final String[] TANDA = {
        "RF-001|1250|NORTE",
        "RF-002|3400|OCCIDENTE",
        "RF-003|sin peso|CARIBE",
        "RF-004|890|SUR",
    };

    @Test
    void cadaZonaTieneSuTarifaBase() {
        assertEquals(9000, Despachador.tarifaBase(Zona.NORTE));
        assertEquals(12400, Despachador.tarifaBase(Zona.OCCIDENTE));
        assertEquals(10200, Despachador.tarifaBase(Zona.CENTRO));
        assertEquals(11500, Despachador.tarifaBase(Zona.CARIBE));
        assertEquals(11500, Despachador.tarifaBase(Zona.SUR));
    }

    @Test
    void occidentePagaElRecargoDeMontana() {
        // El caso OCCIDENTE es el unico con bloque: sin el yield, la expresion no tendria valor.
        assertEquals(9000 + 3400, Despachador.tarifaBase(Zona.OCCIDENTE));
    }

    @Test
    void elPrimerCorteDePesoEsLosMilGramos() {
        assertEquals(9000 * 10 / 10, Despachador.tarifa(1000));
        assertEquals(13500, Despachador.tarifa(1001));
    }

    @Test
    void elSegundoCorteEsLosCincoKilos() {
        assertEquals(13500, Despachador.tarifa(5000));
        assertEquals(19000, Despachador.tarifa(5001));
    }

    @Test
    void elVolumenMultiplicaALdiezAVeinteyOcho() {
        assertEquals(9000, Despachador.tarifa(800, 9));     // sin descuento
        assertEquals(8100, Despachador.tarifa(800, 10));    // nueve decimas
        assertEquals(7200, Despachador.tarifa(800, 50));    // ocho decimas
    }

    @Test
    void unaGuiaFueraDeTopeCortaLaTanda() {
        // RF-002 pesa 3400: con tope 2000 el break TANDA abandona los bucles y no cuenta RF-004.
        assertEquals(1, Despachador.guiasAceptadas(TANDA, 2000));
        // Con tope 4000 la tanda entra toda, salvo la guia sin peso.
        assertEquals(3, Despachador.guiasAceptadas(TANDA, 4000));
    }

    @Test
    void laGuiaSinPesoNoCortaLaTanda() {
        assertEquals(3, Despachador.guiasAceptadas(TANDA, 10_000));
    }

    @Test
    void gramosDeDevuelveMenosUnoEnVezDeLanzar() {
        assertEquals(1250, Despachador.gramosDe("RF-001|1250|NORTE"));
        assertEquals(-1, Despachador.gramosDe("RF-003|sin peso|CARIBE"));
        assertEquals(-1, Despachador.gramosDe("RF-006"));
        assertEquals(-1, Despachador.gramosDe(""));
    }

    @Test
    void laSumaRecursivaIgnoraLasGuiasMalformadas() {
        assertEquals(1250 + 3400 + 890, Despachador.sumaGramos(TANDA));
    }

    @Test
    void varargsAceptaCeroUnaYMuchasGuias() {
        assertEquals(0, Despachador.sumaGramos());
        assertEquals(700, Despachador.sumaGramos("RF-005|700|NORTE"));
        assertEquals(1250 + 3400, Despachador.sumaGramos(TANDA[0], TANDA[1]));
    }

    @Test
    void laSobrecargaCortaDelegaNLaLarga() {
        assertEquals(Despachador.tarifa(3400, 1), Despachador.tarifa(3400));
    }

    @Test
    void todaZonaDelEnumTieneTarifaYLaNulaSeRechaza() {
        // El default del switch existe para eso: si manana anade una zona y no la tarifo, esto lo dice.
        assertEquals(5, Zona.values().length);
        for (Zona z : Zona.values()) {
            int tarifa = Despachador.tarifaBase(z);
            if (tarifa <= 0) throw new AssertionError("zona sin tarifa positiva: " + z);
        }
        // Medido: el default del switch no atrapa null; hace falta un «case null» escrito.
        assertThrows(IllegalArgumentException.class, () -> Despachador.tarifaBase(null));
    }
}
