package academia.rest;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/** 3. OpenFeign: declaras una interfaz y Spring Cloud genera la implementación HTTP. */
@FeignClient(name = "inventario", url = "${inventario.url}")
public interface ClienteFeign {

    @GetMapping("/inventario/{sku}")
    Existencia consultar(@PathVariable("sku") String sku);
}
