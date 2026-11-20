package academia.decision;

/**
 * Las preguntas que te haces ANTES de elegir cómo se comunican dos servicios.
 *
 * @param usuarioEsperaElResultado      ¿la pantalla necesita la respuesta para mostrar algo ya?
 * @param elLlamadorNecesitaDatosDeVuelta ¿quien llama no puede seguir sin la respuesta?
 * @param toleraConsistenciaEventual    ¿da igual si el efecto ocurre segundos después?
 * @param variosInteresados             ¿más de un servicio reacciona al mismo hecho?
 * @param tareaLargaOPicosDeCarga       ¿tarda mucho o llega en ráfagas que conviene amortiguar?
 */
public record Necesidad(String caso, boolean usuarioEsperaElResultado, boolean elLlamadorNecesitaDatosDeVuelta,
        boolean toleraConsistenciaEventual, boolean variosInteresados, boolean tareaLargaOPicosDeCarga) {
}
