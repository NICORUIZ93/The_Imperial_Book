// Módulo 32 · F182 · La saga de reservas en Java puro (JDK 25, sin dependencias), para ver la mecánica de las
// compensaciones antes de Temporal. Ejecuta: java spring/jdk/SagaReserva.java
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

public class SagaReserva {

    record Paso(String nombre, Runnable hacer, String compensacion, Runnable deshacer) { }

    static String ejecutar(String reservaId, List<Paso> pasos) {
        Deque<Paso> hechos = new ArrayDeque<>(); // pila: se deshace en orden inverso
        List<String> compensadas = new ArrayList<>();
        for (Paso p : pasos) {
            try {
                p.hacer().run();
                hechos.push(p);
            } catch (RuntimeException e) {
                while (!hechos.isEmpty()) {
                    Paso h = hechos.pop();
                    if (h.deshacer() != null) { h.deshacer().run(); compensadas.add(h.compensacion()); }
                }
                return reservaId + " CANCELADA (" + e.getMessage() + ") compensadas=" + compensadas;
            }
        }
        return reservaId + " CONFIRMADA";
    }

    static List<Paso> pasos(String tarjeta, boolean fallarAlConfirmar) {
        return List.of(
            new Paso("reservarPlaza", () -> { }, "liberarPlaza", () -> { }),
            new Paso("cobrar", () -> { if (tarjeta.equals("4000-RECHAZAR")) throw new RuntimeException("tarjeta rechazada"); },
                     "reembolsar", () -> { }),
            new Paso("confirmar", () -> { if (fallarAlConfirmar) throw new RuntimeException("el organizador canceló el evento"); },
                     null, null));
    }

    public static void main(String[] args) {
        System.out.println(ejecutar("R-1", pasos("4242-OK", false)));
        System.out.println(ejecutar("R-2", pasos("4000-RECHAZAR", false)));
        System.out.println(ejecutar("R-3", pasos("4242-OK", true)));
    }
}
