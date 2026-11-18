package academia.pedidos;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.JoinType;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public class BusquedaPedido {
    @PersistenceContext
    private EntityManager entityManager;

    public List<Pedido> porPrefijo(String prefijo) {
        var builder = entityManager.getCriteriaBuilder();
        var query = builder.createQuery(Pedido.class);
        var pedido = query.from(Pedido.class);
        pedido.fetch("cliente", JoinType.INNER);
        query.select(pedido)
            .where(builder.like(pedido.get("referencia"), prefijo + "%"))
            .orderBy(builder.asc(pedido.get("referencia")));
        return entityManager.createQuery(query).getResultList();
    }
}
