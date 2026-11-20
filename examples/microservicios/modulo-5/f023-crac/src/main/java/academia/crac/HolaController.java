package academia.crac;

import java.lang.management.ManagementFactory;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class HolaController {
    private final ConexionExterna conexion;

    HolaController(ConexionExterna conexion) { this.conexion = conexion; }

    @GetMapping("/hola")
    Map<String, Object> hola() {
        return Map.of("mensaje", "hola desde CRaC",
            "conexionAbierta", conexion.isRunning(),
            "aperturas", conexion.aperturas(),
            "jvm", ManagementFactory.getRuntimeMXBean().getVmVendor());
    }
}
