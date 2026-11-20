package academia.patrones;

import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

/** La fuente de verdad: PostgreSQL. Cuenta lecturas y escrituras para que los tests vean cada patrón. */
@Component
public class BaseDeDatos {

    private final JdbcClient jdbc;
    private final TransactionTemplate tx;
    final AtomicInteger lecturas = new AtomicInteger();
    final AtomicInteger escrituras = new AtomicInteger();

    BaseDeDatos(JdbcClient jdbc, TransactionTemplate tx) {
        this.jdbc = jdbc;
        this.tx = tx;
    }

    public Producto leer(long id) {
        lecturas.incrementAndGet();
        return jdbc.sql("SELECT id, nombre, precio FROM producto WHERE id = ?").param(id)
                .query(Producto.class).single();
    }

    public void cambiarPrecio(long id, int precio) {
        escrituras.incrementAndGet();
        jdbc.sql("UPDATE producto SET precio = ? WHERE id = ?").params(precio, id).update();
    }

    /** Un lote = UNA transacción, por muchos cambios que traiga. */
    public void cambiarPrecios(Map<Long, Integer> cambios) {
        escrituras.incrementAndGet();
        tx.executeWithoutResult(estado -> cambios.forEach((id, precio) ->
                jdbc.sql("UPDATE producto SET precio = ? WHERE id = ?").params(precio, id).update()));
    }
}
