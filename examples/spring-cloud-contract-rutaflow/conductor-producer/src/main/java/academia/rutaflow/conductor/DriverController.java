package academia.rutaflow.conductor;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DriverController {
    @GetMapping("/drivers/{driverId}")
    DriverAvailability available(@PathVariable String driverId) {
        return new DriverAvailability(driverId, true);
    }

    record DriverAvailability(String driverId, boolean available) {}
}
