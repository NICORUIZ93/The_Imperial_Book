package academia.strangler;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

/** La fachada: TODO el tráfico entra aquí y se reenvía al destino que dicta la tabla de rutas. */
@RestController
class FachadaStrangler {

    private static final Logger log = LoggerFactory.getLogger(FachadaStrangler.class);
    private final RestClient http;
    private final TablaDeRutas tabla;
    private final StranglerProperties props;

    FachadaStrangler(RestClient.Builder builder, StranglerProperties props) {
        this.http = builder.build();
        this.props = props;
        this.tabla = new TablaDeRutas(props.rutas());
    }

    @RequestMapping("/**")
    ResponseEntity<String> reenviar(HttpServletRequest peticion, @RequestBody(required = false) String cuerpo) {
        String ruta = peticion.getRequestURI();
        String destino = tabla.destinoPara(ruta);
        String url = props.destinos().get(destino) + ruta
                + (peticion.getQueryString() == null ? "" : "?" + peticion.getQueryString());
        var solicitud = http.method(HttpMethod.valueOf(peticion.getMethod())).uri(url);
        if (peticion.getContentType() != null) {
            solicitud.header(HttpHeaders.CONTENT_TYPE, peticion.getContentType());
        }
        if (cuerpo != null) {
            solicitud.body(cuerpo);
        }
        // onStatus(... -> true): los 4xx/5xx del destino se devuelven tal cual, no se convierten en excepción.
        ResponseEntity<String> respuesta = solicitud.retrieve()
                .onStatus(estado -> true, (req, res) -> { })
                .toEntity(String.class);
        log.info("{} {} -> {} ({})", peticion.getMethod(), ruta, destino, respuesta.getStatusCode().value());
        var salida = ResponseEntity.status(respuesta.getStatusCode()).header("X-Servido-Por", destino);
        String tipo = respuesta.getHeaders().getFirst(HttpHeaders.CONTENT_TYPE);
        if (tipo != null) {
            salida.header(HttpHeaders.CONTENT_TYPE, tipo);
        }
        return salida.body(respuesta.getBody());
    }
}
