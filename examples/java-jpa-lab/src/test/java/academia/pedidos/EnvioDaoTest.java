package academia.pedidos;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import org.h2.jdbcx.JdbcDataSource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class EnvioDaoTest {
    private JdbcDataSource dataSource;
    private EnvioDao dao;

    @BeforeEach
    void prepararBaseEnMemoria() throws Exception {
        dataSource = new JdbcDataSource();
        dataSource.setURL("jdbc:h2:mem:jdbc-lab;DB_CLOSE_DELAY=-1;LOCK_TIMEOUT=10000");
        dao = new EnvioDao(dataSource);
        try (var connection = dataSource.getConnection(); var statement = connection.createStatement()) {
            statement.execute("drop all objects");
            statement.execute("create table envio(referencia varchar(40) primary key, estado varchar(20) not null)");
            statement.execute("create table cobro(referencia varchar(40) primary key, importe decimal(12,2) not null)");
            statement.execute("insert into envio values ('RT-1', 'PENDIENTE')");
        }
    }

    @Test
    void consultaConParametroYDevuelveAusenteSinError() throws Exception {
        assertThat(dao.buscarEstado("RT-1")).contains("PENDIENTE");
        assertThat(dao.buscarEstado("' OR '1'='1")).isEmpty();
    }

    @Test
    void confirmaLasDosEscriturasJuntas() throws Exception {
        dao.liquidar("RT-1", new BigDecimal("27.50"));

        assertThat(dao.buscarEstado("RT-1")).contains("LIQUIDADO");
        try (var connection = dataSource.getConnection(); var statement = connection.createStatement();
             var rows = statement.executeQuery("select importe from cobro where referencia='RT-1'")) {
            assertThat(rows.next()).isTrue();
            assertThat(rows.getBigDecimal("importe")).isEqualByComparingTo("27.50");
        }
    }

    @Test
    void revierteElCobroSiNoExisteElEnvio() {
        assertThatThrownBy(() -> dao.liquidar("RT-404", new BigDecimal("19.00")))
            .isInstanceOf(java.sql.SQLException.class)
            .hasMessageContaining("No existe el envío");
        try (var connection = dataSource.getConnection(); var statement = connection.createStatement();
             var rows = statement.executeQuery("select count(*) from cobro")) {
            rows.next();
            assertThat(rows.getInt(1)).isZero();
        } catch (java.sql.SQLException error) {
            throw new AssertionError(error);
        }
    }
}
