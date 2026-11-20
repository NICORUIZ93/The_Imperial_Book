// F069 · Escaneo de vulnerabilidades — qué hace por dentro Trivy/Snyk con tus dependencias, en JDK 25.
// 1) Lee las dependencias declaradas en un pom.xml.  2) Las cruza con una base de avisos (aquí, 2
// avisos reales copiados de GitHub Advisory Database; Trivy y Snyk descargan miles).  3) Si encuentra
// algo de severidad HIGH o CRITICAL termina con código 1, como "trivy --exit-code 1".
// Uso:  java MiniEscaner.java ../f069-escaneo/antes/pom.xml
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MiniEscaner {

    record Dependencia(String grupo, String artefacto, String version) { }
    // Rango simplificado "versión < corregida". El aviso de Log4Shell tiene tres rangos
    // (2.0-beta9 a <2.3.1, 2.4 a <2.12.2 y 2.13.0 a <2.15.0); para 2.13+ basta con este.
    record Aviso(String id, String ghsa, String paquete, String corregida, String severidad, double cvss, String titulo) { }

    static final List<Aviso> AVISOS = List.of(
            new Aviso("CVE-2021-44228", "GHSA-jfh8-c2jp-5v3q", "org.apache.logging.log4j:log4j-core", "2.15.0",
                    "CRITICAL", 10.0, "Log4Shell: ejecución remota de código vía JNDI en mensajes de log"),
            new Aviso("CVE-2022-1471", "GHSA-mjmj-j48q-9wg2", "org.yaml:snakeyaml", "2.0",
                    "HIGH", 8.3, "El Constructor de SnakeYAML permite deserializar clases arbitrarias"));

    // Compara versiones numéricas por partes: 2.14.1 < 2.15.0, 1.33 < 2.0.
    static int comparar(String a, String b) {
        String[] x = a.split("[.-]"), y = b.split("[.-]");
        for (int i = 0; i < Math.max(x.length, y.length); i++) {
            int p = i < x.length && x[i].matches("\\d+") ? Integer.parseInt(x[i]) : 0;
            int q = i < y.length && y[i].matches("\\d+") ? Integer.parseInt(y[i]) : 0;
            if (p != q) return Integer.compare(p, q);
        }
        return 0;
    }

    public static void main(String[] args) throws Exception {
        String pom = Files.readString(Path.of(args[0]));
        Matcher m = Pattern.compile("<dependency>\\s*<groupId>([^<]+)</groupId>\\s*<artifactId>([^<]+)</artifactId>\\s*"
                + "<version>([^<]+)</version>").matcher(pom);
        int graves = 0, total = 0;
        System.out.println(args[0]);
        System.out.printf("%-36s %-9s %-15s %-13s %-9s%n", "Librería", "Instalada", "Vulnerabilidad", "Severidad", "Corregida");
        while (m.find()) {
            Dependencia d = new Dependencia(m.group(1), m.group(2), m.group(3));
            total++;
            for (Aviso a : AVISOS) {
                if (a.paquete().equals(d.grupo() + ":" + d.artefacto()) && comparar(d.version(), a.corregida()) < 0) {
                    System.out.printf("%-36s %-9s %-15s %-13s %-9s %s%n", a.paquete(), d.version(), a.id(),
                            a.severidad() + " " + a.cvss(), a.corregida(), a.titulo());
                    graves++;
                }
            }
        }
        System.out.println("Dependencias revisadas: " + total + " · HIGH/CRITICAL: " + graves);
        System.exit(graves > 0 ? 1 : 0);
    }
}
