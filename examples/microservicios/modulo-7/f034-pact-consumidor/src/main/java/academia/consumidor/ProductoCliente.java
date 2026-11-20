package academia.consumidor;

import org.springframework.web.client.RestClient;

/** Cliente HTTP de la tienda hacia el servicio "catalogo". */
public class ProductoCliente {

    private final RestClient http;

    public ProductoCliente(String urlBase) {
        this.http = RestClient.create(urlBase);
    }

    /** GET /productos/{id}. Un 404 se convierte en HttpClientErrorException.NotFound. */
    public Producto obtener(long id) {
        return http.get().uri("/productos/{id}", id).retrieve().body(Producto.class);
    }
}
