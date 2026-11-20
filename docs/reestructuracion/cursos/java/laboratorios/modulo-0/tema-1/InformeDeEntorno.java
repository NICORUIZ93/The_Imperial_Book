// M0 · Tema 1 · ejemplo realista: rutaflow-nucleo comprueba su plataforma antes de arrancar.
// Java 25. Ejecuta: java -Dstdout.encoding=UTF-8 InformeDeEntorno.java
public class InformeDeEntorno {
    // rutaflow-nucleo usa funciones definitivas de JDK 25: con menos no arranca.
    static final int ENTREGA_MINIMA = 25;

    public static void main(String[] args) {
        Runtime.Version version = Runtime.version();
        int entrega = version.feature();

        System.out.println("rutaflow-nucleo · informe de entorno");
        System.out.println("  entrega de Java:        " + entrega);
        System.out.println("  actualización:          " + version.update());
        System.out.println("  formato de clase:       " + System.getProperty("java.class.version"));
        System.out.println("  especificación de JVM:  " + System.getProperty("java.vm.specification.version"));
        System.out.println("  ¿trae compilador?       " + (javax.tools.ToolProvider.getSystemJavaCompiler() != null));

        if (entrega < ENTREGA_MINIMA) {
            System.out.println("RESULTADO: este equipo tiene Java " + entrega
                    + " y rutaflow-nucleo necesita Java " + ENTREGA_MINIMA + " o posterior");
            System.exit(1);
        }
        System.out.println("RESULTADO: plataforma válida para rutaflow-nucleo");
    }
}
