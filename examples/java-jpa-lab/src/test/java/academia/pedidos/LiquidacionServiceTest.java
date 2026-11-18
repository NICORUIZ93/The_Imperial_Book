package academia.pedidos;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest
class LiquidacionServiceTest {
    @Autowired JdbcTemplate jdbc;
    @Autowired LiquidacionService liquidaciones;

    @BeforeEach
    void prepararTablas() {
        jdbc.execute("drop table if exists cobro");
        jdbc.execute("drop table if exists envio");
        jdbc.execute("create table envio(referencia varchar(40) primary key, estado varchar(20) not null)");
        jdbc.execute("create table cobro(referencia varchar(40) primary key, importe decimal(12,2) not null)");
        jdbc.update("insert into envio values (?, ?)", "RT-1", "PENDIENTE");
    }

    @Test
    void confirmaCobroYEstadoDentroDeLaMismaTransaccion() {
        liquidaciones.liquidar("RT-1", new BigDecimal("27.50"));

        assertThat(jdbc.queryForObject(
            "select estado from envio where referencia = ?", String.class, "RT-1"))
            .isEqualTo("LIQUIDADO");
        assertThat(jdbc.queryForObject(
            "select importe from cobro where referencia = ?", BigDecimal.class, "RT-1"))
            .isEqualByComparingTo("27.50");
    }

    @Test
    void revierteElCobroSiLaActualizacionDelEnvioNoEncuentraFila() {
        assertThatThrownBy(() -> liquidaciones.liquidar("RT-404", new BigDecimal("19.00")))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("No existe el envío");

        assertThat(jdbc.queryForObject("select count(*) from cobro", Integer.class)).isZero();
    }

    @Test
    void rollbackForTambienRevierteUnaExcepcionChecked() {
        assertThatThrownBy(() -> liquidaciones.liquidarConRevisionPendiente(
            "RT-1", new BigDecimal("27.50")))
            .isInstanceOf(LiquidacionPendienteException.class)
            .hasMessageContaining("Falta aprobación");

        assertThat(jdbc.queryForObject("select count(*) from cobro", Integer.class)).isZero();
        assertThat(jdbc.queryForObject(
            "select estado from envio where referencia = ?", String.class, "RT-1"))
            .isEqualTo("PENDIENTE");
    }
}
