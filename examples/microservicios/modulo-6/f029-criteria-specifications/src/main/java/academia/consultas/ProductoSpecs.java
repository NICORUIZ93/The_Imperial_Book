package academia.consultas;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

/**
 * Cada método es UNA condición reutilizable (un pedazo de WHERE) escrita con Criteria API.
 * Specification.allOf(...) las une con AND solo si el filtro trae ese dato.
 */
public final class ProductoSpecs {
    private ProductoSpecs() { }

    static Specification<Producto> nombreContiene(String texto) {
        return (root, query, cb) -> cb.like(cb.lower(root.<String>get("nombre")), "%" + texto.toLowerCase() + "%");
    }

    static Specification<Producto> categoriaEs(String categoria) {
        return (root, query, cb) -> cb.equal(root.get("categoria"), categoria);
    }

    static Specification<Producto> precioDesde(BigDecimal minimo) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.<BigDecimal>get("precio"), minimo);
    }

    static Specification<Producto> precioHasta(BigDecimal maximo) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.<BigDecimal>get("precio"), maximo);
    }

    static Specification<Producto> activo() {
        return (root, query, cb) -> cb.isTrue(root.<Boolean>get("activo"));
    }

    public static Specification<Producto> desde(FiltroProductos f) {
        List<Specification<Producto>> condiciones = new ArrayList<>();
        if (f.texto() != null && !f.texto().isBlank()) condiciones.add(nombreContiene(f.texto()));
        if (f.categoria() != null) condiciones.add(categoriaEs(f.categoria()));
        if (f.precioMin() != null) condiciones.add(precioDesde(f.precioMin()));
        if (f.precioMax() != null) condiciones.add(precioHasta(f.precioMax()));
        if (Boolean.TRUE.equals(f.soloActivos())) condiciones.add(activo());
        return Specification.allOf(condiciones);   // lista vacía = sin WHERE
    }
}
