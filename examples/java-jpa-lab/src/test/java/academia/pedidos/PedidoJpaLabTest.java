package academia.pedidos;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import jakarta.persistence.EntityManager;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;

@DataJpaTest
@Import(BusquedaPedido.class)
class PedidoJpaLabTest {
    @Autowired EntityManager entityManager;
    @Autowired PedidoRepository pedidos;
    @Autowired BusquedaPedido busqueda;

    @Test
    void guardaLosDosLadosYConsultaPorClienteConJpql() {
        var cliente = new Cliente("Lina");
        cliente.agregar(new Pedido("RT-102"));
        cliente.agregar(new Pedido("RT-101"));
        entityManager.persist(cliente);
        entityManager.flush();
        Long clienteGuardado = cliente.getId();
        Long claveForanea = ((Number) entityManager.createNativeQuery(
            "select cliente_id from pedido where referencia = 'RT-101'").getSingleResult()).longValue();
        assertThat(claveForanea).isEqualTo(clienteGuardado);
        assertThat(entityManager.createQuery("select count(p) from Pedido p", Long.class)
            .getSingleResult()).isEqualTo(2L);
        entityManager.clear();

        var recuperado = entityManager.find(Cliente.class, cliente.getId());
        List<Pedido> resultado = pedidos.listarPorCliente(recuperado.getId());

        assertThat(resultado).extracting(Pedido::getReferencia)
            .containsExactly("RT-101", "RT-102");
        assertThat(resultado).allSatisfy(p -> assertThat(p.getCliente().getId())
            .isEqualTo(recuperado.getId()));
    }

    @Test
    void persistirClientePropagaPersistenciaPeroNoBorrado() {
        var cliente = new Cliente("Historial");
        cliente.agregar(new Pedido("RT-HIST-1"));
        entityManager.persist(cliente);
        entityManager.flush();
        entityManager.clear();

        var recuperado = entityManager.find(Cliente.class, cliente.getId());
        assertThat(recuperado.getPedidos()).hasSize(1);
        assertThatThrownBy(() -> {
            entityManager.remove(recuperado);
            entityManager.flush();
        }).isInstanceOf(IllegalStateException.class)
            .hasCauseInstanceOf(org.hibernate.TransientPropertyValueException.class);
    }

    @Test
    void entityGraphCargaClienteYCriteriaBuscaPorPrefijo() {
        var cliente = new Cliente("Lina");
        cliente.agregar(new Pedido("RT-201"));
        cliente.agregar(new Pedido("OT-202"));
        entityManager.persist(cliente);
        entityManager.flush();
        entityManager.clear();

        var detalle = pedidos.findByReferencia("RT-201").orElseThrow();
        assertThat(detalle.getCliente().getNombre()).isEqualTo("Lina");
        assertThat(busqueda.porPrefijo("RT-")).extracting(Pedido::getReferencia)
            .containsExactly("RT-201");
    }

    @Test
    void comparaNMasUnoConCargaPorEntityGraph() {
        for (int i = 1; i <= 3; i++) {
            var cliente = new Cliente("Cliente " + i);
            cliente.agregar(new Pedido("RT-30" + i));
            entityManager.persist(cliente);
        }
        entityManager.flush();
        entityManager.clear();
        Statistics statistics = entityManager.getEntityManagerFactory()
            .unwrap(SessionFactory.class).getStatistics();
        statistics.clear();

        pedidos.findAll().forEach(pedido -> pedido.getCliente().getNombre());
        long consultasConNMasUno = statistics.getPrepareStatementCount();

        entityManager.clear();
        statistics.clear();
        pedidos.findAllWithClienteByOrderByReferenciaAsc()
            .forEach(pedido -> pedido.getCliente().getNombre());
        long consultasConEntityGraph = statistics.getPrepareStatementCount();

        System.out.printf("N+1=%d, @EntityGraph=%d%n", consultasConNMasUno, consultasConEntityGraph);
        assertThat(consultasConNMasUno).isGreaterThan(consultasConEntityGraph);
        assertThat(consultasConEntityGraph).isEqualTo(1);
    }
}
