package academia.tienda.api;

import academia.tienda.dominio.PoliticaDescuento;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class TiendaApiApp {

    // El dominio no tiene anotaciones de Spring: la app lo registra como bean.
    @Bean
    PoliticaDescuento politicaDescuento() {
        return new PoliticaDescuento();
    }

    public static void main(String[] args) {
        SpringApplication.run(TiendaApiApp.class, args);
    }
}
