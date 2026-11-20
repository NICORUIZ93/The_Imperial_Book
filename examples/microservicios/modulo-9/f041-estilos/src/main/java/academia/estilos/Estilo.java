package academia.estilos;

/** Los tres estilos que compara la ficha F041. */
public enum Estilo {
    /** Un solo desplegable, dividido por dentro en módulos con fronteras claras. */
    MONOLITO_MODULAR,
    /** Servicios pequeños, cada uno con sus datos y su despliegue independiente. */
    MICROSERVICIOS,
    /** Servicios de negocio grandes, reutilizados por toda la empresa a través de un bus (ESB). */
    SOA
}
