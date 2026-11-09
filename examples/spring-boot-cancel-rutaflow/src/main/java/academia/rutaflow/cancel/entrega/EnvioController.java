package academia.rutaflow.cancel.entrega;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/envios")
public class EnvioController {
    private final EnvioService envios;

    public EnvioController(EnvioService envios) {
        this.envios = envios;
    }

    @PostMapping
    public ResponseEntity<EnvioResponse> crear() {
        Envio creado = envios.crear();
        var ubicacion = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}").buildAndExpand(creado.getId()).toUri();
        return ResponseEntity.created(ubicacion).body(EnvioResponse.desde(creado));
    }

    @GetMapping("/{id}")
    public EnvioResponse buscar(@PathVariable long id) {
        return EnvioResponse.desde(envios.buscar(id));
    }

    @DeleteMapping("/{id}")
    public EnvioResponse cancelar(@PathVariable long id) {
        return EnvioResponse.desde(envios.cancelar(id));
    }
}
