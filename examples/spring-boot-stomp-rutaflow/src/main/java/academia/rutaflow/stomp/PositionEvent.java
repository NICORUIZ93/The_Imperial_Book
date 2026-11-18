package academia.rutaflow.stomp;

public record PositionEvent(String shipmentId, long sequence, String occurredAt, int schemaVersion) {}
