package academia.graphql;

import static org.assertj.core.api.Assertions.assertThat;

import graphql.ErrorType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.graphql.test.autoconfigure.GraphQlTest;
import org.springframework.context.annotation.Import;
import org.springframework.graphql.test.tester.GraphQlTester;

/** @GraphQlTest carga el esquema y los controladores GraphQL, sin servidor HTTP. */
@GraphQlTest(CatalogoController.class)
@Import({Catalogo.class, Resenas.class})
class CatalogoGraphQlTest {

    @Autowired
    GraphQlTester graphQl;

    @Autowired
    Resenas resenas;

    @Test
    void elClienteRecibeSoloLosCamposQuePidio() {
        graphQl.document("{ producto(sku: \"CAFE\") { nombre precio } }")
            .execute()
            .path("producto.nombre").entity(String.class).isEqualTo("Café de Huila 500 g")
            .path("producto.precio").entity(Integer.class).isEqualTo(32000)
            .path("producto.sku").pathDoesNotExist();
    }

    @Test
    void lasResenasDeTodosLosProductosSeCarganEnUnaSolaLlamada() {
        int antes = resenas.llamadas.get();
        graphQl.document("{ productos { sku resenas { estrellas } } }")
            .execute()
            .path("productos[*].sku").entityList(String.class).containsExactly("CAFE", "TAZA", "FILTRO")
            .path("productos[0].resenas[*].estrellas").entityList(Integer.class).containsExactly(5, 4);
        assertThat(resenas.llamadas.get() - antes).isEqualTo(1);   // no 3: sin N+1
    }

    @Test
    void unCampoQueNoExisteEnElEsquemaEsUnErrorDeValidacion() {
        graphQl.document("{ productos { sku costo } }")
            .execute()
            .errors()
            .expect(e -> e.getErrorType() == ErrorType.ValidationError && e.getMessage().contains("costo"))
            .verify();
    }

    @Test
    void laMutacionValidaSusArgumentos() {
        graphQl.document("mutation { calificar(sku: \"FILTRO\", estrellas: 9) { estrellas } }")
            .execute()
            .errors()
            .expect(e -> e.getPath().equals("calificar"))
            .verify();
    }
}
