// M0 · Tema 2 · ejemplo realista: la comprobación que rutaflow-nucleo pide pasar antes de trabajar.
// Detecta el fallo más frecuente con varias versiones instaladas: JAVA_HOME dice una cosa y PATH otra.
// Java 25. Ejecuta: java -Dstdout.encoding=UTF-8 ComprobarEntorno.java
import java.io.File;
import java.io.IOException;

public class ComprobarEntorno {
    public static void main(String[] args) throws IOException {
        String enUso = new File(System.getProperty("java.home")).getCanonicalPath();
        String javaHome = System.getenv("JAVA_HOME");
        int entrega = Runtime.version().feature();
        int fallos = 0;

        System.out.println("JDK en uso (lo decide PATH): " + enUso);

        if (entrega == 25) {
            System.out.println("[ok]    entrega 25");
        } else {
            System.out.println("[FALLO] entrega " + entrega + "; se esperaba 25");
            fallos++;
        }

        if (javaHome == null) {
            System.out.println("[FALLO] JAVA_HOME no está definida");
            fallos++;
        } else if (new File(javaHome).getCanonicalPath().equals(enUso)) {
            System.out.println("[ok]    JAVA_HOME apunta al mismo JDK");
        } else {
            System.out.println("[FALLO] JAVA_HOME apunta a otro JDK: " + javaHome);
            fallos++;
        }

        if (new File(enUso, "bin/javac").exists() || new File(enUso, "bin/javac.exe").exists()) {
            System.out.println("[ok]    es un JDK completo (trae javac)");
        } else {
            System.out.println("[FALLO] no hay javac en " + enUso + "/bin: es solo un runtime");
            fallos++;
        }

        System.out.println(fallos == 0 ? "RESULTADO: entorno coherente" : "RESULTADO: " + fallos + " problema(s)");
        System.exit(fallos == 0 ? 0 : 1);
    }
}
