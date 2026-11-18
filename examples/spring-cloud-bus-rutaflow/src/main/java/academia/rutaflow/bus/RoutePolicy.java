package academia.rutaflow.bus;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.stereotype.Component;

@Component
@RefreshScope
public class RoutePolicy {
    @Value("${ruta.max-pedidos:3}")
    private int maxPedidos;

    public int getMaxPedidos() {
        return maxPedidos;
    }
}
