package academia.rutaflow.modulith;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

class ArquitecturaModularTest {
    @Test
    void modulosNoFormanCiclosNiAccedenAInternos() {
        ApplicationModules.of(RutaFlowModulithApplication.class).verify();
    }
}
