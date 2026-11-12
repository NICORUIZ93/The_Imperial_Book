package academia.pedidos;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.test.autoconfigure.JdbcTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;

@JdbcTest
@Import(EnvioJdbcRepository.class)
class EnvioJdbcRepositoryTest {
    @Autowired JdbcTemplate jdbc;
    @Autowired EnvioJdbcRepository envios;

    @BeforeEach
    void prepararEsquema() {
        jdbc.execute("drop table if exists envio");
        jdbc.execute("create table envio(referencia varchar(40) primary key, estado varchar(20) not null)");
        jdbc.update("insert into envio values (?, ?)", "RT-1", "PENDIENTE");
        jdbc.update("insert into envio values (?, ?)", "RT-2", "EN_RUTA");
    }

    @Test
    void insertaYBuscaConParametroYMapeaUnaFila() {
        assertThat(envios.crear("RT-3", "ENTREGADO")).isEqualTo(1);
        assertThat(envios.buscar("RT-3"))
            .contains(new EnvioRegistro("RT-3", "ENTREGADO"));
        assertThat(envios.buscar("RT-404")).isEmpty();
    }

    @Test
    void entradaConComillasSeTrataComoDato() {
        assertThat(envios.buscar("' OR '1'='1")).isEmpty();
        assertThat(jdbc.queryForObject("select count(*) from envio", Integer.class)).isEqualTo(2);
    }

    @Test
    void aceptaSoloColumnasDeOrdenamientoPermitidas() {
        assertThat(envios.porEstadoOrdenados("PENDIENTE", "referencia"))
            .containsExactly(new EnvioRegistro("RT-1", "PENDIENTE"));
        assertThatThrownBy(() -> envios.porEstadoOrdenados("PENDIENTE", "estado; drop table envio"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Orden no permitido");
        assertThat(jdbc.queryForObject("select count(*) from envio", Integer.class)).isEqualTo(2);
    }
}
