// M2 · laboratorio · el lector de guías probado: cada prueba usa una línea real de tema-6/datos/guias.txt.
package rutaflow.nucleo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotSame;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class GuiaDeEnvioTest {

    /** Las siete líneas del archivo de datos del tema 6, tal cual están en el repositorio. */
    private static final String[] LINEAS_DE_GUIAS_TXT = {
        "RF-000123;Bogotá;2500",
        "  RF-000456;Medellín;1800",
        "RF-000789;Cali;1001",
        "",
        "📦 RF-000999;Pasto;5000",
        "RF-000;Barranquilla;900",
        "RF-000555;Cartagena;dos mil",
    };

    @Test
    void unaLineaLimpiaSeConvierte() {
        assertNull(GuiaDeEnvio.motivoDeRechazo("RF-000123;Bogotá;2500"));
        GuiaDeEnvio guia = GuiaDeEnvio.desdeLinea("RF-000123;Bogotá;2500");
        assertEquals("RF-000123", guia.guia());
        assertEquals("Bogotá", guia.destino());
        assertEquals(2500, guia.pesoGramos());
    }

    @Test
    void deLasSieteLineasDelArchivoTresSirven() {
        int validas = 0;
        for (String linea : LINEAS_DE_GUIAS_TXT) {
            if (GuiaDeEnvio.motivoDeRechazo(linea) == null) {
                validas++;
            }
        }
        assertEquals(3, validas, "el lector imprime «válidas : 3 · descartadas: 4»");
    }

    @Test
    void losEspaciosAlBordeDesaparecen() {
        assertEquals(new GuiaDeEnvio("RF-000456", "Medellín", 1800),
                GuiaDeEnvio.desdeLinea(LINEAS_DE_GUIAS_TXT[1]));
    }

    @Test
    void dosLineasIgualesDanLaMismaGuiaAunqueNoSeanElMismoObjeto() {
        GuiaDeEnvio primera = GuiaDeEnvio.desdeLinea("RF-000789;Cali;1001");
        GuiaDeEnvio segunda = GuiaDeEnvio.desdeLinea("RF-000789;Cali;1001");
        assertNotSame(primera, segunda);
        assertEquals(primera, segunda);
    }

    @Test
    void unaLineaVaciaSeDescartaConSuMotivo() {
        assertEquals("vacía, se ignora", GuiaDeEnvio.motivoDeRechazo(LINEAS_DE_GUIAS_TXT[3]));
        assertEquals("vacía, se ignora", GuiaDeEnvio.motivoDeRechazo("   "));
    }

    @Test
    void unPesoQueFaltaNoEsUnCampoVacio() {
        // "split" quita las piezas vacías del final: la línea trae 2 campos, no 3.
        assertEquals("«RF-000123;Bogotá;» trae 2 campos, se esperan 3",
                GuiaDeEnvio.motivoDeRechazo("RF-000123;Bogotá;"));
    }

    @Test
    void elEmojiCuentaComoUnCaracterNoComoDos() {
        assertEquals("guía «📦 RF-000999» tiene 11 caracteres, se esperan 9",
                GuiaDeEnvio.motivoDeRechazo(LINEAS_DE_GUIAS_TXT[4]));
    }

    @Test
    void unaGuiaCortaSeRechazaPorLongitud() {
        assertEquals("guía «RF-000» tiene 6 caracteres, se esperan 9",
                GuiaDeEnvio.motivoDeRechazo(LINEAS_DE_GUIAS_TXT[5]));
    }

    @Test
    void elPesoEnLetrasNoSeConvierte() {
        assertEquals("peso «dos mil» no son solo dígitos",
                GuiaDeEnvio.motivoDeRechazo(LINEAS_DE_GUIAS_TXT[6]));
    }

    @Test
    void laColumnaSaleAlineada() {
        assertEquals("RF-000123  Bogotá        2500 g",
                GuiaDeEnvio.desdeLinea("RF-000123;Bogotá;2500").enLinea());
        assertEquals("RF-000789  Cali          1001 g",
                GuiaDeEnvio.desdeLinea("RF-000789;Cali;1001").enLinea());
    }

    @Test
    void unDestinoLargoDesbordaLaColumnaYNoSeCorta() {
        assertEquals("RF-000123  Bogotá Centro  2500 g",
                GuiaDeEnvio.desdeLinea("RF-000123;Bogotá Centro;2500").enLinea());
    }

    @Test
    void soloDigitosRechazaTodoLoQueNoEsUnNumero() {
        assertTrue(GuiaDeEnvio.sonDigitos("2500"));
        assertFalse(GuiaDeEnvio.sonDigitos(""));
        assertFalse(GuiaDeEnvio.sonDigitos("dos mil"));
        assertFalse(GuiaDeEnvio.sonDigitos("2.500"));
        assertFalse(GuiaDeEnvio.sonDigitos("-2500"));
    }
}
