package academia.mensajeria;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** POST /pedidos/P-1?canal=rabbit|kafka  -> 202 Accepted: aceptado, se procesará después. */
@RestController
class PedidosController {

    private final Publicador publicador;

    PedidosController(Publicador publicador) {
        this.publicador = publicador;
    }

    record Aceptado(String pedido, String canal, Integer particion) {
    }

    @PostMapping("/pedidos/{id}")
    ResponseEntity<Aceptado> crear(@PathVariable String id, @RequestParam String canal) throws Exception {
        if (canal.equals("kafka")) {
            int particion = publicador.porKafka(id);
            return ResponseEntity.accepted().body(new Aceptado(id, "kafka", particion));
        }
        publicador.porRabbit(id);
        return ResponseEntity.accepted().body(new Aceptado(id, "rabbit", null));
    }
}
