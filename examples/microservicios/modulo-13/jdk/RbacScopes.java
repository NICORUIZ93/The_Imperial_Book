// F065 · RBAC y Scopes — la decisión de autorización como tabla, solo JDK 25.
// RBAC: el USUARIO tiene roles y cada rol concede permisos.
// Scopes: el CLIENTE (la app) recibió del usuario un subconjunto de permisos para esta llamada.
// La petición pasa solo si el permiso está en (permisos del rol) ∩ (scopes del token).
// Ejecuta:  java RbacScopes.java
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public class RbacScopes {

    record Token(String sub, Set<String> roles, Set<String> scopes) { }
    record Regla(String metodo, String ruta, String permiso) { }

    // Rol -> permisos (lo administra seguridad, no cada servicio).
    static final Map<String, Set<String>> PERMISOS_POR_ROL = Map.of(
            "cliente", Set.of("pedidos:leer", "pedidos:crear"),
            "soporte", Set.of("pedidos:leer", "pedidos:reembolsar"),
            "admin", Set.of("pedidos:leer", "pedidos:crear", "pedidos:reembolsar", "pedidos:borrar"));

    // Ruta -> permiso requerido (lo declara el servicio).
    static final List<Regla> REGLAS = List.of(
            new Regla("GET", "/pedidos", "pedidos:leer"),
            new Regla("POST", "/pedidos", "pedidos:crear"),
            new Regla("POST", "/pedidos/reembolso", "pedidos:reembolsar"),
            new Regla("DELETE", "/pedidos", "pedidos:borrar"));

    // ANTES (vulnerable): mira solo el rol y lo toma de una cabecera que manda el cliente.
    static int antes(Map<String, String> cabeceras, String metodo, String ruta) {
        String rol = cabeceras.getOrDefault("X-Rol", "cliente");
        Regla r = regla(metodo, ruta);
        return PERMISOS_POR_ROL.getOrDefault(rol, Set.of()).contains(r.permiso()) ? 200 : 403;
    }

    // DESPUÉS (seguro): roles y scopes vienen del token firmado; se exige la intersección.
    static int despues(Token t, String metodo, String ruta) {
        if (t == null) return 401;
        Regla r = regla(metodo, ruta);
        Set<String> delRol = t.roles().stream().flatMap(x -> PERMISOS_POR_ROL.getOrDefault(x, Set.of()).stream())
                .collect(Collectors.toSet());
        boolean porRol = delRol.contains(r.permiso());
        boolean porScope = t.scopes().contains(r.permiso());
        return porRol && porScope ? 200 : 403;
    }

    static Regla regla(String metodo, String ruta) {
        return REGLAS.stream().filter(r -> r.metodo().equals(metodo) && r.ruta().equals(ruta)).findFirst().orElseThrow();
    }

    public static void main(String[] args) {
        int fallos = 0;
        System.out.println("ANTES (vulnerable): rol leído de la cabecera X-Rol");
        int truco = antes(Map.of("X-Rol", "admin"), "DELETE", "/pedidos");
        System.out.println("  ana (cliente) envía X-Rol: admin y DELETE /pedidos -> " + truco + "   <- escalada de privilegios");
        if (truco != 200) fallos++;

        Token anaWeb = new Token("ana", Set.of("cliente"), Set.of("pedidos:leer", "pedidos:crear"));
        Token anaWidget = new Token("ana", Set.of("cliente"), Set.of("pedidos:leer"));
        Token sofia = new Token("sofia", Set.of("soporte"), Set.of("pedidos:leer", "pedidos:reembolsar", "pedidos:borrar"));
        Token root = new Token("root", Set.of("admin"), Set.of("pedidos:leer", "pedidos:crear", "pedidos:reembolsar", "pedidos:borrar"));
        Map<String, Token> tokens = new LinkedHashMap<>();
        tokens.put("anónimo", null);
        tokens.put("ana · app web", anaWeb);
        tokens.put("ana · widget", anaWidget);
        tokens.put("sofia · soporte", sofia);
        tokens.put("root · admin", root);

        System.out.println("DESPUÉS (seguro): permiso del rol ∩ scope del token");
        System.out.printf("  %-17s", "");
        REGLAS.forEach(r -> System.out.print("  " + r.metodo() + " " + r.ruta()));
        System.out.println();
        Map<String, List<Integer>> esperado = Map.of(
                "anónimo", List.of(401, 401, 401, 401),
                "ana · app web", List.of(200, 200, 403, 403),
                "ana · widget", List.of(200, 403, 403, 403),
                "sofia · soporte", List.of(200, 403, 200, 403),
                "root · admin", List.of(200, 200, 200, 200));
        for (var e : tokens.entrySet()) {
            System.out.printf("  %-17s", e.getKey());
            for (int i = 0; i < REGLAS.size(); i++) {
                Regla r = REGLAS.get(i);
                int c = despues(e.getValue(), r.metodo(), r.ruta());
                String cabecera = r.metodo() + " " + r.ruta();
                System.out.print("  " + String.format("%-" + cabecera.length() + "s", c));
                if (c != esperado.get(e.getKey()).get(i)) fallos++;
            }
            System.out.println();
        }
        System.out.println("  (sofia tiene el scope pedidos:borrar, pero su rol no lo concede: 403)");
        System.out.println(fallos == 0 ? "OK: 20 decisiones coinciden con la tabla esperada" : "FALLA: " + fallos);
        System.exit(fallos == 0 ? 0 : 1);
    }
}
