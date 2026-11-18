public class SingletonDemo {
    enum Configuracion {
        INSTANCIA;
        final String moneda = "COP";
    }
    interface Config { String moneda(); }
    record Cotizador(Config config) {
        String moneda() { return config.moneda(); }
    }
    public static void main(String[] args) {
        System.out.println("misma instancia=" + (Configuracion.INSTANCIA == Configuracion.INSTANCIA));
        // El consumidor recibe un contrato: las pruebas pueden inyectar otro valor.
        var produccion = new Cotizador(() -> Configuracion.INSTANCIA.moneda);
        var prueba = new Cotizador(() -> "USD");
        System.out.println("produccion=" + produccion.moneda());
        System.out.println("prueba=" + prueba.moneda());
        if (args.length > 0) {
            // Fallo deliberado: dependencia global oculta, ignora la configuración de prueba.
            String actual = Configuracion.INSTANCIA.moneda;
            if (!actual.equals(prueba.moneda()))
                throw new IllegalStateException("dependencia global: esperado USD, obtenido " + actual);
        }
    }
}
