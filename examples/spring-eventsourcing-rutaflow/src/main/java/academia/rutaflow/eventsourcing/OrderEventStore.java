package academia.rutaflow.eventsourcing;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class OrderEventStore {
    private final Map<String, List<OrderEvent>> streams = new HashMap<>();

    public synchronized void append(OrderEvent event) {
        List<OrderEvent> current = streams.getOrDefault(event.orderId(), List.of());
        OrderState.replay(current).apply(event); // valida la transición antes de agregar el hecho
        List<OrderEvent> next = new ArrayList<>(current);
        next.add(event);
        streams.put(event.orderId(), next);
    }

    public synchronized List<OrderEvent> load(String orderId) {
        return List.copyOf(streams.getOrDefault(orderId, List.of()));
    }

    public synchronized OrderState currentState(String orderId) {
        return OrderState.replay(load(orderId));
    }
}
