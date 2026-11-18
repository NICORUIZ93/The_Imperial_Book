public class CreationalPatternsDemo {
    interface Singleton {
        String label();
    }

    static final class EagerSingleton implements Singleton {
        private static final EagerSingleton INSTANCE = new EagerSingleton();
        private EagerSingleton() {}
        static EagerSingleton getInstance() { return INSTANCE; }
        public String label() { return "eager"; }
    }

    static final class LazySingleton implements Singleton {
        private static LazySingleton instance;
        private LazySingleton() {}
        static LazySingleton getInstance() {
            if (instance == null) instance = new LazySingleton();
            return instance;
        }
        public String label() { return "lazy-no-sync"; }
    }

    static final class SynchronizedSingleton implements Singleton {
        private static SynchronizedSingleton instance;
        private SynchronizedSingleton() {}
        static synchronized SynchronizedSingleton getInstance() {
            if (instance == null) instance = new SynchronizedSingleton();
            return instance;
        }
        public String label() { return "synchronized"; }
    }

    static final class DoubleCheckedSingleton implements Singleton {
        private static volatile DoubleCheckedSingleton instance;
        private DoubleCheckedSingleton() {}
        static DoubleCheckedSingleton getInstance() {
            if (instance == null) {
                synchronized (DoubleCheckedSingleton.class) {
                    if (instance == null) instance = new DoubleCheckedSingleton();
                }
            }
            return instance;
        }
        public String label() { return "double-checked"; }
    }

    enum EnumSingleton implements Singleton {
        INSTANCE;
        public String label() { return "enum"; }
    }

    interface Notificador {
        String enviar(String codigo);
    }

    static final class EmailNotificador implements Notificador {
        public String enviar(String codigo) { return "email:" + codigo; }
    }

    static final class SmsNotificador implements Notificador {
        public String enviar(String codigo) { return "sms:" + codigo; }
    }

    abstract static class NotificadorFactory {
        abstract Notificador crear();
        String notificar(String codigo) { return crear().enviar(codigo); }
    }

    static final class EmailFactory extends NotificadorFactory {
        Notificador crear() { return new EmailNotificador(); }
    }

    static final class SmsFactory extends NotificadorFactory {
        Notificador crear() { return new SmsNotificador(); }
    }

    interface Etiqueta {
        String formatear(String codigo);
    }

    interface Guia {
        String servicio();
    }

    interface TransportistaFactory {
        Etiqueta crearEtiqueta();
        Guia crearGuia();
    }

    static final class LocalFactory implements TransportistaFactory {
        public Etiqueta crearEtiqueta() { return codigo -> "LOCAL-" + codigo; }
        public Guia crearGuia() { return () -> "entrega-hoy"; }
    }

    static final class InternacionalFactory implements TransportistaFactory {
        public Etiqueta crearEtiqueta() { return codigo -> "INT-" + codigo; }
        public Guia crearGuia() { return () -> "aduana-y-seguimiento"; }
    }

    static final class Pedido {
        private final String cliente;
        private final String codigo;
        private final int unidades;

        private Pedido(Builder builder) {
            cliente = builder.cliente;
            codigo = builder.codigo;
            unidades = builder.unidades;
        }

        static Builder builder() { return new Builder(); }

        static final class Builder {
            private String cliente;
            private String codigo;
            private int unidades = 1;

            Builder cliente(String value) { cliente = value; return this; }
            Builder codigo(String value) { codigo = value; return this; }
            Builder unidades(int value) { unidades = value; return this; }
            Pedido build() {
                if (cliente == null || cliente.isBlank() || codigo == null || codigo.isBlank()) {
                    throw new IllegalStateException("cliente y codigo son obligatorios");
                }
                if (unidades < 1) throw new IllegalArgumentException("unidades debe ser positivo");
                return new Pedido(this);
            }
        }

        String resumen() { return cliente + ":" + codigo + ":" + unidades; }
    }

    static final class Paquete {
        private final String codigo;
        private final int gramos;
        Paquete(String codigo, int gramos) {
            this.codigo = codigo;
            this.gramos = gramos;
        }
        Paquete copy() { return new Paquete(codigo, gramos); }
        String resumen() { return codigo + ":" + gramos + "g"; }
    }

    public static void main(String[] args) {
        System.out.println("singleton=" + EagerSingleton.getInstance().label() + ","
                + LazySingleton.getInstance().label() + ","
                + SynchronizedSingleton.getInstance().label() + ","
                + DoubleCheckedSingleton.getInstance().label() + ","
                + EnumSingleton.INSTANCE.label());
        System.out.println("factory=" + new EmailFactory().notificar("RF-1") + ","
                + new SmsFactory().notificar("RF-1"));
        TransportistaFactory local = new LocalFactory();
        TransportistaFactory internacional = new InternacionalFactory();
        System.out.println("abstract-factory=" + local.crearEtiqueta().formatear("RF-1") + ","
                + local.crearGuia().servicio() + ";"
                + internacional.crearEtiqueta().formatear("RF-1") + ","
                + internacional.crearGuia().servicio());
        System.out.println("builder=" + Pedido.builder().cliente("Ana").codigo("RF-1")
                .unidades(2).build().resumen());
        Paquete original = new Paquete("RF-2", 750);
        System.out.println("prototype=" + original.copy().resumen());
    }
}
