package academia.presupuesto;

import java.time.Duration;

/**
 * Un instante absoluto (epoch ms) hasta el que el cliente está dispuesto a esperar.
 * Viaja en la cabecera X-Deadline y cada salto calcula cuánto le queda.
 */
public record Deadline(long epochMs) {

    public static final String CABECERA = "X-Deadline";

    public static Deadline desde(Long cabecera, Duration porDefecto) {
        return new Deadline(cabecera != null ? cabecera : System.currentTimeMillis() + porDefecto.toMillis());
    }

    /** Lo que queda, descontando la reserva que este salto necesita para componer su respuesta. */
    public Duration restante(Duration reserva) {
        return Duration.ofMillis(epochMs - System.currentTimeMillis() - reserva.toMillis());
    }

    /** El deadline que se pasa al siguiente salto: más corto, para que conteste antes que nosotros. */
    public Deadline paraElSiguiente(Duration reserva) {
        return new Deadline(epochMs - reserva.toMillis());
    }
}
