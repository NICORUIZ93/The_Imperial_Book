package academia.rest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.web.service.registry.ImportHttpServices;

@SpringBootApplication
@EnableFeignClients
@ImportHttpServices(group = "inventario", types = InventarioHttp.class)
public class PedidosApp {

    public static void main(String[] args) {
        SpringApplication.run(PedidosApp.class, args);
    }
}
