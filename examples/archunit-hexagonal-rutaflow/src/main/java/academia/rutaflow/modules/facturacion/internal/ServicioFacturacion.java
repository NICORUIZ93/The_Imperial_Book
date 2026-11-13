package academia.rutaflow.modules.facturacion.internal;

import academia.rutaflow.modules.envios.api.ConsultarEstadoEnvio;
import academia.rutaflow.modules.facturacion.api.EmitirFactura;
import academia.rutaflow.modules.facturacion.api.EstadoFactura;

public class ServicioFacturacion implements EmitirFactura {
    private final ConsultarEstadoEnvio envios;

    public ServicioFacturacion(ConsultarEstadoEnvio envios) {
        this.envios = envios;
    }

    @Override
    public EstadoFactura emitir(String envioId) {
        // Consulta la API pública de Envíos, nunca su clase interna.
        envios.consultar(envioId);
        return new EstadoFactura(envioId, "EMITIDA");
    }
}
