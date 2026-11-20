package academia.graphql;

import academia.graphql.Modelo.Producto;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

/** Catálogo en memoria (en un sistema real: el servicio de catálogo o su base de datos). */
@Component
class Catalogo {

    private final List<Producto> productos = List.of(
            new Producto("CAFE", "Café de Huila 500 g", 32_000),
            new Producto("TAZA", "Taza de barro", 18_500),
            new Producto("FILTRO", "Filtro de tela", 9_000));

    List<Producto> todos() {
        return productos;
    }

    Optional<Producto> porSku(String sku) {
        return productos.stream().filter(p -> p.sku().equals(sku)).findFirst();
    }
}
