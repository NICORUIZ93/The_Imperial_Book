package academia.rutaflow.stomp;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class PositionPublisher {
    private final SimpMessagingTemplate messaging;
    private final PositionSequenceTracker sequences;

    public PositionPublisher(SimpMessagingTemplate messaging, PositionSequenceTracker sequences) {
        this.messaging = messaging;
        this.sequences = sequences;
    }

    public boolean publish(PositionEvent event) {
        if (!sequences.accept(event)) return false;
        messaging.convertAndSend("/topic/entregas/" + event.shipmentId(), event);
        return true;
    }
}
