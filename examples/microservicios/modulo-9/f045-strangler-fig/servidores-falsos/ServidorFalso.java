import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

/**
 * Hace de «monolito» o de «servicio nuevo» en el laboratorio F045 (Java puro, sin dependencias).
 * Uso: java ServidorFalso.java <nombre> <puerto>     p. ej. java ServidorFalso.java monolito 8081
 * Responde a cualquier ruta con «<nombre> atendió GET /ruta».
 */
public class ServidorFalso {

    public static void main(String[] args) throws Exception {
        String nombre = args[0];
        int puerto = Integer.parseInt(args[1]);
        HttpServer servidor = HttpServer.create(new InetSocketAddress("127.0.0.1", puerto), 0);
        servidor.createContext("/", ex -> {
            String texto = nombre + " atendió " + ex.getRequestMethod() + " " + ex.getRequestURI().getPath();
            byte[] cuerpo = texto.getBytes(StandardCharsets.UTF_8);
            ex.getResponseHeaders().set("Content-Type", "text/plain; charset=utf-8");
            ex.sendResponseHeaders(200, cuerpo.length);
            ex.getResponseBody().write(cuerpo);
            ex.close();
        });
        servidor.start();
        System.out.println(nombre + " escuchando en http://127.0.0.1:" + puerto);
    }
}
