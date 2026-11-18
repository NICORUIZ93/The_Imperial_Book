package academia.rutaflow.clean.web;

import academia.rutaflow.clean.application.AssignDelivery;
import academia.rutaflow.clean.domain.Delivery;
import academia.rutaflow.clean.domain.DeliveryAlreadyAssigned;
import academia.rutaflow.clean.domain.DeliveryId;
import academia.rutaflow.clean.domain.Destination;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {
    private final AssignDelivery assignDelivery;

    public DeliveryController(AssignDelivery assignDelivery) {
        this.assignDelivery = assignDelivery;
    }

    @PostMapping("/{id}/assignment")
    public ResponseEntity<DeliveryResponse> assign(@PathVariable String id,
                                                    @RequestBody AssignRequest request) {
        Delivery delivery = assignDelivery.execute(new DeliveryId(id), new Destination(request.destination()));
        return ResponseEntity.status(HttpStatus.CREATED).body(DeliveryResponse.from(delivery));
    }

    @ExceptionHandler(DeliveryAlreadyAssigned.class)
    public ResponseEntity<ErrorResponse> alreadyAssigned(DeliveryAlreadyAssigned failure) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponse(failure.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> invalidRequest(IllegalArgumentException failure) {
        return ResponseEntity.badRequest().body(new ErrorResponse(failure.getMessage()));
    }

    public record AssignRequest(String destination) {}
    public record DeliveryResponse(String id, String destination, String status) {
        static DeliveryResponse from(Delivery delivery) {
            return new DeliveryResponse(delivery.id().value(), delivery.destination().value(),
                delivery.status().name());
        }
    }
    public record ErrorResponse(String message) {}
}
