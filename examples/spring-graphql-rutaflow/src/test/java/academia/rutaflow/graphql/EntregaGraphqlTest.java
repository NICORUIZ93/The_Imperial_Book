package academia.rutaflow.graphql;

import static org.assertj.core.api.Assertions.assertThat;
import java.time.Duration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.graphql.ExecutionGraphQlService;
import org.springframework.graphql.test.tester.ExecutionGraphQlServiceTester;
import reactor.test.StepVerifier;

@SpringBootTest
class EntregaGraphqlTest {
    @Autowired ExecutionGraphQlService service;
    @Autowired EntregaController controller;
    ExecutionGraphQlServiceTester tester;
    @BeforeEach void preparar() {
        controller.reiniciar();
        tester = ExecutionGraphQlServiceTester.create(service);
    }
    @Test void consultaValidaYRechazaCampoInexistente() {
        tester.document("{ entrega(id: \"ENV-1\") { id estado } }")
            .execute().path("entrega.estado").entity(String.class).isEqualTo("CREADA");
        tester.document("{ entrega(id: \"ENV-1\") { secreto } }")
            .execute().errors().satisfy(errors -> assertThat(errors).isNotEmpty());
    }
    @Test void batchResuelveDosEntregasEnUnaInvocacion() {
        tester.document("{ entregas { id conductor { nombre } } }").execute()
            .path("entregas[*].conductor.nombre").entityList(String.class).containsExactly("Ana", "Ana");
        assertThat(controller.consultasEnLote()).isEqualTo(1);
    }
    @Test void mutacionEmiteCambioALaSuscripcionLocal() {
        var flujo = tester.document("subscription { cambio { id estado } }")
            .executeSubscription().toFlux("cambio", EntregaController.Entrega.class);
        StepVerifier.create(flujo)
            .then(() -> tester.document("mutation { cambiarEstado(id: \"ENV-1\", estado: \"EN_RUTA\") { estado } }")
                .execute().path("cambiarEstado.estado").entity(String.class).isEqualTo("EN_RUTA"))
            .assertNext(e -> assertThat(e.estado()).isEqualTo("EN_RUTA"))
            .thenCancel().verify(Duration.ofSeconds(5));
    }
    @Test void idAusenteEsNullYEstadoInvalidoEsError() {
        tester.document("{ entrega(id: \"NO-EXISTE\") { id } }")
            .execute().path("entrega").valueIsNull();
        tester.document("mutation { cambiarEstado(id: \"ENV-1\", estado: \"INVENTADO\") { id } }")
            .execute().errors().satisfy(errors -> assertThat(errors).isNotEmpty());
    }
}
