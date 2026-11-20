package academia.graphql;

import academia.graphql.Modelo.Producto;
import academia.graphql.Modelo.Resena;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.BatchMapping;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

/** Cada método resuelve un campo del esquema. El cliente decide qué campos pide; solo esos se resuelven. */
@Controller
class CatalogoController {

    private final Catalogo catalogo;
    private final Resenas resenas;

    CatalogoController(Catalogo catalogo, Resenas resenas) {
        this.catalogo = catalogo;
        this.resenas = resenas;
    }

    @QueryMapping
    List<Producto> productos() {
        return catalogo.todos();
    }

    @QueryMapping
    Producto producto(@Argument String sku) {
        return catalogo.porSku(sku).orElse(null);   // null => "producto": null en la respuesta
    }

    /** Resuelve Producto.resenas para TODOS los productos de la respuesta en una sola llamada (evita N+1). */
    @BatchMapping
    Map<Producto, List<Resena>> resenas(List<Producto> productos) {
        Map<String, List<Resena>> porSku = resenas.deVarios(productos.stream().map(Producto::sku).toList());
        return productos.stream().collect(Collectors.toMap(Function.identity(),
                p -> porSku.getOrDefault(p.sku(), List.of())));
    }

    @MutationMapping
    Resena calificar(@Argument String sku, @Argument int estrellas, @Argument String comentario) {
        if (estrellas < 1 || estrellas > 5) {
            throw new IllegalArgumentException("las estrellas van de 1 a 5");
        }
        return resenas.agregar(sku, estrellas, comentario);
    }
}
