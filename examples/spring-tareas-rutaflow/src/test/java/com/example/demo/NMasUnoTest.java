package com.example.demo;

import jakarta.persistence.EntityManager;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest(properties = "spring.jpa.properties.hibernate.generate_statistics=true")
class NMasUnoTest {
    @Autowired ClienteRepository clientes;
    @Autowired PedidoRepository pedidos;
    @Autowired EntityManager entityManager;
    @Autowired SessionFactory sessionFactory;

    private void crearTresClientesConPedido() {
        for (int i = 1; i <= 3; i++) {
            Cliente cliente = clientes.save(new Cliente("Cliente " + i));
            pedidos.save(new Pedido("RF-" + i, cliente));
        }
        entityManager.flush();
        entityManager.clear();
    }

    @Test
    void laCargaPerezosaHaceUnaConsultaPorCadaColeccion() {
        crearTresClientesConPedido();
        Statistics stats = sessionFactory.getStatistics();
        stats.clear();

        for (Cliente cliente : clientes.buscarSinPedidos()) {
            assertThat(cliente.getPedidos()).hasSize(1);
        }

        assertThat(stats.getPrepareStatementCount()).isEqualTo(4L);
    }
}
