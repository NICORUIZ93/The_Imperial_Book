package academia.ddd.envios;

/**
 * Modelo de Envíos. Aquí «pedido» no existe: Envíos habla de paquetes, destinos y bultos.
 * La misma realidad (lo que compró el cliente) tiene otro modelo en otro contexto delimitado.
 */
public record Envio(String guia, String referenciaVenta, String destino, int bultos, Estado estado) {

    public enum Estado { POR_DESPACHAR, EN_RUTA, ENTREGADO }
}
