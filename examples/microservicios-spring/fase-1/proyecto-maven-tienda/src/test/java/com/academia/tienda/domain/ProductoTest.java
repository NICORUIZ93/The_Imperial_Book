package com.academia.tienda.domain;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ProductoTest {

    @Test
    void normalizaNombreYConservaPrecioDecimal() {
        Producto producto = new Producto("  Teclado  ", new BigDecimal("35.90"));

        assertEquals("Teclado", producto.getNombre());
        assertEquals(new BigDecimal("35.90"), producto.getPrecio());
    }

    @Test
    void rechazaPrecioCero() {
        assertThrows(IllegalArgumentException.class,
                () -> new Producto("Teclado", BigDecimal.ZERO));
    }

    @Test
    void rechazaNombreVacio() {
        assertThrows(IllegalArgumentException.class,
                () -> new Producto("   ", new BigDecimal("1.00")));
    }
}
