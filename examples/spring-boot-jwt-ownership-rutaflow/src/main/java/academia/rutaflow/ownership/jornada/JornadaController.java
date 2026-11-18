package academia.rutaflow.ownership.jornada;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/jornadas")
public class JornadaController {
    private final JornadaOwnership ownership;

    public JornadaController(JornadaOwnership ownership) {
        this.ownership = ownership;
    }

    @PatchMapping("/{jornadaId}/posicion")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<String> actualizarPosicion(@PathVariable String jornadaId, Authentication auth) {
        if (!ownership.perteneceA(jornadaId, auth.getName())) {
            return ResponseEntity.status(403).body("La jornada no pertenece a este conductor");
        }
        return ResponseEntity.ok("Posición actualizada");
    }
}
