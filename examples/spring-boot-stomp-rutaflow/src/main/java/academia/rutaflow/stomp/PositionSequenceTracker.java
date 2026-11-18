package academia.rutaflow.stomp;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicBoolean;
import org.springframework.stereotype.Component;

@Component
public class PositionSequenceTracker {
    private final ConcurrentMap<String, Long> latestByShipment = new ConcurrentHashMap<>();

    public boolean accept(PositionEvent event) {
        if (event.shipmentId() == null || event.shipmentId().isBlank() || event.sequence() < 1) {
            return false;
        }
        AtomicBoolean accepted = new AtomicBoolean();
        latestByShipment.compute(event.shipmentId(), (shipmentId, latest) -> {
            if (latest == null || event.sequence() > latest) {
                accepted.set(true);
                return event.sequence();
            }
            return latest;
        });
        return accepted.get();
    }
}
