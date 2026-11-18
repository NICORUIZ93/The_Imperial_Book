package academia.rutaflow.clean.domain;

public record Destination(String value) {
    public Destination {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("el destino es obligatorio");
        }
    }
}
