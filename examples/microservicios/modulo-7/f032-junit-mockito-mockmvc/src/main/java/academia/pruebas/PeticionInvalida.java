package academia.pruebas;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class PeticionInvalida extends RuntimeException {
    public PeticionInvalida(String mensaje) {
        super(mensaje);
    }
}
