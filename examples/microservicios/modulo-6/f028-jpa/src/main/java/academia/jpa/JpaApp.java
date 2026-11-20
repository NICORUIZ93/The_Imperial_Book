package academia.jpa;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class JpaApp {

    @Bean
    ApplicationRunner demo(ServicioPedidos servicio, PedidoRepository pedidos) {
        return args -> {
            Long id = servicio.crear("ana", List.of(
                new LineaDto("CAF-1", 2, new BigDecimal("32000")),
                new LineaDto("TAZ-3", 1, new BigDecimal("58000"))));
            servicio.confirmar(id);
            Pedido p = pedidos.findConLineasById(id).orElseThrow();
            System.out.printf("Pedido %d · cliente=%s · estado=%s · líneas=%d · total=%s%n",
                p.getId(), p.getCliente(), p.getEstado(), p.getLineas().size(), servicio.total(id));
        };
    }

    public static void main(String[] args) {
        SpringApplication.run(JpaApp.class, args).close();
    }
}
