package academia.rest;

import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.restclient.RestTemplateBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/** 1. RestTemplate: síncrono, API de métodos (getForObject...). En mantenimiento: no recibe funciones nuevas. */
@Component
public class ClienteRestTemplate {

    private final RestTemplate rest;

    public ClienteRestTemplate(RestTemplateBuilder builder, @Value("${inventario.url}") String url,
            @Value("${inventario.timeout}") Duration timeout) {
        this.rest = builder.baseUri(url).connectTimeout(timeout).readTimeout(timeout).build();
    }

    public Existencia consultar(String sku) {
        return rest.getForObject("/inventario/{sku}", Existencia.class, sku);
    }
}
