// M3 · Tema 5 · donde esta el techo de la pila, medido en esta maquina.
// Java 25. Ejecuta: javac --release 25 -d out *.java
//                  java -cp out ProfundidadPila
//                  java -Xss256k -cp out ProfundidadPila
//                  java -Xss4m   -cp out ProfundidadPila
public class ProfundidadPila {
    static int marcos = 0;

    static void hondo() {
        marcos++;             // el contador es estatico: sobrevive al desbordamiento
        hondo();
    }

    public static void main(String[] args) {
        int alcanzados = -1;
        int enLaTraza = -1;
        String mensaje = null;
        try {
            hondo();
        } catch (StackOverflowError e) {
            alcanzados = marcos;
            enLaTraza = e.getStackTrace().length;
            mensaje = e.getMessage();
        }
        System.out.println("ThreadStackSize de la JVM (-Xss): " + opcionDeJVM("ThreadStackSize") + " KB");
        System.out.println("marcos realmente llamados       : " + alcanzados);
        System.out.println("marcos que aparece en la traza    : " + enLaTraza);
        System.out.println("getMessage()                      : " + mensaje);
        System.out.println("MaxJavaStackTraceDepth (-XX)       : " + opcionDeJVM("MaxJavaStackTraceDepth"));
    }

    // El tamano de pila no se puede leer de una propiedad del sistema: se pide a la propia JVM.
    static String opcionDeJVM(String nombre) {
        try {
            com.sun.management.HotSpotDiagnosticMXBean jvm =
                java.lang.management.ManagementFactory.getPlatformMXBean(
                    com.sun.management.HotSpotDiagnosticMXBean.class);
            return jvm.getVMOption(nombre).getValue();
        } catch (RuntimeException ignore) {
            return "no accesible";
        }
    }
}
