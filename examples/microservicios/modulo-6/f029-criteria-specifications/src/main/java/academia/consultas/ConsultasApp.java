package academia.consultas;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@SpringBootApplication
public class ConsultasApp {

    static List<Producto> catalogo() {
        return List.of(
            new Producto("Café de Huila 500 g", "cafe", new BigDecimal("32000"), true),
            new Producto("Café descafeinado", "cafe", new BigDecimal("28000"), false),
            new Producto("Café de Nariño 1 kg", "cafe", new BigDecimal("61000"), true),
            new Producto("Taza de cerámica", "menaje", new BigDecimal("18000"), true),
            new Producto("Prensa francesa", "menaje", new BigDecimal("95000"), true));
    }

    @Bean
    ApplicationRunner demo(ProductoRepository repo, ReporteCriteria reporte) {
        return args -> {
            repo.saveAll(catalogo());
            var filtro = new FiltroProductos("café", null, new BigDecimal("30000"), null, true);
            var pagina = repo.findAll(ProductoSpecs.desde(filtro),
                PageRequest.of(0, 10, Sort.by("precio").descending()));
            pagina.forEach(p -> System.out.println("Encontrado: " + p.getNombre() + " · " + p.getPrecio()));
            reporte.promedioPorCategoria().forEach(r -> System.out.println("Reporte: " + r));
        };
    }

    public static void main(String[] args) {
        SpringApplication.run(ConsultasApp.class, args).close();
    }
}
