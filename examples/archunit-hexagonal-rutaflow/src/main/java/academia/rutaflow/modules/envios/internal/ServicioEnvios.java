package academia.rutaflow.modules.envios.internal;

import academia.rutaflow.modules.envios.api.ConsultarEstadoEnvio;
import academia.rutaflow.modules.envios.api.EstadoEnvio;
import academia.rutaflow.modules.envios.api.RegistrarEnvio;

import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

public class ServicioEnvios implements RegistrarEnvio, ConsultarEstadoEnvio {
    private final Map<String, EstadoEnvio> envios = new ConcurrentHashMap<>();

    @Override
    public EstadoEnvio registrar(String envioId, String ciudadDestino) {
        EstadoEnvio estado = new EstadoEnvio(envioId, "REGISTRADO");
        envios.put(envioId, estado);
        return estado;
    }

    @Override
    public EstadoEnvio consultar(String envioId) {
        return envios.getOrDefault(envioId, new EstadoEnvio(envioId, "DESCONOCIDO"));
    }
}
