package academia.rutaflow.nativeimage;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EstadoRutaController {
    private final String archivoMensaje;

    public EstadoRutaController(@Value("${rutaflow.mensaje:mensajes/ruta.txt}") String archivoMensaje) {
        this.archivoMensaje = archivoMensaje;
    }

    @GetMapping("/estado")
    public EstadoRuta estado() {
        return new EstadoRuta("RF-314", "en camino");
    }

    @GetMapping("/mensaje")
    public String mensaje() throws IOException {
        return new ClassPathResource(archivoMensaje).getContentAsString(StandardCharsets.UTF_8).trim();
    }

    record EstadoRuta(String codigo, String estado) {}
}
