package academia.factores;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Revisa un application.properties y señala violaciones típicas del factor III:
 * secretos escritos en el archivo y direcciones de un entorno concreto (localhost, IP fijas).
 * Java puro: ejecútalo con  java src/main/java/academia/factores/RevisorDeConfiguracion.java <archivo>
 */
public final class RevisorDeConfiguracion {

    private static final Pattern CLAVE_SECRETA = Pattern.compile("(?i).*(password|secret|token|api-key|apikey).*");
    private static final Pattern DIRECCION_FIJA =
            Pattern.compile("(?i).*(localhost|127\\.0\\.0\\.1|\\b\\d{1,3}(\\.\\d{1,3}){3}\\b).*");

    private RevisorDeConfiguracion() {
    }

    public static List<String> revisar(List<String> lineas) {
        List<String> hallazgos = new ArrayList<>();
        for (int i = 0; i < lineas.size(); i++) {
            String linea = lineas.get(i).strip();
            if (linea.isEmpty() || linea.startsWith("#") || !linea.contains("=")) {
                continue;
            }
            String clave = linea.substring(0, linea.indexOf('=')).strip();
            String valor = linea.substring(linea.indexOf('=') + 1).strip();
            boolean vieneDelEntorno = valor.startsWith("${");
            if (CLAVE_SECRETA.matcher(clave).matches() && !vieneDelEntorno) {
                hallazgos.add("línea " + (i + 1) + ": secreto en el archivo (" + clave + ")");
            } else if (DIRECCION_FIJA.matcher(valor).matches() && !vieneDelEntorno) {
                hallazgos.add("línea " + (i + 1) + ": dirección de un entorno concreto (" + clave + ")");
            }
        }
        return hallazgos;
    }

    public static void main(String[] args) throws IOException {
        List<String> hallazgos = revisar(Files.readAllLines(Path.of(args[0])));
        hallazgos.forEach(h -> System.out.println("✘ " + h));
        System.out.println(hallazgos.isEmpty() ? "✔ sin violaciones del factor III" : hallazgos.size() + " violaciones");
        System.exit(hallazgos.isEmpty() ? 0 : 1);
    }
}
