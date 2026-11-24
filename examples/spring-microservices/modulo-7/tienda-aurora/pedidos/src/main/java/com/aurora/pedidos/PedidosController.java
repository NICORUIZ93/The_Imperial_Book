package com.aurora.pedidos;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PedidosController {

    private final ClienteInventario inventario;

    public PedidosController(ClienteInventario inventario) {
        this.inventario = inventario;
    }

    @GetMapping("/pedidos/stock/{sku}")
    public Stock stock(@PathVariable String sku) {
        return inventario.consultar(sku);
    }
}
