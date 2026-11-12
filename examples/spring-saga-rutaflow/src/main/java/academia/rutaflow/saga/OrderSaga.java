package academia.rutaflow.saga;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderSaga {
    private final OrderParticipants participants;

    private record Compensation(String name, Runnable action) {}

    public OrderSaga(OrderParticipants participants) {
        this.participants = participants;
    }

    public SagaResult place(String orderId) {
        List<String> actions = new ArrayList<>();
        List<Compensation> compensations = new ArrayList<>();

        try {
            participants.reserve(orderId);
            actions.add("reservar inventario");
            compensations.add(new Compensation("liberar inventario", () -> participants.release(orderId)));

            participants.charge(orderId);
            actions.add("cobrar pago");
            compensations.add(new Compensation("devolver pago", () -> participants.refund(orderId)));

            participants.confirmShipment(orderId);
            actions.add("confirmar envío");
            compensations.add(new Compensation("cancelar envío", () -> participants.cancelShipment(orderId)));

            return new SagaResult(SagaResult.Status.COMPLETED, actions);
        } catch (RuntimeException failure) {
            actions.add("falló el paso: " + failure.getMessage());
            for (int i = compensations.size() - 1; i >= 0; i--) {
                Compensation compensation = compensations.get(i);
                compensation.action().run();
                actions.add("compensación: " + compensation.name());
            }
            return new SagaResult(SagaResult.Status.COMPENSATED, actions);
        }
    }
}
