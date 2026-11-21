package com.academia.tienda.application;

import com.academia.tienda.domain.Producto;
import com.academia.tienda.persistence.ProductoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

    @Mock
    private ProductoRepository repository;

    @InjectMocks
    private ProductoService service;

    @Test
    void crearGuardaYDevuelveElProducto() {
        when(repository.save(any(Producto.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Producto creado = service.crear("Mouse", new BigDecimal("19.99"));

        assertEquals("Mouse", creado.getNombre());
        assertEquals(new BigDecimal("19.99"), creado.getPrecio());
        verify(repository).save(any(Producto.class));
    }

    @Test
    void listarDevuelveLosProductosDelRepositorio() {
        Producto producto = new Producto("Monitor", new BigDecimal("199.00"));
        when(repository.findAll()).thenReturn(java.util.List.of(producto));

        var encontrados = service.listar();

        assertEquals(1, encontrados.size());
        assertSame(producto, encontrados.getFirst());
        verify(repository).findAll();
    }
}
