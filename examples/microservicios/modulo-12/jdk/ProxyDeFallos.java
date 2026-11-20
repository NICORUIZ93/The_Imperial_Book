// Proxy TCP que inyecta fallos entre un cliente y un servicio (solo JDK 25).
// Imita los "toxics" de Toxiproxy que usa el Módulo 8, para poder ver los fallos sin Docker:
//   latencia(ms)            ~ toxic "latency"            (retrasa la respuesta)
//   caer() / levantar()     ~ POST /proxies/{p} {"enabled":false|true}  (conexión rechazada)
//   colgar()                ~ toxic "timeout" con timeout=0 (acepta y nunca responde)
//   intermitente(p, semilla)~ toxic "reset_peer" con toxicity=p (corta algunas conexiones)
//   restablecer()           ~ POST /reset
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

public class ProxyDeFallos implements AutoCloseable {

    private final int puertoServicio;
    private volatile ServerSocket escucha;
    private final int puerto;
    private volatile long latenciaMs;
    private volatile boolean colgado;
    private volatile double probabilidadCorte;
    private volatile Random azar = new Random(42);
    private final Set<Socket> activas = ConcurrentHashMap.newKeySet();

    public ProxyDeFallos(int puertoServicio) throws IOException {
        this.puertoServicio = puertoServicio;
        this.escucha = new ServerSocket(0, 50, java.net.InetAddress.getLoopbackAddress());
        this.puerto = escucha.getLocalPort();
        aceptar(escucha);
    }

    public int puerto() { return puerto; }
    public String url() { return "http://127.0.0.1:" + puerto; }

    // Cada cambio de "toxic" cierra las conexiones abiertas: así el cliente no reutiliza una
    // conexión keep-alive vieja y el fallo nuevo se aplica desde la siguiente petición.
    public void latencia(long ms) { latenciaMs = ms; cortarActivas(); }
    public void colgar() { colgado = true; cortarActivas(); }
    public void intermitente(double p, long semilla) { probabilidadCorte = p; azar = new Random(semilla); cortarActivas(); }

    /** Cierra el puerto y las conexiones abiertas: los clientes reciben "Connection refused". */
    public synchronized void caer() throws IOException { escucha.close(); cortarActivas(); }

    private void cortarActivas() {
        for (Socket s : activas) {
            try { s.close(); } catch (IOException ignorada) { }
        }
        activas.clear();
    }

    /** Vuelve a abrir el MISMO puerto. */
    public synchronized void levantar() throws IOException {
        if (!escucha.isClosed()) return;
        ServerSocket s = new ServerSocket();
        s.setReuseAddress(true);
        s.bind(new InetSocketAddress(java.net.InetAddress.getLoopbackAddress(), puerto));
        escucha = s;
        aceptar(s);
    }

    public void restablecer() throws IOException {
        latenciaMs = 0; colgado = false; probabilidadCorte = 0;
        cortarActivas();
        levantar();
    }

    private void aceptar(ServerSocket s) {
        Thread.ofVirtual().start(() -> {
            while (!s.isClosed()) {
                try {
                    Socket cliente = s.accept();
                    if (s.isClosed()) { cliente.close(); return; }    // llegó justo al caer
                    Thread.ofVirtual().start(() -> atender(cliente));
                } catch (IOException e) {
                    return;                                   // el puerto se cerró (caer)
                }
            }
        });
    }

    private void atender(Socket cliente) {
        activas.add(cliente);
        try (cliente) {
            if (probabilidadCorte > 0 && azar.nextDouble() < probabilidadCorte) {
                cliente.setSoLinger(true, 0);                 // cierre con RST: "Connection reset"
                return;
            }
            if (colgado) {                                    // acepta, lee y nunca contesta
                cliente.getInputStream().transferTo(OutputStream.nullOutputStream());
                return;
            }
            try (Socket servicio = new Socket("127.0.0.1", puertoServicio)) {
                Thread subida = Thread.ofVirtual().start(() -> copiar(cliente, servicio, 0));
                copiar(servicio, cliente, latenciaMs);        // la latencia se aplica a la respuesta
                subida.join(1000);
            }
        } catch (Exception ignorada) {
            // conexión cortada por una de las partes: es lo esperado en un proxy de fallos
        } finally {
            activas.remove(cliente);
        }
    }

    private static void copiar(Socket origen, Socket destino, long retrasoMs) {
        try {
            InputStream in = origen.getInputStream();
            OutputStream out = destino.getOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) != -1) {
                if (retrasoMs > 0) Thread.sleep(retrasoMs);       // como Toxiproxy: cada bloque se retrasa
                out.write(buf, 0, n);
                out.flush();
            }
            destino.shutdownOutput();
        } catch (Exception ignorada) {
            // fin de la conexión
        }
    }

    @Override
    public void close() throws IOException { escucha.close(); }
}
