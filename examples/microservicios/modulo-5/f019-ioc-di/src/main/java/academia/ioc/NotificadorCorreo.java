package academia.ioc;

import org.springframework.stereotype.Component;

@Component // Spring lo descubre al escanear el paquete y crea UNA instancia (singleton)
public class NotificadorCorreo implements Notificador {
    @Override
    public String enviar(String mensaje) {
        return "Correo enviado: " + mensaje;
    }
}
