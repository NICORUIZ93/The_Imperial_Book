package academia.consultas;

import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/** Criteria API "pura" (sin Spring Data): SELECT categoria, AVG(precio), COUNT(*) ... GROUP BY. */
@Repository
public class ReporteCriteria {
    private final EntityManager em;

    public ReporteCriteria(EntityManager em) { this.em = em; }

    @Transactional(readOnly = true)
    public List<PromedioCategoria> promedioPorCategoria() {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<PromedioCategoria> q = cb.createQuery(PromedioCategoria.class);
        Root<Producto> p = q.from(Producto.class);
        q.select(cb.construct(PromedioCategoria.class,
                p.get("categoria"), cb.avg(p.<BigDecimal>get("precio")), cb.count(p)))
         .where(cb.isTrue(p.<Boolean>get("activo")))
         .groupBy(p.get("categoria"))
         .orderBy(cb.asc(p.get("categoria")));
        return em.createQuery(q).getResultList();
    }
}
