package academia.rutaflow.modules.envios.api;

public interface RegistrarEnvio {
    EstadoEnvio registrar(String envioId, String ciudadDestino);
}
