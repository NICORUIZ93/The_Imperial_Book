package academia.errores;

import java.net.URI;
import java.util.Map;
import java.util.TreeMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * @RestControllerAdvice = @ControllerAdvice + @ResponseBody: atrapa las excepciones
 * de TODOS los controladores y las convierte en respuestas RFC 9457 (application/problem+json).
 */
@RestControllerAdvice
class ManejadorGlobalDeErrores {

    private static final Logger log = LoggerFactory.getLogger(ManejadorGlobalDeErrores.class);

    @ExceptionHandler(ProductoNoEncontradoException.class)
    ProblemDetail noEncontrado(ProductoNoEncontradoException ex) {
        ProblemDetail problema = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problema.setTitle("Producto no encontrado");
        problema.setType(URI.create("https://tienda.example/errores/producto-no-encontrado"));
        problema.setProperty("sku", ex.sku());
        return problema;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ProblemDetail datosInvalidos(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new TreeMap<>();
        ex.getBindingResult().getFieldErrors()
            .forEach(e -> errores.put(e.getField(), e.getDefaultMessage()));
        ProblemDetail problema = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,
            "La petición tiene " + errores.size() + " campo(s) inválido(s)");
        problema.setTitle("Datos inválidos");
        problema.setProperty("errores", errores);
        return problema;
    }

    @ExceptionHandler(Exception.class)
    ProblemDetail inesperado(Exception ex) {
        log.error("Error no controlado", ex);               // el detalle va al log, no al cliente
        ProblemDetail problema = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR,
            "Ocurrió un error interno. Si persiste, comparte este código con soporte.");
        problema.setTitle("Error interno");
        return problema;
    }
}
