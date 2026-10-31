package com.academia.rutaflow.envio;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.academia.rutaflow.consumer.RutaProjection;
import com.academia.rutaflow.consumer.RuteoService;
import com.academia.rutaflow.event.EnvioCreado;

@RestController
@RequestMapping("/envios")
public class EnvioController {
    private final CrearEnvioService crearEnvioService;
    private final RuteoService ruteoService;

    public EnvioController(CrearEnvioService crearEnvioService, RuteoService ruteoService) {
        this.crearEnvioService = crearEnvioService;
        this.ruteoService = ruteoService;
    }

    @PostMapping
    ResponseEntity<CrearEnvioResponse> crear(@RequestBody CrearEnvioRequest request) {
        if (request == null) {
            throw new InvalidEnvioException("El cuerpo de la solicitud es obligatorio");
        }
        EnvioCreado evento = crearEnvioService.crear(request.referencia());
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(new CrearEnvioResponse(evento.envioId(), evento.eventId()));
    }

    @GetMapping("/{envioId}/ruta")
    ResponseEntity<RutaProjection> consultarRuta(@PathVariable UUID envioId) {
        return ResponseEntity.of(ruteoService.consultar(envioId));
    }

    public record CrearEnvioRequest(String referencia) {
    }

    public record CrearEnvioResponse(UUID envioId, UUID eventId) {
    }
}
