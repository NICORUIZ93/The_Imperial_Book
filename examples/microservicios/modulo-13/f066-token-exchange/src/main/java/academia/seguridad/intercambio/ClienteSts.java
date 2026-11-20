package academia.seguridad.intercambio;

import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

/** Pide al servidor de autorización (Keycloak) un token nuevo para otra audiencia: RFC 8693 §2.1. */
@Component
class ClienteSts {

    static final String GRANT = "urn:ietf:params:oauth:grant-type:token-exchange";
    static final String ACCESS_TOKEN = "urn:ietf:params:oauth:token-type:access_token";

    private final RestClient http;
    private final String tokenUri;

    ClienteSts(RestClient.Builder builder,
               @Value("${tienda.sts.token-uri}") String tokenUri,
               @Value("${tienda.sts.client-id}") String clientId,
               @Value("${tienda.sts.client-secret}") String clientSecret) {
        this.http = builder.defaultHeaders(h -> h.setBasicAuth(clientId, clientSecret)).build();  // cliente confidencial
        this.tokenUri = tokenUri;
    }

    String canjear(String tokenDelUsuario, String audiencia, String scope) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", GRANT);
        form.add("subject_token", tokenDelUsuario);
        form.add("subject_token_type", ACCESS_TOKEN);
        form.add("requested_token_type", ACCESS_TOKEN);
        form.add("audience", audiencia);
        form.add("scope", scope);
        Map<?, ?> respuesta = http.post().uri(tokenUri)
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(form)
            .retrieve()
            .body(Map.class);
        return (String) respuesta.get("access_token");
    }
}
