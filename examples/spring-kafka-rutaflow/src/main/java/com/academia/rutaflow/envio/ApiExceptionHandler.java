package com.academia.rutaflow.envio;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(InvalidEnvioException.class)
    ResponseEntity<ApiError> invalidEnvio(InvalidEnvioException exception) {
        return ResponseEntity.badRequest().body(new ApiError(HttpStatus.BAD_REQUEST.value(), exception.getMessage()));
    }

    public record ApiError(int status, String message) {
    }
}
