// M0 · Tema 1 · ejemplo mínimo: qué Java está ejecutando este programa.
// Java 25. Ejecuta: java VersionDeJava.java
public class VersionDeJava {
    public static void main(String[] args) {
        Runtime.Version version = Runtime.version();
        System.out.println("Versión completa: " + version);
        System.out.println("Número de entrega (feature): " + version.feature());
        System.out.println("Máquina virtual: " + System.getProperty("java.vm.name"));
    }
}
