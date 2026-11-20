// F072 · Logging estructurado — texto libre frente a JSON por línea, solo con JDK 25.
// ANTES: frases concatenadas, con datos personales y sin forma de unirlas a una traza.
// DESPUÉS: una línea JSON por evento (campos con nombre, nivel, servicio, trace.id), sin datos personales,
//          y una "consulta" que filtra por campos como haría Loki o Elasticsearch.
// Ejecuta:  java LogsEstructurados.java      (escribe target/logs.jsonl)
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class LogsEstructurados {

    record Evento(String pedido, String email, String traza, boolean falla, String motivo) { }

    static final List<Evento> EVENTOS = List.of(
            new Evento("P-7", "ana@correo.com", "4bf92f3577b34da6a3ce929d0e0e4736", false, null),
            new Evento("P-8", "luis@correo.com", "00f067aa0ba902b7a3ce929d0e0e4736", true, "pasarela sin respuesta tras 2000 ms"),
            new Evento("P-9", "ana@correo.com", "5c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f", false, null),
            new Evento("P-8", "luis@correo.com", "00f067aa0ba902b7a3ce929d0e0e4736", true, "reintento agotado"));

    // Escapa lo mínimo para JSON válido (comillas, barra invertida y controles).
    static String json(String s) {
        StringBuilder b = new StringBuilder("\"");
        for (char c : s.toCharArray()) {
            switch (c) {
                case '"' -> b.append("\\\"");
                case '\\' -> b.append("\\\\");
                case '\n' -> b.append("\\n");
                default -> { if (c < 0x20) b.append(String.format("\\u%04x", (int) c)); else b.append(c); }
            }
        }
        return b.append('"').toString();
    }

    static String linea(Map<String, String> campos) {
        StringBuilder b = new StringBuilder("{");
        campos.forEach((k, v) -> b.append(b.length() > 1 ? "," : "").append(json(k)).append(':').append(json(v)));
        return b.append('}').toString();
    }

    // Seudónimo estable: permite agrupar por cliente sin guardar su correo.
    static String seudonimo(String email) throws Exception {
        byte[] h = MessageDigest.getInstance("SHA-256").digest(("sal-del-servicio:" + email).getBytes(StandardCharsets.UTF_8));
        return "c-" + HexFormat.of().formatHex(h).substring(0, 10);
    }

    public static void main(String[] args) throws Exception {
        System.out.println("ANTES (texto libre):");
        for (Evento e : EVENTOS) {
            System.out.println("  " + (e.falla() ? "ERROR " : "INFO ") + "Pedido " + e.pedido() + " de " + e.email()
                    + (e.falla() ? " falló: " + e.motivo() : " confirmado"));
        }
        System.out.println("  -> para contar fallos por pedido hay que adivinar con expresiones regulares, y hay correos en los logs");

        System.out.println("DESPUÉS (JSON por línea, campos con nombre):");
        Instant t = Instant.parse("2026-11-19T15:00:00Z");
        List<String> lineas = new ArrayList<>();
        for (Evento e : EVENTOS) {
            Map<String, String> c = new LinkedHashMap<>();
            c.put("@timestamp", (t = t.plusMillis(250)).toString());
            c.put("log.level", e.falla() ? "ERROR" : "INFO");
            c.put("service.name", "pedidos");
            c.put("message", e.falla() ? "pago rechazado" : "pedido confirmado");
            c.put("trace.id", e.traza());
            c.put("pedido.id", e.pedido());
            c.put("cliente.id", seudonimo(e.email()));
            if (e.falla()) c.put("error.message", e.motivo());
            lineas.add(linea(c));
        }
        lineas.forEach(l -> System.out.println("  " + l));
        Files.createDirectories(Path.of("target"));
        Files.write(Path.of("target/logs.jsonl"), lineas);

        // "Consulta": como {service_name="pedidos"} | json | log_level="ERROR" en Loki.
        Pattern campo = Pattern.compile("\"([^\"]+)\":\"((?:[^\"\\\\]|\\\\.)*)\"");
        Map<String, Integer> errores = new LinkedHashMap<>();
        int conCorreo = 0;
        for (String l : lineas) {
            Map<String, String> c = new LinkedHashMap<>();
            Matcher m = campo.matcher(l);
            while (m.find()) c.put(m.group(1), m.group(2));
            if ("ERROR".equals(c.get("log.level"))) errores.merge(c.get("pedido.id") + " (traza " + c.get("trace.id").substring(0, 8) + "…)", 1, Integer::sum);
            if (l.contains("@correo.com")) conCorreo++;
        }
        System.out.println("Consulta log.level=ERROR agrupada por pedido.id: " + errores);
        System.out.println("Líneas con correos electrónicos: " + conCorreo);
        boolean ok = errores.size() == 1 && errores.values().iterator().next() == 2 && conCorreo == 0;
        System.out.println(ok ? "OK: 4 eventos JSON válidos, fallos agrupables y sin datos personales" : "FALLA");
        System.exit(ok ? 0 : 1);
    }
}
