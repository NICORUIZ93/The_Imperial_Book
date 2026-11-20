package academia.dto;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.HexFormat;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
class ClienteController {
    private final AtomicLong secuencia = new AtomicLong();

    @PostMapping("/clientes")
    @ResponseStatus(HttpStatus.CREATED)
    ClienteResponse crear(@Valid @RequestBody CrearClienteRequest req) {
        // Solo para el ejemplo: en el Módulo 9 se usa un PasswordEncoder real.
        String hash = HexFormat.of().formatHex(req.clave().getBytes()).substring(0, 8);
        Cliente cliente = ClienteMapper.aModelo(secuencia.incrementAndGet(), req, hash, LocalDate.of(2026, 11, 19));
        return ClienteMapper.aRespuesta(cliente);
    }
}
