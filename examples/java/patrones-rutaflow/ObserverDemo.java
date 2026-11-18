import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class ObserverDemo {
    interface Observador { void actualizar(String estado); }
    static final class Entrega {
        private final List<Observador> observadores = new ArrayList<>();
        void suscribir(Observador o) { observadores.add(Objects.requireNonNull(o)); }
        void cancelar(Observador o) { observadores.remove(o); }
        void publicar(String estado) {
            // Instantánea: una baja durante el callback afecta al siguiente evento.
            for (var o : List.copyOf(observadores)) o.actualizar(estado);
        }
    }
    public static void main(String[] args) {
        var entrega = new Entrega();
        Observador cliente = estado -> System.out.println("cliente=" + estado);
        Observador auditoria = estado -> System.out.println("auditoria=" + estado);
        if (args.length > 0)
            entrega.suscribir(estado -> { throw new IllegalStateException("observador no disponible"); });
        entrega.suscribir(cliente);
        entrega.suscribir(auditoria);
        entrega.publicar("EN_CAMINO");
        entrega.cancelar(cliente);
        entrega.publicar("ENTREGADA");
    }
}
