package academia.balanceo;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class CatalogoCliente {

    private final RestClient rest;

    CatalogoCliente(RestClient.Builder balanceado) {
        // "catalogo" se resuelve en CADA llamada: el balanceador elige una instancia de la lista.
        this.rest = balanceado.baseUrl("http://catalogo").build();
    }

    public String quienAtiende() {
        return rest.get().uri("/quien").retrieve().body(String.class);
    }
}
