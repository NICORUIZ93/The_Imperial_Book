package academia.decision;

import static org.junit.jupiter.api.Assertions.assertEquals;

import academia.decision.CriteriosDeComunicacion.Estilo;
import org.junit.jupiter.api.Test;

class CriteriosDeComunicacionTest {

    @Test
    void siNecesitasLaRespuestaParaSeguirEsSincrono() {
        var d = CriteriosDeComunicacion.decidir(new Necesidad("saldo", true, true, false, false, false));
        assertEquals(Estilo.SINCRONO, d.estilo());
    }

    @Test
    void variosInteresadosYConsistenciaEventualEsAsincrono() {
        var d = CriteriosDeComunicacion.decidir(new Necesidad("pedido creado", false, false, true, true, false));
        assertEquals(Estilo.ASINCRONO, d.estilo());
        assertEquals(2, d.razones().size());
    }

    @Test
    void laDisponibilidadDeUnaCadenaSincronaSeMultiplica() {
        assertEquals(0.97525, CriteriosDeComunicacion.disponibilidadEnCadena(0.995, 0.995, 0.995, 0.995, 0.995), 1e-5);
    }

    @Test
    void laLatenciaDeUnaCadenaSincronaSeSuma() {
        assertEquals(400, CriteriosDeComunicacion.latenciaEnCadena(80, 80, 80, 80, 80));
    }
}
