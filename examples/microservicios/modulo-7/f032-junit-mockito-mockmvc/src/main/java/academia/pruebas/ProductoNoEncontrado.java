package academia.pruebas;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ProductoNoEncontrado extends RuntimeException {
    public ProductoNoEncontrado(long id) {
        super("No existe el producto " + id);
    }
}
