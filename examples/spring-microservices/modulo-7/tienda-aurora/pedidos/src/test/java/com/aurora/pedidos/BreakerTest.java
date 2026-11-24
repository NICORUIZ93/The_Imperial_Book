package com.aurora.pedidos;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;

// Inventario apunta a un puerto donde no hay nadie: todas las llamadas fallan.
@SpringBootTest(properties = "inventario.url=http://localhost:1")
class BreakerTest {

    @Autowired ClienteInventario cliente;
    @Autowired CircuitBreakerRegistry registro;

    @Test
    void conInventarioCaidoUsaElRespaldo() {
        Stock s = cliente.consultar("TEC-1042");
        assertEquals("respaldo", s.origen());
        assertNull(s.unidades());
    }

    @Test
    void cincoFallosSeguidosAbrenElBreaker() {
        CircuitBreaker breaker = registro.circuitBreaker("inventario");
        breaker.reset();
        for (int i = 0; i < 5; i++) {
            cliente.consultar("TEC-1042");
        }
        assertEquals(CircuitBreaker.State.OPEN, breaker.getState());
    }
}
