// F067 · mTLS — lo que el sidecar de la malla (Istio/Linkerd) hace por ti, a mano con JDK 25.
// Antes: pedidos -> pagos por HTTP plano; un "espía" en la red lee el token.
// Después: TLS mutuo; pagos exige un certificado de cliente firmado por la CA de la malla
// y lee la identidad SPIFFE del que llama. Requiere ./generar-certs.sh (crea target/certs).
// Ejecuta:  ./generar-certs.sh && java MtlsDemo.java
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpsConfigurator;
import com.sun.net.httpserver.HttpsExchange;
import com.sun.net.httpserver.HttpsParameters;
import com.sun.net.httpserver.HttpsServer;
import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.security.cert.X509Certificate;
import java.util.List;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLParameters;
import javax.net.ssl.TrustManagerFactory;

public class MtlsDemo {

    static final char[] CLAVE = "cambiala".toCharArray();
    static final String CERTS = "target/certs/";

    // Proxy TCP que copia los bytes en ambos sentidos y guarda lo que ve (un espía en la red).
    static class Espia implements AutoCloseable {
        final ServerSocket escucha = new ServerSocket(0, 50, java.net.InetAddress.getLoopbackAddress());
        final ByteArrayOutputStream visto = new ByteArrayOutputStream();
        Espia(int destino) throws IOException {
            Thread.ofVirtual().start(() -> {
                while (!escucha.isClosed()) {
                    try {
                        Socket c = escucha.accept();
                        Socket s = new Socket("127.0.0.1", destino);
                        Thread.ofVirtual().start(() -> copiar(c, s, true));
                        Thread.ofVirtual().start(() -> copiar(s, c, false));
                    } catch (IOException e) { return; }
                }
            });
        }
        void copiar(Socket de, Socket a, boolean registrar) {
            try (InputStream in = de.getInputStream(); OutputStream out = a.getOutputStream()) {
                byte[] b = new byte[8192];
                for (int n; (n = in.read(b)) > 0; ) {
                    if (registrar) synchronized (visto) { visto.write(b, 0, n); }
                    out.write(b, 0, n);
                    out.flush();
                }
            } catch (IOException ignorada) {
            } finally {
                try { de.close(); a.close(); } catch (IOException ignorada) { }
            }
        }
        int puerto() { return escucha.getLocalPort(); }
        byte[] bytes() { synchronized (visto) { return visto.toByteArray(); } }
        public void close() throws IOException { escucha.close(); }
    }

    static KeyStore almacen(String archivo) throws Exception {
        KeyStore ks = KeyStore.getInstance("PKCS12");
        try (var in = new FileInputStream(CERTS + archivo)) { ks.load(in, CLAVE); }
        return ks;
    }

    static SSLContext contexto(String identidad) throws Exception {
        KeyManagerFactory kmf = null;
        if (identidad != null) {
            kmf = KeyManagerFactory.getInstance("PKIX");
            kmf.init(almacen(identidad), CLAVE);
        }
        TrustManagerFactory tmf = TrustManagerFactory.getInstance("PKIX");
        tmf.init(almacen("confianza.p12"));                       // solo confío en la CA de la malla
        SSLContext ctx = SSLContext.getInstance("TLSv1.3");
        ctx.init(kmf == null ? null : kmf.getKeyManagers(), tmf.getTrustManagers(), null);
        return ctx;
    }

    static String pedir(HttpClient http, String url) {
        try {
            HttpResponse<String> r = http.send(HttpRequest.newBuilder(URI.create(url))
                    .header("Authorization", "Bearer tok-ana-123").build(), HttpResponse.BodyHandlers.ofString());
            return r.statusCode() + " " + r.body();
        } catch (Exception e) {
            Throwable t = e;
            while (t.getCause() != null) t = t.getCause();
            return "conexión rechazada: " + t.getClass().getSimpleName() + ": " + t.getMessage();
        }
    }

    public static void main(String[] args) throws Exception {
        int fallos = 0;

        // ---------- ANTES (vulnerable): HTTP plano entre servicios ----------
        HttpServer plano = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        plano.createContext("/cobros", ex -> {
            byte[] b = "cobro aceptado".getBytes(StandardCharsets.UTF_8);
            ex.sendResponseHeaders(200, b.length); ex.getResponseBody().write(b); ex.close();
        });
        plano.start();
        try (Espia espia = new Espia(plano.getAddress().getPort())) {
            String r = pedir(HttpClient.newHttpClient(), "http://127.0.0.1:" + espia.puerto() + "/cobros");
            String capturado = new String(espia.bytes(), StandardCharsets.ISO_8859_1);
            System.out.println("ANTES (vulnerable): HTTP plano pedidos -> pagos: " + r);
            String linea = capturado.lines().filter(l -> l.startsWith("Authorization")).findFirst().orElse("(nada)");
            System.out.println("  el espía de la red lee: " + linea);
            if (!linea.contains("tok-ana-123")) fallos++;
        }
        plano.stop(0);

        // ---------- DESPUÉS (seguro): TLS mutuo ----------
        HttpsServer pagos = HttpsServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        pagos.setHttpsConfigurator(new HttpsConfigurator(contexto("pagos.p12")) {
            @Override public void configure(HttpsParameters p) {
                SSLParameters sp = getSSLContext().getDefaultSSLParameters();
                sp.setNeedClientAuth(true);                         // la "M" de mTLS: el cliente también se identifica
                sp.setProtocols(new String[] {"TLSv1.3"});
                p.setSSLParameters(sp);
            }
        });
        pagos.createContext("/cobros", ex -> {
            X509Certificate cliente = (X509Certificate) ((HttpsExchange) ex).getSSLSession().getPeerCertificates()[0];
            String spiffe = "";
            try {
                for (List<?> san : cliente.getSubjectAlternativeNames()) if ((Integer) san.get(0) == 6) spiffe = (String) san.get(1);
            } catch (Exception ignorada) { }
            byte[] b = ("cobro aceptado para " + spiffe).getBytes(StandardCharsets.UTF_8);
            ex.sendResponseHeaders(200, b.length); ex.getResponseBody().write(b); ex.close();
        });
        pagos.start();
        System.out.println("DESPUÉS (seguro): mTLS (TLSv1.3, certificados de la CA malla-ca)");
        try (Espia espia = new Espia(pagos.getAddress().getPort())) {
            String url = "https://127.0.0.1:" + espia.puerto() + "/cobros";
            String conCert = pedir(HttpClient.newBuilder().sslContext(contexto("pedidos.p12")).build(), url);
            String sinCert = pedir(HttpClient.newBuilder().sslContext(contexto(null)).build(), url);
            String intruso = pedir(HttpClient.newBuilder().sslContext(contexto("intruso.p12")).build(), url);
            System.out.println("  pedidos con certificado de la malla -> " + conCert);
            System.out.println("  cliente sin certificado             -> " + sinCert);
            System.out.println("  intruso con certificado autofirmado -> " + intruso);
            byte[] b = espia.bytes();
            String capturado = new String(b, StandardCharsets.ISO_8859_1);
            System.out.printf("  el espía ve un registro TLS (primer byte 0x%02x = handshake) y \"tok-ana-123\" legible: %s%n",
                    b[0], capturado.contains("tok-ana-123"));
            if (!conCert.startsWith("200") || !sinCert.startsWith("conexión rechazada")
                    || !intruso.startsWith("conexión rechazada") || capturado.contains("tok-ana-123") || b[0] != 0x16) fallos++;
        }
        pagos.stop(0);
        System.out.println(fallos == 0 ? "OK: solo el cliente con certificado de la malla habla con pagos y nadie lee el tráfico" : "FALLA: " + fallos);
        System.exit(fallos == 0 ? 0 : 1);
    }
}
