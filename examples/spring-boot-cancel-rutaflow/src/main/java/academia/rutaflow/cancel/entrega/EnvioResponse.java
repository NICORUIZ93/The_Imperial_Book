package academia.rutaflow.cancel.entrega;

public record EnvioResponse(Long id, EstadoEnvio estado) {
    public static EnvioResponse desde(Envio envio) {
        return new EnvioResponse(envio.getId(), envio.getEstado());
    }
}
