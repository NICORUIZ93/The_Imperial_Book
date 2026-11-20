// F061 · Spring Security: filter chain — la misma idea con solo JDK 25 (sin Spring).
// com.sun.net.httpserver permite encadenar Filter antes del handler, igual que el
// FilterChainProxy de Spring Security encadena sus filtros antes del DispatcherServlet.
// Ejecuta:  java CadenaDeFiltros.java
import com.sun.net.httpserver.Filter;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.spec.KeySpec;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

public class CadenaDeFiltros {

    // Usuario guardado como en una base de datos: sal + hash PBKDF2, nunca la contraseña.
    record Usuario(String nombre, byte[] sal, byte[] hash, Set<String> roles) { }
    // Lo que un filtro deja "en el contexto" para los siguientes (SecurityContextHolder en Spring).
    record Identidad(String nombre, Set<String> roles) { }

    static class NoAutenticado extends RuntimeException { }   // ~ AuthenticationException
    static class AccesoDenegado extends RuntimeException { }  // ~ AccessDeniedException

    static byte[] pbkdf2(char[] clave, byte[] sal) throws Exception {
        KeySpec spec = new PBEKeySpec(clave, sal, 210_000, 256);
        return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();
    }

    static Usuario usuario(String nombre, String clave, Set<String> roles) throws Exception {
        byte[] sal = nombre.getBytes(StandardCharsets.UTF_8); // demo: en real, sal aleatoria por usuario
        return new Usuario(nombre, sal, pbkdf2(clave.toCharArray(), sal), roles);
    }

    // 1 · Traducción de excepciones (ExceptionTranslationFilter): envuelve al resto de la cadena.
    static Filter traduccionDeExcepciones() {
        return new Filter() {
            public void doFilter(HttpExchange ex, Chain chain) throws IOException {
                try {
                    chain.doFilter(ex);
                } catch (NoAutenticado e) {
                    ex.getResponseHeaders().add("WWW-Authenticate", "Basic realm=\"tienda\"");
                    responder(ex, 401, "");
                } catch (AccesoDenegado e) {
                    responder(ex, 403, "");
                }
            }
            public String description() { return "ExceptionTranslation"; }
        };
    }

    // 2 · Autenticación HTTP Basic (BasicAuthenticationFilter): lee la cabecera y comprueba el hash.
    static Filter autenticacionBasica(Map<String, Usuario> usuarios) {
        return new Filter() {
            public void doFilter(HttpExchange ex, Chain chain) throws IOException {
                String cabecera = ex.getRequestHeaders().getFirst("Authorization");
                if (cabecera != null && cabecera.startsWith("Basic ")) {
                    String[] partes = new String(Base64.getDecoder().decode(cabecera.substring(6)),
                            StandardCharsets.UTF_8).split(":", 2);
                    Usuario u = usuarios.get(partes[0]);
                    try {
                        if (u == null || partes.length < 2
                                || !MessageDigest.isEqual(u.hash(), pbkdf2(partes[1].toCharArray(), u.sal()))) {
                            throw new NoAutenticado();               // credencial presente pero mala
                        }
                    } catch (NoAutenticado e) { throw e; } catch (Exception e) { throw new IOException(e); }
                    ex.setAttribute("identidad", new Identidad(u.nombre(), u.roles()));
                }
                chain.doFilter(ex);                                    // sin cabecera: sigue como anónimo
            }
            public String description() { return "BasicAuthentication"; }
        };
    }

    // 3 · Autorización (AuthorizationFilter): reglas por ruta, en orden, la primera que coincide gana.
    static Filter autorizacion() {
        return new Filter() {
            public void doFilter(HttpExchange ex, Chain chain) throws IOException {
                String ruta = ex.getRequestURI().getPath();
                Identidad id = (Identidad) ex.getAttribute("identidad");
                if (ruta.startsWith("/publico")) {
                    chain.doFilter(ex);                                // permitAll()
                } else if (id == null) {
                    throw new NoAutenticado();                         // anónimo en ruta protegida
                } else if (ruta.startsWith("/admin") && !id.roles().contains("ADMIN")) {
                    throw new AccesoDenegado();                        // hasRole("ADMIN")
                } else {
                    chain.doFilter(ex);                                // authenticated()
                }
            }
            public String description() { return "Authorization"; }
        };
    }

    static void responder(HttpExchange ex, int codigo, String cuerpo) throws IOException {
        byte[] b = cuerpo.getBytes(StandardCharsets.UTF_8);
        ex.sendResponseHeaders(codigo, b.length == 0 ? -1 : b.length);
        if (b.length > 0) ex.getResponseBody().write(b);
        ex.close();
    }

    static HttpServer servidor(boolean conFiltros, Map<String, Usuario> usuarios) throws IOException {
        HttpServer s = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        for (String ruta : List.of("/publico", "/admin")) {
            var ctx = s.createContext(ruta, ex -> responder(ex, 200, "contenido de " + ruta));
            if (conFiltros) {
                ctx.getFilters().addAll(List.of(traduccionDeExcepciones(), autenticacionBasica(usuarios), autorizacion()));
            }
        }
        s.start();
        return s;
    }

    static String pedir(HttpClient http, int puerto, String ruta, String usuario, String clave) throws Exception {
        var req = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + puerto + ruta));
        if (usuario != null) {
            req.header("Authorization", "Basic " + Base64.getEncoder()
                    .encodeToString((usuario + ":" + clave).getBytes(StandardCharsets.UTF_8)));
        }
        HttpResponse<String> r = http.send(req.build(), HttpResponse.BodyHandlers.ofString());
        String extra = r.headers().firstValue("WWW-Authenticate").map(v -> "  WWW-Authenticate: " + v).orElse("");
        return r.statusCode() + extra;
    }

    public static void main(String[] args) throws Exception {
        Map<String, Usuario> usuarios = Map.of(
                "ana", usuario("ana", "clave-ana", Set.of("USER")),
                "root", usuario("root", "clave-root", Set.of("USER", "ADMIN")));
        HttpClient http = HttpClient.newHttpClient();
        int fallos = 0;

        HttpServer antes = servidor(false, usuarios);
        System.out.println("ANTES (vulnerable): sin cadena de filtros");
        String anonimoAdmin = pedir(http, antes.getAddress().getPort(), "/admin", null, null);
        System.out.println("  GET /admin   anónimo      -> " + anonimoAdmin + "   <- cualquiera entra");
        antes.stop(0);

        HttpServer despues = servidor(true, usuarios);
        int p = despues.getAddress().getPort();
        System.out.println("DESPUÉS (seguro): ExceptionTranslation -> BasicAuthentication -> Authorization -> handler");
        String[][] casos = {
                {"/publico", null, null, "200"},
                {"/admin", null, null, "401"},
                {"/admin", "ana", "mala", "401"},
                {"/admin", "ana", "clave-ana", "403"},
                {"/admin", "root", "clave-root", "200"},
        };
        for (String[] c : casos) {
            String r = pedir(http, p, c[0], c[1], c[2]);
            String quien = c[1] == null ? "anónimo" : c[1] + ":" + c[2];
            System.out.printf("  GET %-9s %-16s -> %s%n", c[0], quien, r);
            if (!r.startsWith(c[3])) { fallos++; System.out.println("    FALLA: se esperaba " + c[3]); }
        }
        despues.stop(0);
        if (!anonimoAdmin.startsWith("200")) fallos++;
        System.out.println(fallos == 0 ? "OK: la cadena responde 401 sin identidad y 403 sin el rol" : "FALLA: " + fallos);
        System.exit(fallos == 0 ? 0 : 1);
    }
}
