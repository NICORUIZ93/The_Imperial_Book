import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

/**
 * Inventario de mentira para el laboratorio F047 (Java puro, sin dependencias).
 * Uso: java InventarioFalso.java [puerto]   (por defecto 9091)
 *   GET /inventario/CAFE  -> 200 {"sku":"CAFE","disponibles":12}
 *   GET /inventario/LENTO -> tarda 2 s (para probar timeouts)
 *   GET /inventario/otro  -> 404
 */
public class InventarioFalso {

    public static void main(String[] args) throws Exception {
        int puerto = args.length > 0 ? Integer.parseInt(args[0]) : 9091;
        HttpServer servidor = HttpServer.create(new InetSocketAddress("127.0.0.1", puerto), 0);
        servidor.createContext("/inventario/", ex -> {
            String sku = ex.getRequestURI().getPath().substring("/inventario/".length());
            System.out.println("inventario: GET " + sku);
            if (sku.equals("LENTO")) {
                try {
                    Thread.sleep(2_000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
            int codigo = sku.equals("CAFE") || sku.equals("LENTO") ? 200 : 404;
            String cuerpo = codigo == 200 ? "{\"sku\":\"" + sku + "\",\"disponibles\":12}" : "{\"error\":\"no existe\"}";
            byte[] bytes = cuerpo.getBytes(StandardCharsets.UTF_8);
            ex.getResponseHeaders().set("Content-Type", "application/json");
            ex.sendResponseHeaders(codigo, bytes.length);
            ex.getResponseBody().write(bytes);
            ex.close();
        });
        servidor.start();
        System.out.println("Inventario falso escuchando en http://127.0.0.1:" + puerto);
    }
}
