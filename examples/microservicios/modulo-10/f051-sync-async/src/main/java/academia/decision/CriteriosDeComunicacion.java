package academia.decision;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/** Regla de decisión de F051: síncrono si necesitas la respuesta para continuar; asíncrono si no. */
public final class CriteriosDeComunicacion {

    public enum Estilo { SINCRONO, ASINCRONO }

    public record Decision(Estilo estilo, List<String> razones) {
    }

    private CriteriosDeComunicacion() {
    }

    public static Decision decidir(Necesidad n) {
        List<String> razones = new ArrayList<>();
        if (n.elLlamadorNecesitaDatosDeVuelta() || (n.usuarioEsperaElResultado() && !n.toleraConsistenciaEventual())) {
            razones.add("quien llama no puede continuar sin la respuesta");
            if (n.variosInteresados()) {
                razones.add("y además publica un evento para los demás interesados");
            }
            return new Decision(Estilo.SINCRONO, razones);
        }
        if (n.toleraConsistenciaEventual()) {
            razones.add("el efecto puede ocurrir después");
        }
        if (n.variosInteresados()) {
            razones.add("varios servicios reaccionan al mismo hecho sin que el emisor los conozca");
        }
        if (n.tareaLargaOPicosDeCarga()) {
            razones.add("la cola amortigua picos y tareas largas");
        }
        return new Decision(Estilo.ASINCRONO, razones);
    }

    /** Disponibilidad de una cadena SÍNCRONA: todos deben estar arriba a la vez (se multiplican). */
    public static double disponibilidadEnCadena(double... disponibilidades) {
        double total = 1.0;
        for (double d : disponibilidades) {
            total *= d;
        }
        return total;
    }

    /** Latencia de una cadena SÍNCRONA: se suman las esperas de cada salto. */
    public static long latenciaEnCadena(long... milisegundos) {
        long total = 0;
        for (long ms : milisegundos) {
            total += ms;
        }
        return total;
    }

    public static void main(String[] args) {
        for (Necesidad n : List.of(
                new Necesidad("Consultar saldo antes de pagar", true, true, false, false, false),
                new Necesidad("Enviar correo de confirmación", false, false, true, false, false),
                new Necesidad("Pedido creado: facturar, despachar y sumar puntos", false, false, true, true, false),
                new Necesidad("Generar el reporte mensual en PDF", false, false, true, false, true))) {
            Decision d = decidir(n);
            System.out.printf("%-50s -> %s %s%n", n.caso(), d.estilo(), d.razones());
        }
        System.out.printf(Locale.ROOT, "Cadena síncrona de 5 servicios al 99,5 %%: %.4f %% disponible%n",
                disponibilidadEnCadena(0.995, 0.995, 0.995, 0.995, 0.995) * 100);
        System.out.printf("Latencia de 5 saltos de 80 ms: %d ms%n", latenciaEnCadena(80, 80, 80, 80, 80));
    }
}
