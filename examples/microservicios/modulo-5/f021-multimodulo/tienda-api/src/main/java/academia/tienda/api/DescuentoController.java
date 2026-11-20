package academia.tienda.api;

import academia.tienda.dominio.PoliticaDescuento;
import java.math.BigDecimal;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
class DescuentoController {
    private final PoliticaDescuento politica;

    DescuentoController(PoliticaDescuento politica) { this.politica = politica; }

    @GetMapping("/descuentos")
    Map<String, BigDecimal> calcular(@RequestParam BigDecimal total) {
        return Map.of("total", total, "descuento", politica.descuento(total));
    }
}
