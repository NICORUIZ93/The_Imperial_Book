package academia.rutaflow.cancel.entrega;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EnvioService {
    private final EnvioRepository envios;

    public EnvioService(EnvioRepository envios) {
        this.envios = envios;
    }

    @Transactional
    public Envio crear() {
        return envios.save(Envio.crear());
    }

    @Transactional(readOnly = true)
    public Envio buscar(long id) {
        return obtener(id);
    }

    @Transactional
    public Envio cancelar(long id) {
        Envio envio = obtener(id);
        envio.cancelar();
        return envio;
    }

    private Envio obtener(long id) {
        return envios.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
}
