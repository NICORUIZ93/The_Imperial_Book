package academia.rutaflow.mail;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

class JavaMailCorreoGatewayTest {
    @Test
    void construyeElMensajeYLoEntregaAlSenderSinAbrirSmtp() {
        JavaMailSender sender = org.mockito.Mockito.mock(JavaMailSender.class);
        JavaMailCorreoGateway gateway = new JavaMailCorreoGateway(sender, "avisos@rutaflow.local");
        var correo = new Correo(UUID.randomUUID(), UUID.randomUUID(), "ana@example.test",
                "Envío confirmado", "Referencia RF-42 confirmada.");

        gateway.enviar(correo);

        ArgumentCaptor<SimpleMailMessage> mensaje = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(sender).send(mensaje.capture());
        assertThat(mensaje.getValue().getFrom()).isEqualTo("avisos@rutaflow.local");
        assertThat(mensaje.getValue().getTo()).containsExactly("ana@example.test");
        assertThat(mensaje.getValue().getSubject()).isEqualTo("Envío confirmado");
        assertThat(mensaje.getValue().getText()).contains("RF-42");
    }
}
