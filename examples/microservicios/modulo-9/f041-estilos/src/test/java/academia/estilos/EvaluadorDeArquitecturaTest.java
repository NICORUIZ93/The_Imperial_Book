package academia.estilos;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class EvaluadorDeArquitecturaTest {

    @Test
    void unEquipoPequenoSinPlataformaSeQuedaEnMonolitoModular() {
        var r = EvaluadorDeArquitectura.evaluar(
                new Contexto("Tienda", 4, 1, false, false, false, false, false));
        assertEquals(Estilo.MONOLITO_MODULAR, r.estilo());
        assertEquals(4, r.razones().size(), "debe explicar las cuatro carencias");
    }

    @Test
    void variosEquiposConDominioClaroYPlataformaVanAMicroservicios() {
        var r = EvaluadorDeArquitectura.evaluar(
                new Contexto("Billetera", 70, 9, true, true, true, false, true));
        assertEquals(Estilo.MICROSERVICIOS, r.estilo());
    }

    @Test
    void integrarAplicacionesDeVariasAreasEsTerrenoDeSoa() {
        var r = EvaluadorDeArquitectura.evaluar(
                new Contexto("Aseguradora", 30, 5, false, false, true, true, true));
        assertEquals(Estilo.SOA, r.estilo());
    }

    @Test
    void sinPlataformaOperativaNoHayMicroserviciosAunqueHayaMuchosEquipos() {
        var r = EvaluadorDeArquitectura.evaluar(
                new Contexto("Banco sin DevOps", 120, 12, true, true, true, false, false));
        assertEquals(Estilo.MONOLITO_MODULAR, r.estilo());
        assertTrue(r.razones().getFirst().contains("plataforma operativa"));
    }

    /**
     * Ejercicio de decisión (Módulo 5): «Agenda Salud», 6 desarrolladores en 1 equipo, 300 citas al día,
     * dominio aún cambiante, sin guardias 24/7. El CTO quiere microservicios «para escalar».
     * Respuesta correcta: no usar microservicios.
     */
    @Test
    void ejercicioAgendaSaludRespuestaCorrectaNoUsarMicroservicios() {
        var r = EvaluadorDeArquitectura.evaluar(
                new Contexto("Agenda Salud", 6, 1, false, false, false, false, false));
        assertEquals(Estilo.MONOLITO_MODULAR, r.estilo());
    }
}
