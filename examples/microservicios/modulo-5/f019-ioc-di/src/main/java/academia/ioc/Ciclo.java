package academia.ioc;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/** Bitácora del ciclo de vida: imprime cada paso y lo guarda para que el test lo compruebe. */
public final class Ciclo {
    private static final List<String> EVENTOS = new CopyOnWriteArrayList<>();

    private Ciclo() { }

    public static void registrar(String evento) {
        EVENTOS.add(evento);
        System.out.println(evento);
    }

    public static List<String> eventos() { return List.copyOf(EVENTOS); }

    public static void limpiar() { EVENTOS.clear(); }
}
