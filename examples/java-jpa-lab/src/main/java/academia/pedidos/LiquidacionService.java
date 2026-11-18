package academia.pedidos;

import java.math.BigDecimal;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LiquidacionService {
    private final JdbcTemplate jdbc;

    public LiquidacionService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional
    public void liquidar(String referencia, BigDecimal importe) {
        jdbc.update("insert into cobro(referencia, importe) values (?, ?)", referencia, importe);
        int enviosActualizados = jdbc.update(
            "update envio set estado = ? where referencia = ?", "LIQUIDADO", referencia);
        if (enviosActualizados != 1) {
            throw new IllegalStateException("No existe el envío: " + referencia);
        }
    }

    @Transactional(rollbackFor = LiquidacionPendienteException.class)
    public void liquidarConRevisionPendiente(String referencia, BigDecimal importe)
        throws LiquidacionPendienteException {
        jdbc.update("insert into cobro(referencia, importe) values (?, ?)", referencia, importe);
        jdbc.update("update envio set estado = ? where referencia = ?", "LIQUIDADO", referencia);
        throw new LiquidacionPendienteException("Falta aprobación del supervisor");
    }
}
