package academia.rutaflow.bus;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RoutePolicyController {
    private final RoutePolicy policy;

    public RoutePolicyController(RoutePolicy policy) {
        this.policy = policy;
    }

    @GetMapping("/config")
    PolicyResponse current() {
        return new PolicyResponse(policy.getMaxPedidos());
    }

    record PolicyResponse(int maxPedidos) {}
}
