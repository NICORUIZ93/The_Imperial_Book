package academia.stampede;

import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.stereotype.Component;

/** Consulta cara: 200 ms. Cuenta cuántas veces la llamaron. */
@Component
public class BaseLenta {

    final AtomicInteger consultas = new AtomicInteger();

    public String descripcion(long id) {
        consultas.incrementAndGet();
        try {
            Thread.sleep(200);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return "producto-" + id;
    }
}
