import java.util.Objects;

public class StrategyDemo {
    interface Tarifa { long centavos(int kilometros); }
    static final class Normal implements Tarifa {
        public long centavos(int km) { return 500L + 100L * km; }
    }
    static final class Express implements Tarifa {
        public long centavos(int km) { return 900L + 150L * km; }
    }
    static final class Recogida implements Tarifa {
        public long centavos(int km) { return 0; }
    }
    record Cotizador(Tarifa tarifa) {
        Cotizador { Objects.requireNonNull(tarifa, "tarifa requerida"); }
        long cotizar(int km) {
            if (km < 0) throw new IllegalArgumentException("kilometros negativos");
            return tarifa.centavos(km);
        }
    }
    public static void main(String[] args) {
        if (args.length > 0) { new Cotizador(new Normal()).cotizar(-1); return; }
        // Cambia la política inyectada; Cotizador no selecciona implementaciones.
        System.out.println("normal=" + new Cotizador(new Normal()).cotizar(10));
        System.out.println("express=" + new Cotizador(new Express()).cotizar(10));
        System.out.println("recogida=" + new Cotizador(new Recogida()).cotizar(10));
    }
}
