package academia.seguridad.intercambio;

import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

@RestController
class PagarController {

    private final ClienteSts sts;
    private final RestClient pagos;

    PagarController(ClienteSts sts, RestClient.Builder builder, @Value("${tienda.pagos.url}") String urlPagos) {
        this.sts = sts;
        this.pagos = builder.baseUrl(urlPagos).build();
    }

    /** DESPUÉS (seguro): canjea el token de ana por uno solo para pagos y llama con ese. */
    @PostMapping("/pedidos/{id}/pagar")
    Map<?, ?> pagar(@PathVariable long id, @AuthenticationPrincipal Jwt usuario) {
        try {
            String paraPagos = sts.canjear(usuario.getTokenValue(), "pagos", "pagos:cobrar");
            return pagos.post().uri("/cobros")
                .headers(h -> h.setBearerAuth(paraPagos))
                .body(Map.of("pedido", id))
                .retrieve()
                .body(Map.class);
        } catch (RestClientResponseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "no se pudo cobrar: " + e.getStatusCode());
        }
    }
}
