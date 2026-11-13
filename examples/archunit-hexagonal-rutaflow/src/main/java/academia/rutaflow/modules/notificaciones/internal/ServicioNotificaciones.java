package academia.rutaflow.modules.notificaciones.internal;

import academia.rutaflow.modules.envios.api.ConsultarEstadoEnvio;
import academia.rutaflow.modules.notificaciones.api.NotificarEntrega;

import java.util.concurrent.ConcurrentHashMap;
import java.util.Set;

public class ServicioNotificaciones implements NotificarEntrega {
    private final ConsultarEstadoEnvio envios;
    private final Set<String> notificados = ConcurrentHashMap.newKeySet();

    public ServicioNotificaciones(ConsultarEstadoEnvio envios) {
        this.envios = envios;
    }

    @Override
    public void notificar(String envioId) {
        // Lee el hecho ya decidido por Envíos; no le pide confirmación de vuelta.
        envios.consultar(envioId);
        notificados.add(envioId);
    }

    public boolean fueNotificado(String envioId) {
        return notificados.contains(envioId);
    }
}
