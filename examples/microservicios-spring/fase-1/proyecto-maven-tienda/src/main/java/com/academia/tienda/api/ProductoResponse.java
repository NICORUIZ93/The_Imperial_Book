package com.academia.tienda.api;

import com.academia.tienda.domain.Producto;

import java.math.BigDecimal;

public record ProductoResponse(Long id, String nombre, BigDecimal precio) {

    public static ProductoResponse desde(Producto producto) {
        return new ProductoResponse(producto.getId(), producto.getNombre(), producto.getPrecio());
    }
}
