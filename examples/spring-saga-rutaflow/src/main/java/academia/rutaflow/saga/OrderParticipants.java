package academia.rutaflow.saga;

import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class OrderParticipants {
    private final Set<String> reservations = new HashSet<>();
    private final Set<String> charges = new HashSet<>();
    private final Set<String> shipments = new HashSet<>();
    private boolean failNextShipment;

    public synchronized void reserve(String orderId) {
        reservations.add(orderId);
    }

    public synchronized void release(String orderId) {
        reservations.remove(orderId);
    }

    public synchronized void charge(String orderId) {
        charges.add(orderId);
    }

    public synchronized void refund(String orderId) {
        charges.remove(orderId);
    }

    public synchronized void confirmShipment(String orderId) {
        if (failNextShipment) {
            failNextShipment = false;
            throw new IllegalStateException("servicio de envío no disponible");
        }
        shipments.add(orderId);
    }

    public synchronized void cancelShipment(String orderId) {
        shipments.remove(orderId);
    }

    public synchronized boolean hasReservation(String orderId) {
        return reservations.contains(orderId);
    }

    public synchronized boolean hasCharge(String orderId) {
        return charges.contains(orderId);
    }

    public synchronized boolean hasShipment(String orderId) {
        return shipments.contains(orderId);
    }

    public synchronized void failNextShipment() {
        failNextShipment = true;
    }
}
