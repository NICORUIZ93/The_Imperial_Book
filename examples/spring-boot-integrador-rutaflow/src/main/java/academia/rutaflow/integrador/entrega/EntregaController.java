package academia.rutaflow.integrador.entrega;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/entregas")
public class EntregaController {
    private final EntregaService entregas;

    public EntregaController(EntregaService entregas) {
        this.entregas = entregas;
    }

    @PostMapping
    public ResponseEntity<EntregaResponse> crear(@Valid @RequestBody CrearEntregaRequest solicitud) {
        Entrega creada = entregas.crear(solicitud.destinatario().trim());
        var ubicacion = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}").buildAndExpand(creada.getId()).toUri();
        return ResponseEntity.created(ubicacion).body(EntregaResponse.desde(creada));
    }
}
