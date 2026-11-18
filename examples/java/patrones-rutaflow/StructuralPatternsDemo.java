import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class StructuralPatternsDemo {
    interface Etiquetador {
        String crear(String codigo);
    }

    static final class LegacyLabelService {
        String makeLabel(int numericId) { return "LEGACY-" + numericId; }
    }

    static final class LabelAdapter implements Etiquetador {
        private final LegacyLabelService legacy;
        LabelAdapter(LegacyLabelService legacy) { this.legacy = legacy; }
        public String crear(String codigo) {
            if (!codigo.matches("RF-[0-9]+")) throw new IllegalArgumentException("codigo invalido");
            return legacy.makeLabel(Integer.parseInt(codigo.substring(3)));
        }
    }

    interface Notificacion {
        String enviar(String codigo);
    }

    static final class Email implements Notificacion {
        public String enviar(String codigo) { return "email(" + codigo + ")"; }
    }

    static final class LoggedNotification implements Notificacion {
        private final Notificacion decorated;
        LoggedNotification(Notificacion decorated) { this.decorated = decorated; }
        public String enviar(String codigo) {
            return "log[" + decorated.enviar(codigo) + "]";
        }
    }

    static final class DeliveryFacade {
        String crearEnvio(String codigo) {
            return validar(codigo) + "|" + reservar(codigo) + "|" + notificar(codigo);
        }
        private String validar(String codigo) {
            if (codigo == null || codigo.isBlank()) throw new IllegalArgumentException("codigo requerido");
            return "validado";
        }
        private String reservar(String codigo) { return "reserva:" + codigo; }
        private String notificar(String codigo) { return "aviso:" + codigo; }
    }

    interface Component {
        String describe();
    }

    static final class Item implements Component {
        private final String code;
        Item(String code) { this.code = code; }
        public String describe() { return code; }
    }

    static final class PackageGroup implements Component {
        private final List<Component> children;
        PackageGroup(Component... children) { this.children = List.of(children); }
        public String describe() {
            return children.stream().map(Component::describe).reduce((a, b) -> a + "+" + b).orElse("");
        }
    }

    interface Quote {
        long cents();
    }

    static final class RealQuote implements Quote {
        public long cents() { return 1500; }
    }

    static final class AuthorizedQuoteProxy implements Quote {
        private final Quote target;
        private final boolean authorized;
        AuthorizedQuoteProxy(Quote target, boolean authorized) {
            this.target = Objects.requireNonNull(target);
            this.authorized = authorized;
        }
        public long cents() {
            if (!authorized) throw new SecurityException("cotizacion no autorizada");
            return target.cents();
        }
    }

    interface TrackingChannel {
        String send(String message);
    }

    static final class EmailChannel implements TrackingChannel {
        public String send(String message) { return "email:" + message; }
    }

    static final class SmsChannel implements TrackingChannel {
        public String send(String message) { return "sms:" + message; }
    }

    static final class TrackingAlert {
        private final TrackingChannel channel;
        TrackingAlert(TrackingChannel channel) { this.channel = channel; }
        String alert(String state) { return channel.send("estado=" + state); }
    }

    record MarkerStyle(String icon, String color) {}

    static final class MarkerStyleCache {
        private final Map<String, MarkerStyle> styles = new HashMap<>();

        MarkerStyle get(String type) {
            return styles.computeIfAbsent(type, key -> switch (key) {
                case "paquete" -> new MarkerStyle("caja.svg", "azul");
                case "camion" -> new MarkerStyle("camion.svg", "naranja");
                default -> throw new IllegalArgumentException("tipo desconocido: " + key);
            });
        }

        int size() { return styles.size(); }
    }

    public static void main(String[] args) {
        System.out.println("adapter=" + new LabelAdapter(new LegacyLabelService()).crear("RF-42"));
        System.out.println("decorator=" + new LoggedNotification(new Email()).enviar("RF-1"));
        System.out.println("facade=" + new DeliveryFacade().crearEnvio("RF-1"));
        System.out.println("composite=" + new PackageGroup(
                new Item("RF-1"), new PackageGroup(new Item("RF-2"), new Item("RF-3"))).describe());
        System.out.println("proxy=" + new AuthorizedQuoteProxy(new RealQuote(), true).cents());
        System.out.println("bridge=" + new TrackingAlert(new SmsChannel()).alert("EN_CAMINO"));
        MarkerStyleCache cache = new MarkerStyleCache();
        for (int i = 0; i < 1_000; i++) cache.get(i % 2 == 0 ? "paquete" : "camion");
        System.out.println("flyweight=1000-markers," + cache.size() + "-shared-styles");
    }
}
