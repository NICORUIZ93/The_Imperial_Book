package academia.carga;

import static io.gatling.javaapi.core.CoreDsl.StringBody;
import static io.gatling.javaapi.core.CoreDsl.constantUsersPerSec;
import static io.gatling.javaapi.core.CoreDsl.global;
import static io.gatling.javaapi.core.CoreDsl.jsonPath;
import static io.gatling.javaapi.core.CoreDsl.listFeeder;
import static io.gatling.javaapi.core.CoreDsl.rampUsersPerSec;
import static io.gatling.javaapi.core.CoreDsl.scenario;
import static io.gatling.javaapi.http.HttpDsl.http;
import static io.gatling.javaapi.http.HttpDsl.status;

import io.gatling.javaapi.core.ScenarioBuilder;
import io.gatling.javaapi.core.Simulation;
import io.gatling.javaapi.http.HttpProtocolBuilder;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Módulo 32 · F184 · La misma simulación que f184-carga-gatling/src/reservas.gatling.js, con el DSL de Java:
 * modelo abierto (rampa de 1 a 60 reservas/s en 5 s y 60/s durante 20 s) y aserciones del SLO de la API.
 */
public class ReservasSimulation extends Simulation {

    private static final String URL = System.getProperty("url", "http://localhost:8080");
    private static final int TASA = Integer.getInteger("tasa", 60);
    private static final int SEGUNDOS = Integer.getInteger("segundos", 20);

    private final HttpProtocolBuilder protocolo = http.baseUrl(URL)
            .acceptHeader("application/json").contentTypeHeader("application/json");

    private final ScenarioBuilder reservar = scenario("Reservar una entrada")
            .feed(listFeeder(List.<Map<String, Object>>of(
                    Map.of("apiKey", "clave-web"), Map.of("apiKey", "clave-movil"), Map.of("apiKey", "clave-socio"))).circular())
            .exec(session -> session.set("clave", UUID.randomUUID().toString()))
            .exec(http("POST /reservas").post("/reservas")
                    .header("X-Api-Key", "#{apiKey}").header("Idempotency-Key", "#{clave}")
                    .body(StringBody("{\"eventoId\":\"concierto-1\",\"clienteId\":\"#{apiKey}\",\"importe\":80,\"tarjeta\":\"4242-OK\"}"))
                    .check(status().is(202), jsonPath("$.reservaId").saveAs("reservaId")))
            .exec(http("GET /reservas/{id}").get("/reservas/#{reservaId}").header("X-Api-Key", "#{apiKey}")
                    .check(status().is(200)));

    {
        setUp(reservar.injectOpen(rampUsersPerSec(1).to(TASA).during(5), constantUsersPerSec(TASA).during(SEGUNDOS)))
                .protocols(protocolo)
                .assertions(global().responseTime().percentile(99).lt(300), global().failedRequests().percent().lt(1.0));
    }
}
