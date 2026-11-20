// Módulo 0.4 · Variables de entorno en Java: System.getenv lee el entorno del proceso.
// Requisitos: JDK 25 LTS (funciona desde JDK 11 con `java Config.java`). Sin dependencias.
// Ejecuta (desde la carpeta env/):
//   java Config.java
//   PUERTO=9000 java Config.java

public class Config {
    public static void main(String[] args) {
        // getenv devuelve null si la variable no existe; Objects.requireNonNullElse pone el valor por defecto.
        String textoPuerto = java.util.Objects.requireNonNullElse(System.getenv("PUERTO"), "8080");
        String modo = java.util.Objects.requireNonNullElse(System.getenv("MODO"), "desarrollo");
        int puerto;
        try {
            puerto = Integer.parseInt(textoPuerto);
        } catch (NumberFormatException e) {
            System.err.println("Configuración inválida: PUERTO inválido: \"" + textoPuerto + "\"");
            System.exit(1);
            return;
        }
        System.out.println("puerto=" + puerto + " modo=" + modo);
    }
}
