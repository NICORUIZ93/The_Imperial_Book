package academia.rutaflow.operations;

public record Position(double latitude, double longitude) {
    public Position {
        if (latitude < -90 || latitude > 90) {
            throw new IllegalArgumentException("Latitud debe estar entre -90 y 90");
        }
        if (longitude < -180 || longitude > 180) {
            throw new IllegalArgumentException("Longitud debe estar entre -180 y 180");
        }
    }
}
