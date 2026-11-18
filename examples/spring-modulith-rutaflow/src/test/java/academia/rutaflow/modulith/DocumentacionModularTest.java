package academia.rutaflow.modulith;

import static org.assertj.core.api.Assertions.assertThat;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;
import org.springframework.modulith.docs.Documenter;

class DocumentacionModularTest {
    @Test void generaMapaYFichasDesdeLosModulos() throws Exception {
        var modules = ApplicationModules.of(RutaFlowModulithApplication.class);
        new Documenter(modules).writeDocumentation();
        Path output = Path.of("target/spring-modulith-docs");
        try (var files = Files.list(output)) {
            var names = files.map(p -> p.getFileName().toString()).toList();
            assertThat(names).anyMatch(n -> n.endsWith(".puml"));
            assertThat(names).anyMatch(n -> n.endsWith(".adoc"));
        }
    }
}
