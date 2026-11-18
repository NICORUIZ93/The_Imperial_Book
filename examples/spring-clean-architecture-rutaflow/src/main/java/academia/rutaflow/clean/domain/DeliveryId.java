package academia.rutaflow.clean.domain;

public record DeliveryId(String value) {
    public DeliveryId {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("el ID del envío es obligatorio");
        }
    }
}
