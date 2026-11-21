// M4 · laboratorio · el manifiesto probado: las dos versiones tienen que dar los mismos numeros.
package rutaflow.nucleo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import org.junit.jupiter.api.Test;

class ManifiestoTest {

    private static final String[] TANDA = {
        "RF-001|1250|NORTE",
        "RF-002|3400|OCCIDENTE",
        "RF-003|sin peso|CARIBE",
        "RF-004|890|SUR",
        "RF-005|700|NORTE",
        "RF-006|2100|CENTRO",
    };

    @Test
    void losArreglosTienenLaLongitudDeLasGuias() {
        int[] gramos = Manifiesto.gramos(TANDA);
        assertEquals(6, gramos.length);
        assertEquals(1250, gramos[0]);
        assertEquals(-1, gramos[2]);                       // la malformada se queda como -1
    }

    @Test
    void laSumaIgnoraLasMalformadas() {
        assertEquals(8340L, Manifiesto.suma(Manifiesto.gramos(TANDA)));
        assertEquals(0L, Manifiesto.suma(new int[0]));
    }

    @Test
    void elMayorDeUnManifiestoVacioNoSeInventa() {
        assertEquals(3400, Manifiesto.mayor(Manifiesto.gramos(TANDA)));
        assertThrows(IllegalArgumentException.class, () -> Manifiesto.mayor(new int[0]));
    }

    @Test
    void ordenarYCortarDaLosMayoresAlTope() {
        int[] gramos = Manifiesto.gramos(TANDA);
        assertEquals("[1250, 2100, 3400]", java.util.Arrays.toString(Manifiesto.mayoresQue(gramos, 1000)));
        assertEquals("[]", java.util.Arrays.toString(Manifiesto.mayoresQue(gramos, 5000)));
    }

    @Test
    void contarConBusquedaCoincideConFiltrar() {
        int[] gramos = Manifiesto.gramos(TANDA);
        for (int tope : new int[] {0, 700, 899, 1000, 2100, 3400, 9999}) {
            assertEquals(Manifiesto.mayoresQue(gramos, tope).length, Manifiesto.sobreElTope(gramos, tope),
                    "tope " + tope);
        }
    }

    @Test
    void laListaYElArregloSumanLoMismo() {
        List<Integer> lista = Manifiesto.gramosLista(TANDA);
        assertEquals(5, lista.size());                     // la malformada no entra en la lista
        assertEquals(Manifiesto.suma(Manifiesto.gramos(TANDA)),
                lista.stream().mapToLong(Integer::intValue).sum());
        assertEquals(3400, java.util.Collections.max(lista).intValue());
    }

    @Test
    void losTotalesPorZonaAcumulan() {
        var totales = Manifiesto.totalesPorZona(TANDA);
        assertEquals(4, totales.size());                   // CARIBE se queda fuera: su guia esta malformada
        assertEquals(1950, totales.get("NORTE").intValue());   // 1250 + 700, la unica zona con dos guias
        assertEquals(3400, totales.get("OCCIDENTE").intValue());
        assertEquals(0, totales.getOrDefault("CARIBE", 0).intValue());
    }

    @Test
    void lasDosVersionesDelReporteCuadran() {
        int tope = 1000;
        int[] gramos = Manifiesto.gramos(TANDA);
        assertEquals(Manifiesto.sobreElTope(gramos, tope), Manifiesto.mayoresQueLista(TANDA, tope).size());
        assertTrue(Manifiesto.mayoresQueLista(TANDA, tope).equals(List.of(1250, 3400, 2100)));
        assertEquals("{CENTRO=2100, NORTE=1950, OCCIDENTE=3400, SUR=890}", Manifiesto.totalesOrdenados(TANDA));
    }

    @Test
    void leerLaZonaNoRequiereTresPartes() {
        assertEquals("NORTE", Manifiesto.zonaDe("RF-001|1250|NORTE"));
        assertEquals(null, Manifiesto.zonaDe("RF-001|1250"));
        assertEquals(1250, Manifiesto.gramosDe("RF-001|1250|NORTE"));
        assertEquals(-1, Manifiesto.gramosDe("RF-001||NORTE"));
    }
}
