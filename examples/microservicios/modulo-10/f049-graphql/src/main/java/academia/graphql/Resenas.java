package academia.graphql;

import academia.graphql.Modelo.Resena;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * Simula el servicio de reseñas. Cuenta cuántas veces lo llaman para que VEAS el problema N+1.
 */
@Component
class Resenas {

    private final List<Resena> resenas = new CopyOnWriteArrayList<>(List.of(
            new Resena("CAFE", 5, "Aroma increíble"),
            new Resena("CAFE", 4, null),
            new Resena("TAZA", 3, "Se despicó")));
    final AtomicInteger llamadas = new AtomicInteger();

    /** UNA llamada para muchos productos (lo que usa @BatchMapping). */
    Map<String, List<Resena>> deVarios(Collection<String> skus) {
        llamadas.incrementAndGet();
        return resenas.stream().filter(r -> skus.contains(r.sku())).collect(Collectors.groupingBy(Resena::sku));
    }

    Resena agregar(String sku, int estrellas, String comentario) {
        Resena r = new Resena(sku, estrellas, comentario);
        resenas.add(r);
        return r;
    }
}
