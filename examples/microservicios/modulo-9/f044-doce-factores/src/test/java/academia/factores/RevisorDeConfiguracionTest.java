package academia.factores;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;
import org.junit.jupiter.api.Test;

class RevisorDeConfiguracionTest {

    @Test
    void detectaSecretosYDireccionesFijas() {
        var hallazgos = RevisorDeConfiguracion.revisar(List.of(
                "spring.datasource.url=jdbc:postgresql://localhost:5432/tienda",
                "spring.datasource.password=Sup3rS3creta",
                "tienda.moneda=COP"));
        assertEquals(List.of(
                "línea 1: dirección de un entorno concreto (spring.datasource.url)",
                "línea 2: secreto en el archivo (spring.datasource.password)"), hallazgos);
    }

    @Test
    void aceptaValoresQueVienenDelEntorno() {
        assertEquals(List.of(), RevisorDeConfiguracion.revisar(List.of(
                "spring.datasource.url=${BD_URL}", "spring.datasource.password=${BD_PASSWORD}")));
    }
}
