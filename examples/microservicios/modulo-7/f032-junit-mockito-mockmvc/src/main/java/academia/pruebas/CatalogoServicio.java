package academia.pruebas;

import org.springframework.stereotype.Service;

/** Reglas: 10 % de descuento desde 10 unidades; cantidad > 0; no se reserva más que el stock. */
@Service
public class CatalogoServicio {

    private final ProductoRepositorio repositorio;

    public CatalogoServicio(ProductoRepositorio repositorio) {
        this.repositorio = repositorio;
    }

    public Cotizacion cotizar(long id, int cantidad) {
        if (cantidad <= 0) {
            throw new PeticionInvalida("La cantidad debe ser mayor que 0");
        }
        Producto p = repositorio.buscar(id).orElseThrow(() -> new ProductoNoEncontrado(id));
        int bruto = p.precio() * cantidad;
        int total = cantidad >= 10 ? bruto * 90 / 100 : bruto;
        return new Cotizacion(id, cantidad, total);
    }

    public void reservar(long id, int cantidad) {
        Producto p = repositorio.buscar(id).orElseThrow(() -> new ProductoNoEncontrado(id));
        if (cantidad > p.stock()) {
            throw new PeticionInvalida("Solo quedan " + p.stock() + " unidades");
        }
        repositorio.guardar(new Producto(p.id(), p.nombre(), p.precio(), p.stock() - cantidad));
    }
}
