package com.academia.tienda.api;

import com.academia.tienda.application.ProductoService;
import com.academia.tienda.domain.Producto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/productos")
public class ProductoController {

    private final ProductoService service;

    public ProductoController(ProductoService service) {
        this.service = service;
    }

    @GetMapping
    public List<ProductoResponse> listar() {
        return service.listar().stream().map(ProductoResponse::desde).toList();
    }

    @PostMapping
    public ResponseEntity<ProductoResponse> crear(@Valid @RequestBody ProductoRequest request) {
        Producto producto = service.crear(request.nombre(), request.precio());
        ProductoResponse response = ProductoResponse.desde(producto);
        return ResponseEntity.created(URI.create("/api/v1/productos/" + producto.getId()))
                .body(response);
    }
}
