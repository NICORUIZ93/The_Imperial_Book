package academia.rutaflow.integrador.entrega;

public record EntregaResponse(Long id, String destinatario, String estado) {
    public static EntregaResponse desde(Entrega entrega) {
        return new EntregaResponse(entrega.getId(), entrega.getDestinatario(), entrega.getEstado());
    }
}
