package academia.decision;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

/** Mismo caso de uso con los dos estilos para que compares el tiempo de respuesta. */
@RestController
class PedidosController {

    private final Notificador notificador;
    private final ApplicationEventPublisher eventos;

    PedidosController(Notificador notificador, ApplicationEventPublisher eventos) {
        this.notificador = notificador;
        this.eventos = eventos;
    }

    @PostMapping("/pedidos/{id}/sincrono")
    ResponseEntity<String> sincrono(@PathVariable String id) {
        notificador.notificar(id);                          // espera 300 ms
        return ResponseEntity.status(201).body("creado y notificado " + id);
    }

    @PostMapping("/pedidos/{id}/asincrono")
    ResponseEntity<String> asincrono(@PathVariable String id) {
        eventos.publishEvent(new Notificador.PedidoCreado(id));   // vuelve de inmediato
        return ResponseEntity.accepted().body("creado; la notificación va en camino " + id);
    }
}
