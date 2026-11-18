package com.example.demo;
import org.springframework.web.method.annotation.HandlerMethodValidationException;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> manejarValidacion(
            MethodArgumentNotValidException ex) {
        Map<String, String> campos = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                campos.putIfAbsent(error.getField(), error.getDefaultMessage()));

        ApiError cuerpo = new ApiError(
                "VALIDACION",
                "Revisa los campos indicados.",
                campos);
        return ResponseEntity.badRequest().body(cuerpo);
    }
    @ExceptionHandler(TareaNoEncontradaException.class)
    public ResponseEntity<ApiError> manejarTareaAusente(TareaNoEncontradaException ex) {
        return ResponseEntity.status(404).body(new ApiError("TAREA_NO_ENCONTRADA", ex.getMessage(), Map.of()));
    }

@ExceptionHandler(HandlerMethodValidationException.class)
public ResponseEntity<ApiError> manejarParametroInvalido(
        HandlerMethodValidationException ex) {
    ApiError cuerpo = new ApiError(
            "VALIDACION",
            "Usa page entre 0 y 1000, y size entre 1 y 50.",
            Map.of());
    return ResponseEntity.badRequest().body(cuerpo);
}


@ExceptionHandler(LimiteParadasExcedidoException.class)
public ResponseEntity<ApiError> manejarLimiteParadas(LimiteParadasExcedidoException ex) {
    ApiError cuerpo = new ApiError("LIMITE_PARADAS", ex.getMessage(), Map.of());
    return ResponseEntity.unprocessableEntity().body(cuerpo);
}

}
