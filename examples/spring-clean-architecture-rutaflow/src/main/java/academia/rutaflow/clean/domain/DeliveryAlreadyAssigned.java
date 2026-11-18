package academia.rutaflow.clean.domain;

public class DeliveryAlreadyAssigned extends RuntimeException {
    public DeliveryAlreadyAssigned() {
        super("el envío ya tiene un destino asignado");
    }
}
