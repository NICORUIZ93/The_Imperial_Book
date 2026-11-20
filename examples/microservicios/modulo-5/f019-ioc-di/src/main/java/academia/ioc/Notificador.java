package academia.ioc;

/** El servicio depende de esta abstracción, no de una clase concreta. */
public interface Notificador {
    String enviar(String mensaje);
}
