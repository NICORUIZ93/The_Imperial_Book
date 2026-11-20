// Test de HolaServidor.java sin librerías: arranca el servidor en un puerto libre y le hace un GET.
// Requisitos: JDK 25 LTS. Ejecuta (desde la carpeta java/):  java HolaServidorTest.java

import com.sun.net.httpserver.HttpServer;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class HolaServidorTest {
    public static void main(String[] args) throws Exception {
        HttpServer servidor = HolaServidor.iniciar(0);
        int puerto = servidor.getAddress().getPort();
        int fallos = 0;
        try (HttpClient cliente = HttpClient.newHttpClient()) {
            HttpResponse<String> r = cliente.send(
                    HttpRequest.newBuilder(URI.create("http://localhost:" + puerto + "/hola")).build(),
                    HttpResponse.BodyHandlers.ofString());
            boolean estado = r.statusCode() == 200;
            boolean cuerpo = r.body().equals("Hola Mundo desde Java\n");
            System.out.println((estado ? "✔" : "✖") + " GET /hola responde 200");
            System.out.println((cuerpo ? "✔" : "✖") + " el cuerpo es «Hola Mundo desde Java»");
            if (!estado) fallos++;
            if (!cuerpo) fallos++;
        } finally {
            servidor.stop(0);
        }
        System.out.println(fallos == 0 ? "Java: todos los tests pasaron" : "Java: " + fallos + " test(s) fallaron");
        System.exit(fallos == 0 ? 0 : 1);
    }
}
