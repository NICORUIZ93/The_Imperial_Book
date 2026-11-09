package academia.rutaflow.batch;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest
class ImportJobTest {
    @Autowired JdbcTemplate jdbc;

    @Test
    void procesaCsvFiltraImporteCeroYGuardaLosDosPedidosValidos() {
        var filas = jdbc.query("select referencia, importe from pedido_importado order by referencia",
            (rs, row) -> new PedidoImportado(rs.getString("referencia"), rs.getBigDecimal("importe")));

        assertThat(filas).containsExactly(
            new PedidoImportado("RF-1001", new BigDecimal("125.50")),
            new PedidoImportado("RF-1003", new BigDecimal("49.99")));
        assertThat(jdbc.queryForObject("select total from batch_resumen", Integer.class)).isEqualTo(2);
    }
}
