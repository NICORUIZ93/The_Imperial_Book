package academia.pedidos;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import jakarta.persistence.EntityManager;
import java.util.List;
import org.hibernate.LazyInitializationException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageRequest;
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
        assertThat(entityManager.createQuery(
            "select count(p) from Pedido p where p.referencia like 'RT-10%'", Long.class)
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

    @Test
    void accederRelacionLazyDespuesDeSepararLaEntidadFallaConDiagnosticoClaro() {
        var fabrica = entityManager.getEntityManagerFactory();
        var escritura = fabrica.createEntityManager();
        escritura.getTransaction().begin();
        var cliente = new Cliente("Lina");
        var pedidoNuevo = new Pedido("RT-LAZY-1");
        cliente.agregar(pedidoNuevo);
        escritura.persist(cliente);
        escritura.getTransaction().commit();
        Long idPedido = pedidoNuevo.getId();
        Long idCliente = cliente.getId();
        escritura.close();

        var lectura = fabrica.createEntityManager();
        lectura.getTransaction().begin();
        var pedido = lectura.find(Pedido.class, idPedido);
        lectura.getTransaction().commit();
        lectura.close();

        try {
            assertThatThrownBy(() -> pedido.getCliente().getNombre())
                .isInstanceOf(LazyInitializationException.class);
        } finally {
            var limpieza = fabrica.createEntityManager();
            limpieza.getTransaction().begin();
            limpieza.createNativeQuery("delete from pedido where referencia = 'RT-LAZY-1'")
                .executeUpdate();
            limpieza.createNativeQuery("delete from cliente where id = :id")
                .setParameter("id", idCliente).executeUpdate();
            limpieza.getTransaction().commit();
            limpieza.close();
        }
    }

    @Test
    void paginaResumenConSoloLasColumnasQueNecesitaLaLista() {
        var lina = new Cliente("Lina");
        lina.agregar(new Pedido("RT-PAGE-1"));
        var teo = new Cliente("Teo");
        teo.agregar(new Pedido("RT-PAGE-2"));
        var uma = new Cliente("Uma");
        uma.agregar(new Pedido("RT-PAGE-3"));
        entityManager.persist(lina);
        entityManager.persist(teo);
        entityManager.persist(uma);
        entityManager.flush();
        entityManager.clear();

        var pagina = pedidos.listarResumenes(PageRequest.of(0, 2));

        assertThat(pagina.getContent()).containsExactly(
            new PedidoResumen("RT-PAGE-1", "Lina"),
            new PedidoResumen("RT-PAGE-2", "Teo"));
        assertThat(pagina.getTotalElements()).isEqualTo(3);
        assertThat(pagina.hasNext()).isTrue();
    }
}
