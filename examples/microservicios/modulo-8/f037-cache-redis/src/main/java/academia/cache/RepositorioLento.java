package academia.cache;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.stereotype.Component;

/** Hace de base de datos: tarda 200 ms por consulta y cuenta cuántas veces la llamaron. */
@Component
public class RepositorioLento {

    private final Map<Long, Producto> filas = new ConcurrentHashMap<>(Map.of(
            1L, new Producto(1, "Teclado", 100),
            2L, new Producto(2, "Ratón", 50)));
    private final AtomicInteger consultas = new AtomicInteger();

    public Producto buscar(long id) {
        consultas.incrementAndGet();
        dormir(200);
        Producto p = filas.get(id);
        if (p == null) {
            throw new IllegalArgumentException("No existe el producto " + id);
        }
        return p;
    }

    public void guardar(Producto p) {
        filas.put(p.id(), p);
    }

    public int consultas() {
        return consultas.get();
    }

    public void reiniciarContador() {
        consultas.set(0);
    }

    private static void dormir(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
