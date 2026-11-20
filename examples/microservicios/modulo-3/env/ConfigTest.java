// Test de Config.java: lanza `java Config.java` como proceso hijo con distintos entornos.
// Requisitos: JDK 25 LTS. Ejecuta (desde la carpeta env/):  java ConfigTest.java

import java.nio.file.Path;
import java.util.Map;

public class ConfigTest {
    static int fallos = 0;

    static String[] ejecutar(Map<String, String> variables) throws Exception {
        String java = Path.of(System.getProperty("java.home"), "bin", "java").toString();
        ProcessBuilder pb = new ProcessBuilder(java, "Config.java");
        pb.environment().remove("PUERTO");
        pb.environment().remove("MODO");
        pb.environment().putAll(variables); // las variables que ve el proceso hijo
        Process p = pb.start();
        String out = new String(p.getInputStream().readAllBytes()).trim();
        String err = new String(p.getErrorStream().readAllBytes());
        return new String[] {out, String.valueOf(p.waitFor()), err};
    }

    static void verificar(String nombre, boolean ok) {
        System.out.println((ok ? "✔ " : "✖ ") + nombre);
        if (!ok) fallos++;
    }

    public static void main(String[] args) throws Exception {
        verificar("sin variables usa los valores por defecto",
                ejecutar(Map.of())[0].equals("puerto=8080 modo=desarrollo"));
        verificar("PUERTO=9000 y MODO=produccion cambian la salida",
                ejecutar(Map.of("PUERTO", "9000", "MODO", "produccion"))[0].equals("puerto=9000 modo=produccion"));
        String[] malo = ejecutar(Map.of("PUERTO", "ochenta"));
        verificar("PUERTO inválido termina con código 1", malo[1].equals("1") && malo[2].contains("PUERTO inválido"));
        System.out.println(fallos == 0 ? "Java: todos los tests pasaron" : "Java: " + fallos + " test(s) fallaron");
        System.exit(fallos == 0 ? 0 : 1);
    }
}
