// M0 · Tema 2 · ejemplo mínimo: de qué carpeta sale el Java que está ejecutando este programa.
// Java 25. Ejecuta: java DondeEstaJava.java
public class DondeEstaJava {
    public static void main(String[] args) {
        System.out.println("java.home = " + System.getProperty("java.home"));
        System.out.println("JAVA_HOME = " + System.getenv("JAVA_HOME"));
        System.out.println("ejecutable = " + ProcessHandle.current().info().command().orElse("desconocido"));
    }
}
