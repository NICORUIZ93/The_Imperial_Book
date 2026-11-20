// Módulo 0.5 · «Hola Mundo» como servidor HTTP en Java, solo con el JDK (sin Spring todavía).
// Requisitos: JDK 25 LTS. Usa com.sun.net.httpserver, incluido en el JDK desde Java 6. Sin dependencias.
// Ejecuta (desde la carpeta java/):  java HolaServidor.java     y prueba:  curl http://localhost:8080/hola

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

public class HolaServidor {

    // Crea el servidor en el puerto indicado (0 = uno libre, útil en los tests) y lo arranca.
    public static HttpServer iniciar(int puerto) throws IOException {
        HttpServer servidor = HttpServer.create(new InetSocketAddress(puerto), 0);
        servidor.createContext("/hola", intercambio -> {
            byte[] cuerpo = "Hola Mundo desde Java\n".getBytes(StandardCharsets.UTF_8);
            intercambio.getResponseHeaders().add("Content-Type", "text/plain; charset=utf-8");
            intercambio.sendResponseHeaders(200, cuerpo.length);
            try (OutputStream salida = intercambio.getResponseBody()) {
                salida.write(cuerpo);
            }
        });
        servidor.start();
        return servidor;
    }

    public static void main(String[] args) throws IOException {
        // El puerto llega por variable de entorno (Módulo 0.4); 8080 si no existe.
        int puerto = Integer.parseInt(System.getenv().getOrDefault("PUERTO", "8080"));
        iniciar(puerto);
        System.out.println("Servidor Java escuchando en http://localhost:" + puerto + "/hola");
    }
}
