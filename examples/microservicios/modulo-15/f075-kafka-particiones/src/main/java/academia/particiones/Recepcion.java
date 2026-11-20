package academia.particiones;

/** Qué hilo (consumidor) del grupo recibió qué registro, y de qué partición. */
public record Recepcion(String grupo, String hilo, int particion, String clave, String valor) {
}
