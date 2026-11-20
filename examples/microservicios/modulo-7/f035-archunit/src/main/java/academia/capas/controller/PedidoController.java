package academia.capas.controller;

import academia.capas.modelo.Pedido;
import academia.capas.servicio.PedidoServicio;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PedidoController {

    private final PedidoServicio servicio;

    public PedidoController(PedidoServicio servicio) {
        this.servicio = servicio;
    }

    @GetMapping("/pedidos/{id}")
    public Pedido obtener(@PathVariable long id) {
        return servicio.obtener(id);
    }
}
