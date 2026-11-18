package academia.rutaflow.temporal;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class ActivityRecorder {
    private final List<String> events = new CopyOnWriteArrayList<>();
    private final AtomicBoolean failChargeOnce = new AtomicBoolean();
    private final AtomicBoolean rejectCharge = new AtomicBoolean();
    private final AtomicBoolean failNotification = new AtomicBoolean();
    private final AtomicInteger chargeAttempts = new AtomicInteger();

    public void reset() {
        events.clear();
        failChargeOnce.set(false);
        rejectCharge.set(false);
        failNotification.set(false);
        chargeAttempts.set(0);
    }

    public void failChargeOnce() { failChargeOnce.set(true); }
    public void rejectCharge() { rejectCharge.set(true); }
    public void failNotification() { failNotification.set(true); }
    public int chargeAttempts() { return chargeAttempts.get(); }
    public List<String> events() { return List.copyOf(events); }

    void record(String event) { events.add(event); }

    void charge(String pedidoId) {
        int attempt = chargeAttempts.incrementAndGet();
        events.add("cobrar:" + attempt);
        if (rejectCharge.get() || failChargeOnce.compareAndSet(true, false)) {
            throw new IllegalStateException("fallo temporal de cobro");
        }
    }

    void notifyCustomer(String pedidoId) {
        events.add("notificar:" + pedidoId);
        if (failNotification.get()) {
            throw new IllegalStateException("fallo de notificación");
        }
    }
}
