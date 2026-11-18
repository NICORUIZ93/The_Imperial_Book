package academia.rutaflow.mail;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;

import java.sql.Timestamp;
import java.time.Clock;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
class MailOutboxTest {
    @Autowired ConfirmarEnvioService confirmar;
    @Autowired MailOutboxDispatcher dispatcher;
    @Autowired JdbcTemplate jdbc;
    @Autowired Clock clock;
    @MockitoBean CorreoGateway gateway;

    @BeforeEach
    void limpiar() {
        jdbc.update("DELETE FROM correo_outbox");
        jdbc.update("DELETE FROM envio");
        reset(gateway);
    }

    @Test
    void confirmacionYCorreoPendienteSeGuardanEnLaMismaTransaccion() {
        jdbc.execute("ALTER TABLE correo_outbox ADD CONSTRAINT forzar_fallo_correo "
                + "CHECK (destinatario <> 'rollback@example.test')");
        try {
            assertThatThrownBy(() -> confirmar.confirmar("RF-ROLLBACK", "rollback@example.test"))
                    .isInstanceOf(DataIntegrityViolationException.class);
        } finally {
            jdbc.execute("ALTER TABLE correo_outbox DROP CONSTRAINT forzar_fallo_correo");
        }

        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM envio WHERE referencia = ?",
                Integer.class, "RF-ROLLBACK")).isZero();
    }

    @Test
    void falloTransitorioSeReintentaDespuesYQuedaMarcadoComoEnviado() {
        UUID envioId = confirmar.confirmar("RF-42", "ana@example.test");
        doThrow(new IllegalStateException("timeout de prueba")).doNothing()
                .when(gateway).enviar(any(Correo.class));

        assertThat(dispatcher.enviarPendientes()).isZero();
        assertThat(jdbc.queryForObject("SELECT intentos FROM correo_outbox WHERE envio_id = ?",
                Integer.class, envioId)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT sent_at IS NULL FROM correo_outbox WHERE envio_id = ?",
                Boolean.class, envioId)).isTrue();

        jdbc.update("UPDATE correo_outbox SET next_attempt_at = ? WHERE envio_id = ?",
                Timestamp.from(clock.instant().minusSeconds(1)), envioId);
        assertThat(dispatcher.enviarPendientes()).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT sent_at IS NOT NULL FROM correo_outbox WHERE envio_id = ?",
                Boolean.class, envioId)).isTrue();
        verify(gateway, org.mockito.Mockito.times(2)).enviar(any(Correo.class));
    }

    @Test
    void agotaTresIntentosYConservaElErrorSinSeguirEnviando() {
        UUID envioId = confirmar.confirmar("RF-43", "luis@example.test");
        doThrow(new IllegalStateException("fallo de prueba")).when(gateway).enviar(any(Correo.class));

        for (int intento = 0; intento < 3; intento++) {
            jdbc.update("UPDATE correo_outbox SET next_attempt_at = ? WHERE envio_id = ?",
                    Timestamp.from(clock.instant().minusSeconds(1)), envioId);
            dispatcher.enviarPendientes();
        }

        assertThat(jdbc.queryForObject("SELECT intentos FROM correo_outbox WHERE envio_id = ?",
                Integer.class, envioId)).isEqualTo(3);
        assertThat(jdbc.queryForObject("SELECT dead_lettered_at IS NOT NULL FROM correo_outbox WHERE envio_id = ?",
                Boolean.class, envioId)).isTrue();
        assertThat(jdbc.queryForObject("SELECT last_error FROM correo_outbox WHERE envio_id = ?",
                String.class, envioId)).isEqualTo("IllegalStateException");
        assertThat(dispatcher.enviarPendientes()).isZero();
        verify(gateway, org.mockito.Mockito.times(3)).enviar(any(Correo.class));
    }
}
