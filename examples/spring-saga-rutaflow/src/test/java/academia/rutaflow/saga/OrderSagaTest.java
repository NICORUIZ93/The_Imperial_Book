package academia.rutaflow.saga;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class OrderSagaTest {
    @Autowired
    private OrderSaga saga;

    @Autowired
    private OrderParticipants participants;

    @BeforeEach
    void clearState() {
        participants.release("order-ok");
        participants.refund("order-ok");
        participants.cancelShipment("order-ok");
        participants.release("order-fails");
        participants.refund("order-fails");
        participants.cancelShipment("order-fails");
    }

    @Test
    void ifShippingFailsItRefundsAndReleasesInReverseOrder() {
        participants.failNextShipment();

        SagaResult result = saga.place("order-fails");

        assertThat(result.status()).isEqualTo(SagaResult.Status.COMPENSATED);
        assertThat(result.actions()).containsExactly(
            "reservar inventario",
            "cobrar pago",
            "falló el paso: servicio de envío no disponible",
            "compensación: devolver pago",
            "compensación: liberar inventario");
        assertThat(participants.hasReservation("order-fails")).isFalse();
        assertThat(participants.hasCharge("order-fails")).isFalse();
        assertThat(participants.hasShipment("order-fails")).isFalse();
    }

    @Test
    void ifAllParticipantsSucceedItKeepsTheOrderEffects() {
        SagaResult result = saga.place("order-ok");

        assertThat(result.status()).isEqualTo(SagaResult.Status.COMPLETED);
        assertThat(result.actions()).containsExactly(
            "reservar inventario", "cobrar pago", "confirmar envío");
        assertThat(participants.hasReservation("order-ok")).isTrue();
        assertThat(participants.hasCharge("order-ok")).isTrue();
        assertThat(participants.hasShipment("order-ok")).isTrue();
    }
}
