package academia.rutaflow.mail;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
public class JavaMailCorreoGateway implements CorreoGateway {
    private final JavaMailSender sender;
    private final String remitente;

    public JavaMailCorreoGateway(JavaMailSender sender,
                                 @Value("${app.mail.from}") String remitente) {
        this.sender = sender;
        this.remitente = remitente;
    }

    @Override
    public void enviar(Correo correo) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(remitente);
        message.setTo(correo.destinatario());
        message.setSubject(correo.asunto());
        message.setText(correo.texto());
        sender.send(message);
    }
}
