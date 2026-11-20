package academia.modulith;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Cada paquete hijo directo (pedidos, inventario) es un MÓDULO de aplicación.
 * Lo que está en el paquete raíz del módulo es su API; los subpaquetes (pedidos.interno) son privados.
 * @EnableAsync: @ApplicationModuleListener es @Async, así el inventario no frena al que confirma el pedido.
 */
@EnableAsync
@SpringBootApplication
public class ModulithApp {

    public static void main(String[] args) {
        SpringApplication.run(ModulithApp.class, args);
    }
}
