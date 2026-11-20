package academia.rest;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.service.annotation.GetExchange;

/** 4. Interfaz HTTP de Spring Framework 7 (@HttpExchange) sobre RestClient: la opción recomendada para código nuevo. */
public interface InventarioHttp {

    @GetExchange("/inventario/{sku}")
    Existencia consultar(@PathVariable String sku);
}
