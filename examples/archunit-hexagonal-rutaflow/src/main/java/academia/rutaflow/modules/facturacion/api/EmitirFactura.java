package academia.rutaflow.modules.facturacion.api;

public interface EmitirFactura {
    EstadoFactura emitir(String envioId);
}
